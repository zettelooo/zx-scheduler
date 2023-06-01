const REGEXP = /^[^@]+@[^@]{2,}\.[^@]{2,}$/

export function isValidEmail(email: string): boolean {
  return email.length < 256 && REGEXP.test(email)
}
