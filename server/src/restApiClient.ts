import { ZettelServices } from '@zettelooo/api-server'
import { PageExtensionData } from 'shared'
import { ZETTEL_EXTENSION_ACCESS_KEY, ZETTEL_TARGET_ENVIRONMENT } from './constants'

export const restApiClient = new ZettelServices.Extension.Rest<PageExtensionData>({
  extensionRestApi: { targetEnvironment: ZETTEL_TARGET_ENVIRONMENT },
  extensionAccessKey: ZETTEL_EXTENSION_ACCESS_KEY,
})
