import { ExtractDuration } from 'shared'
import { openAiApi } from './openAiApi'

export async function extractDuration(input: ExtractDuration.Input): Promise<ExtractDuration.Output> {
  const chatCompletion = await openAiApi.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `
You will be given a scheduling description and you must figure out the length of event or call or meeting, and then respond with the equivalent length in number of minutes.
Round the answer, it shouldn't have any fractional digits.
No extra characters, no explanations, no prefix, no postfix, only answer with the resulted number as a series of digits.
If the description is irrelevant or insufficient or incorrect, just answer with 0.
You will be given a sequence of few-shot-learning samples first.
`,
      },
      {
        role: 'user',
        content: `
[Description]: We need to have a call, maybe it'll take half a hour. I'm free tomorrow, let's schedule the call.
[DurationInMinutes]: 30
###
[Description]: i need to schedule a two hour meeting with my students tomorrow from 9am to 5pm
[DurationInMinutes]: 120
###
[Description]: Make me a scheduler. I'm free tomorrow from 9am to 11am. Every call is 30min
[DurationInMinutes]: 30
###
[Description]: I want others to book calls with me only on my working hours.
[DurationInMinutes]: 0
###
[Description]: My plan is to meet you for about three quarters each week. How can I do that?
[DurationInMinutes]: 45
###
[Description]: Let people schedule 40 min calls with me using this page.
[DurationInMinutes]: 40
###
[Description]: To be a good chief, you need to be passionate, innovative, and experienced. You can not master being a chief with just 2 hours of reading books!
[DurationInMinutes]: 0
###
[Description]: I'm available tomorrow between 14:00 to 18:00.
[DurationInMinutes]: 0
###
[Description]: ${input.description.split('\n').join(' ')}
[DurationInMinutes]: `,
      },
    ],
    max_tokens: 10,
    temperature: 0,
  })
  const answer = chatCompletion.data.choices[0].message?.content ?? ''
  try {
    const durationMinutes = Number(answer)
    if (Number.isNaN(durationMinutes) || durationMinutes <= 0) return { accepted: false }
    return { accepted: true, durationMinutes }
  } catch {
    return { accepted: false }
  }
}
