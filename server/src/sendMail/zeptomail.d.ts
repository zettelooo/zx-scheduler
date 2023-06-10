// See: https://www.zoho.com/zeptomail/help/api/email-sending.html

declare module 'zeptomail' {
  export class SendMailClient {
    constructor(options: SendMailClient.Options)

    sendMail(request: SendMailClient.SendMail.Request): Promise<SendMailClient.SendMail.Response>
  }

  export namespace SendMailClient {
    export interface Options {
      readonly url: string
      readonly token: string
    }

    export namespace SendMail {
      export type Request = {
        readonly bounce_address: string
        readonly from: Request.EmailAddress
        readonly to: readonly { readonly email_address: Request.EmailAddress }[]
        readonly reply_to?: readonly Request.EmailAddress[]
        readonly subject: string
        readonly cc?: readonly { readonly email_address: Request.EmailAddress }[]
        readonly bcc?: readonly { readonly email_address: Request.EmailAddress }[]
        readonly track_clicks?: boolean
        readonly track_opens?: boolean
        readonly client_reference?: string
        readonly mime_headers?: Readonly<Record<string, string>>
        readonly attachments?: readonly Request.Attachment[]
        readonly inline_images?: readonly Request.InlineImage[]
      } & (
        | {
            readonly textbody: string
          }
        | {
            readonly htmlbody: string
          }
      )

      export namespace Request {
        export interface EmailAddress {
          readonly address: string
          readonly name: string
        }

        export type Attachment =
          | {
              readonly content: string
              readonly mime_type: string
              readonly name: string
            }
          | {
              readonly file_cache_key: string
              readonly name: string
            }

        export type InlineImage =
          | {
              readonly mime_type: string
              readonly content: string
              readonly cid: string
            }
          | {
              readonly file_cache_key: string
              readonly cid: string
            }
      }

      export type Response =
        | {
            readonly data: readonly {
              readonly code: string
              readonly additional_info: readonly any[]
              readonly message: string
            }[]
            readonly message: string
            readonly request_id: string
            readonly object: 'email'
          }
        | {
            readonly data?: undefined
            readonly error: {
              readonly code: string
              readonly details: readonly any[]
            }
            readonly message: string
            readonly request_id: string
          }
    }
  }
}
