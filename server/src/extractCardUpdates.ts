import { ZettelTypes } from '@zettelooo/api-types'
import { CardExtensionData } from 'shared'
import { openAiApi } from './openAiApi'

export async function extractCardUpdates(
  card: Pick<ZettelTypes.Extension.Model.Card<CardExtensionData>, 'text'>,
  cardExtensionData: CardExtensionData
): Promise<ZettelTypes.Extension.Service.Rest.EditCard.Request<CardExtensionData>['updates']> {
  const chatCompletion = await openAiApi.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `
You are an assistant meant to help modify the reservation status of an event describing text.
The text is given as an JSON stringified string.
Only modify the related parts and don't touch the other parts.
It's prefered to update one of the existing lines rather than adding a new line.
However, if there is no existing line that contains reservation status, you can add a new line at the end to put the new reservation status.
Only complete the prompt with a JSON stringified string, nothing else.
`,
      },
      {
        role: 'user',
        content: `
[Text]: "Hello! My name is Ilika.\nI want to let you know that I'm free on the following time:\nTomorrow from 10pm to 11pm.\nIs this already reserved? Yes! By { name: 'Mina', email: 'mina@gmail.com' }.\nThis card has been visited 103 times."
[New Reservation Status]: Not reserved
[Updated Text]: "Hello! My name is Ilika.\nI want to let you know that I'm free on the following time:\nTomorrow from 10pm to 11pm.\nIs this already reserved? No.\nThis card has been visited 103 times."
###
[Text]: "Hello! My name is Ilika.\nI want to let you know that I'm free on the following time:\nTomorrow from 10pm to 11pm.\nIs this already reserved? Yes! By { name: 'Mina', email: 'mina@gmail.com' }.\nThis card has been visited 103 times."
[New Reservation Status]: Reserved by "Dory Peterson" (dori.peterson@gmail.com)
[Updated Text]: "Hello! My name is Ilika.\nI want to let you know that I'm free on the following time:\nTomorrow from 10pm to 11pm.\nIs this already reserved? Yes! By { name: 'Dori', email: 'dori.peterson@gmail.com' }.\nThis card has been visited 103 times."
###
[Text]: "On 23 Mar 2023, from 10:00 to 12:30 UTC"
[New Reservation Status]: Reserved by "Dory Peterson" (dori.peterson@gmail.com)
[Updated Text]: "On 23 Mar 2023, from 10:00 to 12:30 UTC\nReserved by Dory Peterson (dofi.peterson@gmail.com)"
###
[Text]: "On 23 Mar 2023, from 10:00 to 12:30 UTC\nReserved by Dory Peterson (dofi.peterson@gmail.com)"
[New Reservation Status]: Not reserved.
[Updated Text]: "On 23 Mar 2023, from 10:00 to 12:30 UTC"
###
[Text]: ${JSON.stringify(card.text)}
[New Reservation Status]: ${
          cardExtensionData?.accepted && cardExtensionData.reservedBy
            ? `Reserved by "${cardExtensionData.reservedBy.name || '-'}" (${cardExtensionData.reservedBy.email || '-'})`
            : 'Not reserved'
        }
[Updated Text]: `,
      },
    ],
    max_tokens: 3000,
    temperature: 0,
  })
  const answer = chatCompletion.data.choices[0].message?.content ?? ''
  try {
    return {
      text: String(JSON.parse(answer.replaceAll('\n', '\\n'))),
      extensionData: cardExtensionData,
    }
  } catch {
    return {}
  }
}
