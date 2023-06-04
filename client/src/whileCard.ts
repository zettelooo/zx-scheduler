import { ZettelExtensions } from '@zettelooo/extension-api'
import { renderInviteButton } from './renderInviteButton'
import { renderReservedMessage } from './renderReservedMessage'
import { CardExtensionData } from 'shared'
import { renderSlotData } from './renderSlotData'

export const whileCard: ZettelExtensions.Helper<
  'pagePanel' | 'publicPageView' | 'publicCardView',
  'activated',
  [],
  void
> = function ({ activatedApi }) {
  this.while('card', function ({ cardApi }) {
    let cardExtensionData = cardApi.data.card.extensionData as CardExtensionData
    this.register(
      cardApi.watch(
        data => cardApi.data.card.extensionData as CardExtensionData,
        newCardExtensionData => {
          cardExtensionData = newCardExtensionData
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
        this.while('cardBlock', function ({ cardBlockApi }) {
          if (!cardExtensionData?.accepted) return

          this.register(
            cardBlockApi.registry.displayOptions(() => ({
              hideBase: true,
            }))
          )

          if (cardBlockApi.data.block.id === cardBlockApi.data.card.blocks[0]?.id) {
            renderSlotData.bind(this)({ cardBlockApi })
            if (cardExtensionData.reservedBy) {
              renderReservedMessage.bind(this)({ cardBlockApi })
            } else {
              renderInviteButton.bind(this)({ activatedApi, cardBlockApi })
            }
          }
        }).finish,
      { initiallyInactive: !cardExtensionData?.accepted }
    )
  })
}
