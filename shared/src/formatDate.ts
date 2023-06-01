export function formatDate(dateTimestamp: number): string {
  const date = new Date(dateTimestamp)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, -5) // e.g.: '2023-04-13T20:10:18'
}
