import { ZettelTypes } from '@zettelooo/api-types'
import { CardExtensionData } from 'shared'
import { openAiApi } from './openAiApi'

export async function extractCardExtensionData(
  card: Pick<ZettelTypes.Extension.Entity.Card<CardExtensionData>, 'blocks'>
): Promise<CardExtensionData> {
  const cardText = card.blocks
    .map(block => (block.type === ZettelTypes.Model.Block.Type.Attachment ? '' : block.text))
    .filter(Boolean)
    .flatMap(line => line.split('\n'))
    .join(' ')
  const chatCompletion = await openAiApi.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `
You are given a meeting schedule and are supposed to answer with the start and end timestamps of the meeting.
Also, you need to detect whether this meeting is reserved or not, and if reserved by who's name and email.
As a reference; "9am" means "9:00", "9pm" means "21:00", "12am" means "0:00", "12pm" means "12:00".
If the timezone is not specified in the description, consider the times are in UTC with no timezone offset.
 `,
      },
      {
        role: 'user',
        content: `
[Description]: Our call is on Sun May 28 2023 from 10:30 to 11am, timezone is GMT+3:30.
[From Timestamp]: May 28 2023 10:30:00 GMT+0330
[To Timestamp]: May 28 2023 11:00:00 GMT+0330
[Reserved By Name]: 
[Reserved By Email]: 
###
[Description]: Our call is tomorrow from 10:30 to 11am.
[From Timestamp]: 
[To Timestamp]: 
[Reserved By Name]: 
[Reserved By Email]: 
###
[Description]: The availability is on Sun May 28 2023 from 10:30 to 11am, it's already reserved by Hamed J. Alizadeh (hamed@gmail.com)
[From Timestamp]: May 28 2023 10:30:00 GMT
[To Timestamp]: May 28 2023 11:00:00 GMT
[Reserved By Name]: Hamed J. Alizadeh
[Reserved By Email]: hamed@gmail.com
###
[Description]: ${cardText}
[Now]: ${new Date().toString()}
`,
      },
    ],
    max_tokens: 2000,
    temperature: 0,
  })
  const answer = chatCompletion.data.choices[0].message?.content ?? ''
  try {
    const lines = answer.split('\n').filter(Boolean)
    const properties: Record<string, string> = {}
    lines.forEach(line => {
      const match = line.match(/^\[(.+)\]:(.*)$/)
      if (match) {
        properties[match[1]] = match[2].trim()
      }
    })
    const fromTimestamp = properties['From Timestamp'] && new Date(properties['From Timestamp']).getTime()
    const toTimestamp = properties['To Timestamp'] && new Date(properties['To Timestamp']).getTime()
    if (!fromTimestamp || !toTimestamp)
      return {
        processed: true,
        accepted: false,
      }
    return {
      processed: true,
      accepted: true,
      fromTimestamp,
      toTimestamp,
      ...(properties['Reserved By Name'] || properties['Reserved By Email']
        ? {
            reservedBy: {
              name: properties['Reserved By Name'].trim(),
              email: properties['Reserved By Email'].trim(),
            },
          }
        : {}),
    }
  } catch {
    return {
      processed: true,
      accepted: false,
    }
  }
}