import { Timestamp } from '@zettelooo/commons'
import { ExtractAvailabilities } from 'shared'
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
`,
      },
      {
        role: 'user',
        content: `
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: i'm free tomorrow 9am-12pm
[Times]: [Apr 26 2023 09:00:00 GMT+0330 - Apr 26 2023 12:00:00 GMT+0330]
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: i'm free 10am-1pm
[Times]: [Apr 25 2023 10:00:00 GMT+0330 - Apr 25 2023 13:00:00 GMT+0330]
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: i'm available the day after tomorrow 9am-9pm
[Times]: [Apr 27 2023 09:00:00 GMT+0330 - Apr 27 2023 21:00:00 GMT+0330]
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: next friday 9am-12pm
[Times]: [Apr 28 2023 09:00:00 GMT+0330 - Apr 28 2023 12:00:00 GMT+0330]
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: from tomorrow until friday, 10:00 to 13:00
[Times]: [Apr 26 2023 10:00:00 GMT+0330 - Apr 26 2023 13:00:00 GMT+0330] [Apr 27 2023 10:00:00 GMT+0330 - Apr 27 2023 13:00:00 GMT+0330] [Apr 28 2023 10:00:00 GMT+0330 - Apr 28 2023 13:00:00 GMT+0330]
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: next week every working day from 11am-3pm, except for wednesday
[Times]: [May 01 2023 11:00:00 GMT+0330 - May 01 2023 15:00:00 GMT+0330] [May 02 2023 11:00:00 GMT+0330 - May 02 2023 15:00:00 GMT+0330] [May 04 2023 11:00:00 GMT+0330 - May 04 2023 15:00:00 GMT+0330] [May 05 2023 11:00:00 GMT+0330 - May 05 2023 15:00:00 GMT+0330]
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: all working hours next week
[Times]: [May 01 2023 09:00:00 GMT+0330 - May 01 2023 17:00:00 GMT+0330] [May 02 2023 09:00:00 GMT+0330 - May 02 2023 17:00:00 GMT+0330] [May 03 2023 09:00:00 GMT+0330 - May 03 2023 17:00:00 GMT+0330] [May 04 2023 09:00:00 GMT+0330 - May 04 2023 17:00:00 GMT+0330] [May 05 2023 09:00:00 GMT+0330 - May 05 2023 17:00:00 GMT+0330]
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: 9am-9pm
[Times]: [Apr 25 2023 09:00:00 GMT+0330 - Apr 25 2023 21:00:00 GMT+0330]
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: tomorrow 9am-11am and the day after tomorrow 11am-12pm
[Times]: [Apr 26 2023 09:00:00 GMT+0330 - Apr 26 2023 11:00:00 GMT+0330] [Apr 27 2023 11:00:00 GMT+0330 - Apr 27 2023 12:00:00 GMT+0330]
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: After my cake is baked
[Times]: -
###
[Current Time]: 25 Apr 2023 19:52:00 GMT+03:30
[Description]: some proper time which is suitable for me
[Times]: -
###
[Current Time]: ${input.currentTimestampStringified}
[Description]: ${input.description.split('\n').join(' ')}
[Times]: `,
      },
    ],
    max_tokens: 2000,
    temperature: 0,
  })
  const answer = chatCompletion.data.choices[0].message?.content ?? ''
  try {
    const matches = [...answer.matchAll(/\[(.+)\s-\s(.+)\]/g)]
    const availableSlots = matches.map<{
      readonly fromTimestamp: Timestamp
      readonly toTimestamp: Timestamp
    }>(([, from, to]) => ({
      fromTimestamp: new Date(from).getTime(),
      toTimestamp: new Date(to).getTime(),
    }))
    if (availableSlots.length === 0) return { accepted: false }
    return {
      accepted: true,
      availableSlots,
    }
  } catch {
    return { accepted: false }
  }
}
