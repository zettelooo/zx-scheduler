import { ZettelTypes } from '@zettelooo/api-types'
import { CardExtensionData } from 'shared'
import { openAiApi } from './openAiApi'

export async function extractCardUpdates(
  card: Pick<ZettelTypes.Extension.Entity.Card<CardExtensionData>, 'id' | 'blocks'>,
  cardExtensionData: CardExtensionData
): Promise<ZettelTypes.Extension.Service.Rest.EditCard.Request<CardExtensionData>['updates']> {
  const chatCompletion = await openAiApi.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `
You are an assistant meant to help modify the reservation status of an event describing text.
The text is given as an JSON stringified array of strings.
Only modify the parts that are related and don't touch the other paragraphs.
It's prefered to update one of the existing paragraphs.
However, if there is no existing paragraph that contains reservation status, you can add a new paragraph at the end to put the new reservation status.
Only complete the prompt with a JSON array of paragraph texts, nothing else.
`,
      },
      {
        role: 'user',
        content: `
[Paragraphs]: ["Hello! My name is Ilika.", "I want to let you know that I'm free on the following time:\nTomorrow from 10pm to 11pm.", "Is this already reserved? Yes! By { name: 'Mina', email: 'mina@gmail.com' }.", "This card has been visited 103 times."]
[New Reservation Status]: Not reserved
[Updated Paragraphs]: ["Hello! My name is Ilika.", "I want to let you know that I'm free on the following time:\nTomorrow from 10pm to 11pm.", "Is this already reserved? No.", "This card has been visited 103 times."]
###
[Paragraphs]: ["Hello! My name is Ilika.", "I want to let you know that I'm free on the following time:\nTomorrow from 10pm to 11pm.", "Is this already reserved? Yes! By { name: 'Mina', email: 'mina@gmail.com' }.", "This card has been visited 103 times."]
[New Reservation Status]: Reserved by "Dory Peterson" (dori.peterson@gmail.com)
[Updated Paragraphs]: ["Hello! My name is Ilika.", "I want to let you know that I'm free on the following time:\nTomorrow from 10pm to 11pm.", "Is this already reserved? Yes! By { name: 'Dori', email: 'dori.peterson@gmail.com' }.", "This card has been visited 103 times."]
###
[Paragraphs]: ["On 23 Mar 2023, from 10:00 to 12:30 UTC"]
[New Reservation Status]: Reserved by "Dory Peterson" (dori.peterson@gmail.com)
[Updated Paragraphs]: ["On 23 Mar 2023, from 10:00 to 12:30 UTC", "Reserved by Dory Peterson (dofi.peterson@gmail.com)"]
###
[Paragraphs]: ["On 23 Mar 2023, from 10:00 to 12:30 UTC", "Reserved by Dory Peterson (dofi.peterson@gmail.com)"]
[New Reservation Status]: Not reserved.
[Updated Paragraphs]: ["On 23 Mar 2023, from 10:00 to 12:30 UTC"]
###
[Paragraphs]: ${JSON.stringify(
          card.blocks.map(block => (block.type === ZettelTypes.Model.Block.Type.Attachment ? '' : block.text))
        )}
[New Reservation Status]: ${
          cardExtensionData?.accepted && cardExtensionData.reservedBy
            ? `Reserved by "${cardExtensionData.reservedBy.name || '-'}" (${cardExtensionData.reservedBy.email || '-'})`
            : 'Not reserved'
        }
[Updated Paragraphs]: `,
      },
    ],
    max_tokens: 3000,
    temperature: 0,
  })
  const answer = chatCompletion.data.choices[0].message?.content ?? ''
  try {
    const newBlockTexts = JSON.parse(answer) as readonly string[]
    const oldBlocks = [...card.blocks]
    return {
      blocks: newBlockTexts.map(blockText => {
        const oldIndex = oldBlocks.findIndex(
          block =>
            (block.type === ZettelTypes.Model.Block.Type.Attachment && !blockText) ||
            (block.type !== ZettelTypes.Model.Block.Type.Attachment && block.text === blockText)
        )
        if (oldIndex >= 0) {
          const block = oldBlocks[oldIndex]
          oldBlocks.splice(0, oldIndex + 1)
          return block
        }
        return {
          type: ZettelTypes.Model.Block.Type.Paragraph,
          text: blockText,
          styleGroups: [],
          annotations: [],
          extensionData: {},
        }
      }),
      extensionData: cardExtensionData,
    }
  } catch {
    return {}
  }
}
