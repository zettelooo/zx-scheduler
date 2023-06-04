import { ZettelExtensions } from '@zettelooo/extension-api'
import { CardExtensionData } from 'shared'

export const renderSlotData: ZettelExtensions.Helper<'cardBlock', 'cardBlock', [], void> = function ({ cardBlockApi }) {
  this.register(
    cardBlockApi.registry.appendedHtmlContent(() => ({
      initialState: undefined,
      render: ({ renderContext, un }) => {
        const cardExtensionData = cardBlockApi.data.card.extensionData as CardExtensionData
        if (!cardExtensionData?.accepted) return { html: '' }
        const fromDate = new Date(cardExtensionData.fromTimestamp)
        const fromDateString = fromDate.toDateString()
        const fromTimeString = `${fromDate.getHours().toString().padStart(2, '0')}:${fromDate
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
        const from = `${fromDateString} ${fromTimeString}`
        const toDate = new Date(cardExtensionData.toTimestamp)
        const toDateString = toDate.toDateString()
        const toTimeString = `${toDate.getHours().toString().padStart(2, '0')}:${toDate
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
        const to = fromDateString === toDateString ? toTimeString : `${toDateString} ${toTimeString}`
        return {
          html: `
<style>
  #${un.root} {
    margin: ${renderContext.theme.unitPx * 1}px 0;
  }
</style>

<div id="${un.root}">
  ⌚ From <strong>${from}</strong> to <strong>${to}</strong>
</div>
`,
        }
      },
    }))
  )
}
