import { ZettelExtensions } from '@zettelooo/extension-api'
import { Slot } from 'shared'

export const renderReservedMessage: ZettelExtensions.Helper<'cardBlock', 'cardBlock', [slotStatus: Slot.Status], void> =
  function ({ cardBlockApi }, slotStatus) {
    this.register(
      cardBlockApi.registry.appendedHtmlContent(() => ({
        initialState: undefined,
        render: ({ renderContext, un }) => ({
          html: `
<style>
  #${un.root} {
    color: ${renderContext.theme.palette.success.main};
  }
</style>

<div id="${un.root}">
  ✔️ This time is reserved by
  <strong>
    ${(slotStatus.type === 'reserved' && slotStatus.name) || ''}
  </strong>
</div>
`,
        }),
      }))
    )
  }
