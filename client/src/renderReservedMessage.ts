import { ZettelExtensions } from '@zettelooo/extension-api'
import { CardExtensionData } from 'shared'

export const renderReservedMessage: ZettelExtensions.Helper<'cardBlock', 'cardBlock', [], void> = function ({
  cardBlockApi,
}) {
  this.register(
    cardBlockApi.registry.appendedHtmlContent(() => ({
      initialState: undefined,
      render: ({ renderContext, un }) => {
        const cardExtensionData = cardBlockApi.data.card.extensionData as CardExtensionData
        return {
          html: `
<style>
  #${un.root} {
    color: ${renderContext.theme.palette.success.main};
  }
</style>

<div id="${un.root}">
  ✔️ This time is reserved by
  <strong>
    ${(cardExtensionData?.accepted && cardExtensionData.reservedBy?.name) || ''}
  </strong>
</div>
`,
        }
      },
    }))
  )
}
