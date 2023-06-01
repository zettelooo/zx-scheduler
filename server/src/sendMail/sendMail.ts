import { SendMailClient } from 'zeptomail'

const sendMailClient = new SendMailClient({
  url: 'api.zeptomail.com/',
  token: process.env.ZEPTOMAIL_SEND_MAIL_CLIENT_TOKEN ?? '',
})

export async function sendMail(
  fromEmail: string,
  fromName: string,
  toEmail: string,
  toName: string,
  subject: string,
  textOrHtmlBody: string
): Promise<{ success: boolean }> {
  const response = await sendMailClient.sendMail({
    bounce_address: 'zettel@bounce.zettel.ooo',
    from: {
      address: fromEmail,
      name: fromName,
    },
    to: [
      {
        email_address: {
          address: toEmail,
          name: toName,
        },
      },
    ],
    subject,
    ...(textOrHtmlBody.trimStart().startsWith('<')
      ? {
          htmlbody: textOrHtmlBody,
        }
      : {
          textbody: textOrHtmlBody,
        }),
  })

  const success = Boolean(response.data)

  if (!success) {
    console.error(response)
  }

  return {
    success,
  }
}
