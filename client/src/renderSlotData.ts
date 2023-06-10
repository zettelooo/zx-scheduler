import { ZettelExtensions } from '@zettelooo/extension-api'
import { CardExtensionData, PageExtensionData } from 'shared'

export const renderSlotData: ZettelExtensions.Helper<'card', 'card', [], void, PageExtensionData, CardExtensionData> =
  function ({ cardApi }) {
    this.register(
      cardApi.registry.extendedHtmlContent(() => ({
        initialState: undefined,
        render: ({ renderContext, un }) => {
          if (!cardApi.data.card.extensionData?.accepted) return { html: '' }
          const fromDate = new Date(cardApi.data.card.extensionData.fromTimestamp)
          const fromDateString = fromDate.toDateString()
          const fromTimeString = `${fromDate.getHours().toString().padStart(2, '0')}:${fromDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}`
          const from = `${fromDateString} ${fromTimeString}`
          const toDate = new Date(cardApi.data.card.extensionData.toTimestamp)
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
        originalContent: 'must hide',
      }))
    )
  }
