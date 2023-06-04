export function stringifyDate(date: Date | number | string): string {
  const raw = new Date(date).toString()
  return raw.slice(4, raw.indexOf('(') - 1)
}
