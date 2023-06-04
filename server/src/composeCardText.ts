import { CardExtensionData } from 'shared'

export function composeCardText(cardExtensionData: CardExtensionData): string | null {
  let text: string | null = null

  if (cardExtensionData?.accepted) {
    const from = new Date(cardExtensionData.fromTimestamp)
    const fromDate = from.toDateString()
    const fromTime = from.toTimeString().slice(0, 5)
    const to = new Date(cardExtensionData.toTimestamp)
    const toDate = to.toDateString()
    const toTime = to.toTimeString().slice(0, 5)

    text =
      fromDate === toDate
        ? `On ${fromDate}, from ${fromTime} to ${toTime}`
        : `From ${fromDate} ${fromTime} to ${toDate} ${toTime}`

    if (cardExtensionData.reservedBy) {
      text += `\nResereved by ${cardExtensionData.reservedBy.name} (${cardExtensionData.reservedBy.email})`
    }
  }

  return text
}
