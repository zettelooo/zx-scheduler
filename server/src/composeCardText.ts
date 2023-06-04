import { CardExtensionData } from 'shared'

export function composeCardText(cardExtensionData: CardExtensionData): string | null {
  let text: string | null = null

  if (cardExtensionData?.accepted) {
    const from = new Date(cardExtensionData.fromTimestamp).toUTCString() // e.g.: 'Sun, 04 Jun 2023 14:14:08 GMT'
    const fromDate = from.slice(0, 16)
    const fromTime = from.slice(17, 22)
    const to = new Date(cardExtensionData.toTimestamp).toUTCString() // e.g.: 'Sun, 04 Jun 2023 14:14:08 GMT'
    const toDate = to.slice(0, 16)
    const toTime = to.slice(17, 22)

    text =
      fromDate === toDate
        ? `On ${fromDate}, from ${fromTime} to ${toTime} UTC`
        : `From ${fromDate} ${fromTime} to ${toDate} ${toTime} UTC`

    if (cardExtensionData.reservedBy) {
      text += `\nResereved by ${cardExtensionData.reservedBy.name} (${cardExtensionData.reservedBy.email})`
    }
  }

  return text
}
