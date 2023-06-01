import { ZettelExtensions } from '@zettelooo/extension-api'
import { renderInviteButton } from './renderInviteButton'
import { renderReservedMessage } from './renderReservedMessage'
import { Slot } from 'shared'

export const whileCard: ZettelExtensions.Helper<
  'pagePanel' | 'publicPageView' | 'publicCardView',
  'activated',
  [],
  void
> = function ({ activatedApi }) {
  this.while('card', function ({ cardApi }) {
    let parsedBlocks = Slot.parseBlocks(cardApi.data.card.blocks)

    this.register(
      cardApi.watch(
        data => Slot.parseBlocks(data.card.blocks),
        (newValue, oldValue) => {
          parsedBlocks = newValue
          cardBlockLifeSpanRegistration.deactivate()
          if (parsedBlocks.slotStatus.type !== 'unknown') {
            cardBlockLifeSpanRegistration.activate()
          }
        },
        { areValuesEqual: (newValue, oldValue) => JSON.stringify(newValue) === JSON.stringify(oldValue) }
      )
    )

    const cardBlockLifeSpanRegistration = this.register(
      () =>
        this.while('cardBlock', function ({ cardBlockApi }) {
          if (
            cardBlockApi.target.blockId !== cardBlockApi.data.card.blocks[cardBlockApi.data.card.blocks.length - 1]?.id
          )
            return

          this.register(
            cardBlockApi.registry.displayOptions(() => ({
              hideBase: true,
            }))
          )

          switch (parsedBlocks.slotStatus.type) {
            case 'not reserved':
              renderInviteButton.call(this, { activatedApi, cardBlockApi })
              break

            case 'reserved':
              renderReservedMessage.call(this, { cardBlockApi }, parsedBlocks.slotStatus)
              break
          }
        }).finish,
      { initiallyInactive: parsedBlocks.slotStatus.type === 'unknown' }
    )
  })
}
