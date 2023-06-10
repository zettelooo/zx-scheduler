import { ZettelExtensions } from '@zettelooo/extension-api'
import { CardExtensionData, PageExtensionData } from 'shared'

export const renderReservedMessage: ZettelExtensions.Helper<
  'card',
  'card',
  [],
  void,
  PageExtensionData,
  CardExtensionData
> = function ({ cardApi }) {
  this.register(
    cardApi.registry.extendedHtmlContent(() => ({
      initialState: undefined,
      render: ({ renderContext, un }) => {
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
    ${(cardApi.data.card.extensionData?.accepted && cardApi.data.card.extensionData.reservedBy?.name) || ''}
  </strong>
</div>
`,
        }
      },
    }))
  )
}
