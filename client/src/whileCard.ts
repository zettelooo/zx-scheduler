import { ZettelExtensions } from '@zettelooo/extension-api'
import { CardExtensionData, PageExtensionData } from 'shared'
import { renderInviteButton } from './renderInviteButton'
import { renderReservedMessage } from './renderReservedMessage'
import { renderSlotData } from './renderSlotData'

export const whileCard: ZettelExtensions.Helper<
  'pagePanel' | 'publicPageView' | 'publicCardView',
  'activated',
  [],
  void,
  PageExtensionData,
  CardExtensionData
> = function ({ activatedApi }) {
  this.while('card', function ({ cardApi }) {
    this.register(
      cardApi.watch(
        data => cardApi.data.card.extensionData,
        newCardExtensionData => {
          cardBlockLifeSpanRegistration.deactivate()
          if (newCardExtensionData?.processed) {
            cardBlockLifeSpanRegistration.activate()
          }
        },
        { areValuesEqual: (newValue, oldValue) => JSON.stringify(newValue) === JSON.stringify(oldValue) }
      )
    )

    const cardBlockLifeSpanRegistration = this.register(
      () =>
        this.while('card', function ({ cardApi }) {
          if (!cardApi.data.card.extensionData?.accepted) return

          renderSlotData.bind(this)({ cardApi })

          if (cardApi.data.card.extensionData.reservedBy) {
            renderReservedMessage.bind(this)({ cardApi })
          } else {
            renderInviteButton.bind(this)({ activatedApi, cardApi })
          }
        }).finish,
      { initiallyInactive: !cardApi.data.card.extensionData?.accepted }
    )
  })
}
