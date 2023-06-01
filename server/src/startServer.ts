import { ZettelTypes } from '@zettelooo/api-types'
import { generateSequence } from '@zettelooo/commons'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import path from 'path'
import { ExtractAvailabilities, ExtractDuration, Slot, isValidEmail } from 'shared'
import { extractAvailabilities } from './extractAvailabilities'
import { extractDuration } from './extractDuration'
import { generateId } from './generateId'
import { restApiClient } from './restApiClient'
import { sendMail } from './sendMail'

export function startServer(): void {
  const port = Number(process.env.PORT || 4000)

  const app = express()

  app.set('port', port)
  app.use(morgan('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cors())

  app.use('/static', express.static(path.join(__dirname, '..', 'public')))

  app.post('/extract-duration', async (req, res, next) => {
    try {
      const { input } = req.body as { input: ExtractDuration.Input }
      // TODO: Validate input
      const output = await extractDuration(input)
      res.json({ output })
    } catch (error) {
      next(error)
    }
  })

  app.post('/extract-availabilities', async (req, res, next) => {
    try {
      const { input } = req.body as { input: ExtractAvailabilities.Input }
      // TODO: Validate input
      const output = await extractAvailabilities(input)
      res.json({ output })
    } catch (error) {
      next(error)
    }
  })

  app.post('/page/:pageId/availability', async (req, res, next) => {
    try {
      const { pageId } = req.params
      const { devidedAvailableSlots, durationMinutes } = req.body as {
        devidedAvailableSlots: Slot[]
        durationMinutes: number
      }
      // TODO: Verify inputs
      const {
        pages: [page],
      } = await restApiClient.getPages({ pageIds: [pageId], withExtensionInstalled: true })
      if (!page) {
        res.sendStatus(404)
        return
      }
      const now = Date.now()
      await Promise.all(
        devidedAvailableSlots.map(async (slot, index, array) =>
          restApiClient.addCard({
            card: {
              ownerUserId: page.ownerUserId,
              pageId,
              sequence: generateSequence({
                timestampMicroseconds: now,
                offset: index - array.length,
              }),
              blocks: Slot.generateBlocks(slot, { type: 'not reserved' }, generateId),
            },
          })
        )
      )
      res.json({ accepted: true })
    } catch (error) {
      next(error)
    }
  })

  app.post('/card/:cardId/reserve', async (req, res, next) => {
    try {
      const { cardId } = req.params
      const { email, name } = req.body
      if (!email || typeof email !== 'string' || !isValidEmail(email)) {
        res.sendStatus(400)
        return
      }
      const {
        cards: [card],
      } = await restApiClient.getCards({ cardIds: [cardId] })
      if (!card) {
        res.sendStatus(404)
        return
      }
      const {
        users: [ownerUser],
      } = await restApiClient.getUsers({ userIds: [card.ownerUserId] })
      if (!ownerUser) {
        res.sendStatus(404)
        return
      }
      let emailSuccess = false
      const { slotStatus } = Slot.parseBlocks(card.blocks)
      if (slotStatus.type === 'not reserved') {
        await restApiClient.editCard({
          cardId,
          updates: {
            blocks: Slot.updateBlocksSlotStatus(card.blocks, { type: 'reserved', name, email }),
          },
        })
        try {
          const time = (card.blocks[0] as ZettelTypes.Extension.Entity.Block<ZettelTypes.Model.Block.Type.Paragraph>)
            .text
          const { success } = await sendMail(
            'scheduler@zettel.ooo',
            ownerUser.name,
            email,
            name,
            `Scheduled meeting by Zettel module: Scheduler`,
            `
  <p>Hi, ${name}!</p>
  <p>${ownerUser.name} invited you to a call on the following time:</p>
  <p>• <strong>${time}</strong></>
  <p>You may follow up from <a href="mailto:${ownerUser.email}">this email address</a>.</p>
  <p>All the best,</p>
  <p>Zettel module; Scheduler.</p>
  `
          )
          emailSuccess = success
        } catch {
          emailSuccess = false
        }
      }
      res.json({ emailSuccess })
    } catch (error) {
      next(error)
    }
  })

  app.listen(port, () => console.log(`Listening on port ${port}.`))
}
