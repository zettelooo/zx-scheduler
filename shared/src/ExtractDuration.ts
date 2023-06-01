export namespace ExtractDuration {
  export interface Input {
    readonly description: string
  }

  export type Output =
    | {
        readonly accepted: false
      }
    | {
        readonly accepted: true
        readonly durationMinutes: number
      }
}
