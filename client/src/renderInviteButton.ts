import { ZettelExtensions } from '@zettelooo/extension-api'
import { sendReservationRequest } from './services/sendReservationRequest'

export const renderInviteButton: ZettelExtensions.Helper<'cardBlock', 'activated' | 'cardBlock', [], void> = function ({
  activatedApi,
  cardBlockApi,
}) {
  this.register(
    cardBlockApi.registry.appendedHtmlContent(() => ({
      initialState: undefined,
      render: ({ renderContext, un }) => ({
        html: `<div id="${un.root}"></div>`,
        onRendered: ({ sanitizedHtml, containerElement, currentContext }) => {
          const root = containerElement.querySelector(`#${un.root}`) as HTMLDivElement

          const buttonRegistration = this.register(
            activatedApi.registry.renderedButton(() => ({
              container: root,
              label: 'Reserve',
              variant: 'outlined',
              size: 'small',
              fullWidth: true,
              color: 'primary',
              onClick: async () => {
                try {
                  buttonRegistration.reference.current?.update({
                    label: 'Reserving...',
                    disabled: true,
                  })
                  const email = await activatedApi.access.inputString({
                    prompt: 'Your email',
                    placeholder: 'your@email.com',
                  })
                  if (email) {
                    const name = await activatedApi.access.inputString({
                      prompt: 'Your name',
                      placeholder: 'Your name',
                    })
                    if (name) {
                      const { emailSuccess } = await sendReservationRequest(cardBlockApi.target.cardId, email, name)
                      activatedApi.access.showMessage(
                        'Successfully reserved!',
                        emailSuccess ? 'An invitation email has been sent.' : 'Unable to send an invitation email.',
                        { variant: emailSuccess ? 'success' : 'warning' }
                      )
                      return
                    }
                  }
                  buttonRegistration.reference.current?.update({
                    label: 'Reserve',
                    disabled: false,
                  })
                } catch (error) {
                  console.error(error)
                  activatedApi.access.showMessage('Reservation failed', 'Unable to reserve this time availability.', {
                    variant: 'error',
                  })
                  buttonRegistration.reference.current?.update({
                    label: 'Reserve',
                    disabled: false,
                  })
                }
              },
            }))
          )

          return {
            onCleanUp: () => {
              buttonRegistration.deactivate()
            },
          }
        },
      }),
    }))
  )
}
