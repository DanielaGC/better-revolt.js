import { DirectMessageChannel as RawDMChannel } from 'revolt-api/types/Channels'
import { TextBasedChannel } from './interfaces/TextBasedChannel'
import { Client } from '..'
import { ChannelTypes, DEFAULT_PERMISSION_DM } from '../util'

export class DMChannel extends TextBasedChannel {
    active!: boolean
    readonly type = ChannelTypes.DM
    permissions = DEFAULT_PERMISSION_DM
    constructor(client: Client, data: RawDMChannel) {
        super(client, data)
        this._patch(data)
    }

    _patch(data: RawDMChannel): this {
        if (data._id) {
            this.id = data._id
        }

        if (typeof data.active === 'boolean') {
            this.active = data.active
        }

        return this
    }

    _update(data: RawDMChannel): this {
        const clone = this._clone()
        clone._patch(data)
        return clone
    }
}
