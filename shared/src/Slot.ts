import { ZettelTypes } from '@zettelooo/api-types'

export interface Slot {
  readonly fromTimestamp: number
  readonly toTimestamp: number
}

export namespace Slot {
  export interface Unparsed {
    readonly from: string
    readonly to: string
  }

  export type Status =
    | {
        readonly type: 'unknown' | 'not reserved'
      }
    | {
        readonly type: 'reserved'
        readonly name: string
        readonly email: string
      }

  export namespace Status {
    export function toString(slotStatus: Status): string {
      return slotStatus.type === 'not reserved'
        ? '[Not reserved]'
        : slotStatus.type === 'reserved'
        ? `[Reserved by ${slotStatus.name} (${slotStatus.email})]`
        : ''
    }

    export function fromString(text: string): Status {
      if (text === '[Not reserved]') return { type: 'not reserved' }
      const [, name, email] = text.match(/^\[Reserved by (.*) \((.*)\)\]$/) ?? []
      if (!name && !email) return { type: 'unknown' }
      return { type: 'reserved', name, email }
    }
  }

  export function generateBlocks(
    slot: Slot,
    slotStatus: Slot.Status,
    generateId: () => string
  ): ZettelTypes.Extension.Entity.Block[] {
    const from = new Date(slot.fromTimestamp)
    const fromDate = from.toDateString()
    const fromTime = from.toTimeString().slice(0, 5)
    const to = new Date(slot.toTimestamp)
    const toDate = to.toDateString()
    const toTime = to.toTimeString().slice(0, 5)
    return [
      {
        type: ZettelTypes.Model.Block.Type.Paragraph,
        id: generateId(),
        text:
          fromDate === toDate
            ? `${fromDate}, ${fromTime} \u2014 ${toTime}`
            : `${fromDate}, ${fromTime} \u2014 ${toDate}, ${toTime}`, // \u2014: em dash, '—'
        annotations: [],
        styleGroups: [],
        extensionData: {},
      },
      {
        type: ZettelTypes.Model.Block.Type.Paragraph,
        id: generateId(),
        text: Status.toString(slotStatus),
        annotations: [],
        styleGroups: [],
        extensionData: {},
      },
    ]
  }

  export function parseBlocks(blocks: readonly ZettelTypes.Extension.Entity.Block[]): { slotStatus: Status } {
    const lastBlock = blocks[blocks.length - 1]
    if (
      !lastBlock ||
      lastBlock.type !== ZettelTypes.Model.Block.Type.Paragraph ||
      lastBlock.annotations.length > 0 ||
      lastBlock.styleGroups.length > 0
    )
      return { slotStatus: { type: 'unknown' } }
    return { slotStatus: Status.fromString(lastBlock.text) }
  }

  export function updateBlocksSlotStatus(
    blocks: readonly ZettelTypes.Extension.Entity.Block[],
    newSlotStatus: Slot.Status
  ): ZettelTypes.Extension.Entity.Block[] {
    const { slotStatus } = parseBlocks(blocks)
    if (slotStatus.type === 'unknown') return [...blocks]
    const newLastBlock: ZettelTypes.Extension.Entity.Block<ZettelTypes.Model.Block.Type.Paragraph> = {
      ...(blocks[blocks.length - 1] as ZettelTypes.Extension.Entity.Block<ZettelTypes.Model.Block.Type.Paragraph>),
      text: Status.toString(newSlotStatus),
      annotations: [],
      styleGroups: [],
    }
    return blocks.slice(0, -1).concat(newLastBlock)
  }
}
