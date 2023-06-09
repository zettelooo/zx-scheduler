import { ZettelExtensions } from '@zettelooo/extension-api'
import { Slot, stringifyDate } from 'shared'
import { extractAvailabilities } from './services/extractAvailabilities'
import { extractDuration } from './services/extractDuration'
import { sendAvailabilities } from './services/sendAvailabilities'

const COVERED_MISSING_MINUTES = 1

export const submitAvailabilities: ZettelExtensions.Helper<
  'pagePanel',
  'activated' | 'pagePanel',
  [
    {
      setQuickActionDisabled: (disabled: boolean) => void
      setLoadingIndicatorVisible: (visible: boolean) => void
      description?: string
    }
  ],
  Promise<void>
> = async function (
  { activatedApi, pagePanelApi },
  { setQuickActionDisabled, setLoadingIndicatorVisible, description }
) {
  try {
    setQuickActionDisabled(true)

    const currentTimestamp = Date.now()

    let availableSlots: readonly Slot[] | null = null
    {
      const askForAvailabilities = (): Promise<string | undefined> =>
        new Promise(resolve => {
          const commandLinePromptInputRegistration = this.register(
            pagePanelApi.registry.commandLinePromptInput(() => ({
              prompt: 'When are you available?',
              placeholder: 'e.g., tomorrow from 9am to 11am',
              required: true,
              onCancel() {
                commandLinePromptInputRegistration.deactivate()
                resolve(undefined)
              },
              onSubmit(value) {
                commandLinePromptInputRegistration.deactivate()
                resolve(value)
              },
            }))
          )
        })
      let availabilitiesDescription = description || (await askForAvailabilities())
      if (this.disposed) return
      while (availabilitiesDescription) {
        if (!availableSlots) {
          setLoadingIndicatorVisible(true)
          const output = await extractAvailabilities({
            description: availabilitiesDescription,
            currentTimestampStringified: stringifyDate(currentTimestamp),
          })
          if (this.disposed) return
          setLoadingIndicatorVisible(false)
          if (output.accepted) {
            availableSlots = output.availableSlots
          }
        }
        if (availableSlots) break
        availabilitiesDescription = await askForAvailabilities()
        if (this.disposed) return
      }
      if (!availableSlots) return
    }

    let durationMinutes: number | null = null
    {
      const askForDuration = (): Promise<string | undefined> =>
        new Promise(resolve => {
          const commandLinePromptInputRegistration = this.register(
            pagePanelApi.registry.commandLinePromptInput(() => ({
              prompt: 'How long is each meeting?',
              placeholder: 'e.g., half hour',
              required: true,
              onCancel() {
                commandLinePromptInputRegistration.deactivate()
                resolve(undefined)
              },
              onSubmit(value) {
                commandLinePromptInputRegistration.deactivate()
                resolve(value)
              },
            }))
          )
        })
      let durarationDescription = description || (await askForDuration())
      if (this.disposed) return
      while (durarationDescription) {
        if (!durationMinutes) {
          setLoadingIndicatorVisible(true)
          const output = await extractDuration({ description: durarationDescription })
          if (this.disposed) return
          setLoadingIndicatorVisible(false)
          if (output.accepted) {
            durationMinutes = output.durationMinutes
          }
        }
        if (durationMinutes) break
        durarationDescription = await askForDuration()
        if (this.disposed) return
      }
      if (!durationMinutes) return
    }

    const durationMilliseconds = durationMinutes * 60 * 1000
    const dividedAvailableSlots = availableSlots.flatMap<Slot>(slot => {
      const dividedSlots: Slot[] = []
      for (
        let fromTimestamp = Math.max(slot.fromTimestamp, currentTimestamp);
        fromTimestamp <= slot.toTimestamp - durationMilliseconds + COVERED_MISSING_MINUTES * 60 * 1000;
        fromTimestamp += durationMilliseconds
      ) {
        dividedSlots.push({
          fromTimestamp,
          toTimestamp: fromTimestamp + durationMilliseconds,
        })
      }
      return dividedSlots
    })

    if (dividedAvailableSlots.length > 0) {
      setLoadingIndicatorVisible(true)
      await sendAvailabilities(pagePanelApi.target.pageId, dividedAvailableSlots, durationMinutes)
      await new Promise(resolve => setTimeout(resolve, 2 * 1000))
      setLoadingIndicatorVisible(false)
    }
  } catch (error) {
    console.error(error)
    activatedApi.access.showMessage('Scheduler failed', 'Something went wrong while submitting your availabilities.', {
      variant: 'error',
    })
  } finally {
    setLoadingIndicatorVisible(false)
    setQuickActionDisabled(false)
  }
}
