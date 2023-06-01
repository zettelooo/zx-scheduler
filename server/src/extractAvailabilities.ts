import { ExtractAvailabilities, Slot } from 'shared'
import { openAiApi } from './openAiApi'

export async function extractAvailabilities(input: ExtractAvailabilities.Input): Promise<ExtractAvailabilities.Output> {
  const chatCompletion = await openAiApi.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `
You are an assistant meant to help extract exact time periods out of a description.
As a reference; "9am" means "9:00", "9pm" means "21:00", "12am" means "0:00", "12pm" means "12:00".
If no dates are specified explicitly, it means today.
You are given a sequence of few-shot learning examples:
`,
      },
      {
        role: 'user',
        content: `
[Now]: 2023-04-25T19:52:00
[Description]: i'm free tomorrow 9am-12pm
[Times]: [2023-04-26T09:00:00 2023-04-26T12:00:00]
###
[Now]: 2023-04-25T19:52:00
[Description]: i'm free 10am-1pm
[Times]: [2023-04-25T10:00:00 2023-04-25T13:00:00]
###
[Now]: 2023-04-25T19:52:00
[Description]: i'm available the day after tomorrow 9am-9pm
[Times]: [2023-04-27T09:00:00 2023-04-27T21:00:00]
###
[Now]: 2023-04-25T19:52:00
[Description]: next friday 9am-12pm
[Times]: [2023-04-28T09:00:00 2023-04-28T12:00:00]
###
[Now]: 2023-04-25T19:52:00
[Description]: from tomorrow until friday, 10:00 to 13:00
[Times]: [2023-04-26T10:00:00 2023-04-26T13:00:00] [2023-04-27T10:00:00 2023-04-27T13:00:00] [2023-04-28T10:00:00 2023-04-28T13:00:00]
###
[Now]: 2023-04-25T19:52:00
[Description]: next week every working day from 11am-3pm, except for wednesday
[Times]: [2023-05-01T11:00:00 2023-05-01T15:00:00] [2023-05-02T11:00:00 2023-05-02T15:00:00] [2023-05-04T11:00:00 2023-05-04T15:00:00] [2023-05-05T11:00:00 2023-05-05T15:00:00]
###
[Now]: 2023-04-25T19:52:00
[Description]: all working hours next week
[Times]: [2023-05-01T09:00:00 2023-05-01T17:00:00] [2023-05-02T09:00:00 2023-05-02T17:00:00] [2023-05-03T09:00:00 2023-05-03T17:00:00] [2023-05-04T09:00:00 2023-05-04T17:00:00] [2023-05-05T09:00:00 2023-05-05T17:00:00]
###
[Now]: 2023-04-25T19:52:00
[Description]: 9am-9pm
[Times]: [2023-04-25T09:00:00 2023-04-25T21:00:00]
###
[Now]: 2023-04-25T19:52:00
[Description]: tomorrow 9am-11am and the day after tomorrow 11am-12pm
[Times]: [2023-04-26T09:00:00 2023-04-26T11:00:00] [2023-04-27T11:00:00 2023-04-27T12:00:00]
###
[Now]: 2023-04-25T19:52:00
[Description]: After my cake is baked
[Times]: -
###
[Now]: 2023-04-25T19:52:00
[Description]: some proper time which is suitable for me
[Times]: -
###
[Now]: ${input.now}
[Description]: ${input.description.split('\n').join(' ')}
[Times]: `,
      },
    ],
    max_tokens: 2000,
    temperature: 0,
  })
  const answer = chatCompletion.data.choices[0].message?.content ?? ''
  try {
    const matches = [
      ...answer.matchAll(/\[(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d)\s(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d)\]/g),
    ]
    const availableSlots = matches.map<Slot.Unparsed>(([, from, to]) => ({ from, to }))
    if (availableSlots.length === 0) return { accepted: false }
    return {
      accepted: true,
      availableSlots,
    }
  } catch {
    return { accepted: false }
  }
}
