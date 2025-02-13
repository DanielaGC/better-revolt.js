import { Message as RawMessage, SystemMessage } from 'revolt-api/types/Channels'
import { Base, DMChannel, GroupChannel, Mentions, Server, ServerMember, TextChannel, User } from '.'
import { Client } from '..'
import { MessageTypes, UUID } from '../util'

export class Message extends Base {
    content = ''
    id!: string
    channelId!: string
    authorId!: string
    embeds!: Array<unknown>
    deleted = false
    mentions = new Mentions(this)
    type: MessageTypes | 'UNKNOWN' = MessageTypes.TEXT
    editedAt: Date | null = null
    constructor(client: Client, data: RawMessage) {
        super(client)
        this._patch(data)
    }

    _update(data: RawMessage): this {
        const clone = this._clone()
        clone._patch(data)
        return clone
    }

    _patch(data: RawMessage): this {
        if (!data) return this

        if (data._id) {
            this.id = data._id
        }

        if (Array.isArray(data.embeds)) {
            this.embeds = data.embeds
        }

        if (Array.isArray(data.mentions)) {
            this.mentions._patch(data.mentions)
        }

        if (data.author) {
            this.authorId = data.author
        }

        if (data.channel) {
            this.channelId = data.channel
        }

        if (typeof data.content === 'object') {
            this.type = MessageTypes[data.content.type.toUpperCase() as Uppercase<SystemMessage['type']>] ?? 'UNKNOWN'
        } else if (typeof data.content === 'string') {
            this.content = data.content
        }

        if (data.edited) {
            this.editedAt = new Date(data.edited.$date)
        }

        return this
    }

    get createdAt(): Date {
        return UUID.extrectTime(this.id)
    }

    get createdTimestamp(): number {
        return this.createdAt.getTime()
    }

    get editedTimestamp(): number | null {
        return this.editedAt?.getTime() ?? null
    }

    async ack(): Promise<void> {
        await this.channel.messages.ack(this)
    }

    async delete(): Promise<void> {
        await this.channel.messages.delete(this)
    }

    async reply(content: string, mention = true): Promise<unknown> {
        return this.channel.messages.send({
            content,
            replies: [{ id: this.id, mention }]
        })
    }

    async edit(content: string): Promise<void> {
        await this.channel.messages.edit(this, { content })
    }

    fetch(): Promise<Message> {
        return this.channel.messages.fetch(this.id)
    }

    get system(): boolean {
        return this.type !== MessageTypes.TEXT
    }

    inServer(): this is this & { serverId: string; server: Server; channel: TextChannel } {
        return this.channel.inServer()
    }

    get author(): User | null {
        return this.client.users.cache.get(this.authorId) ?? null
    }

    get channel(): TextChannel | DMChannel | GroupChannel {
        return this.client.channels.cache.get(this.channelId) as TextChannel
    }

    get serverId(): string | null {
        const channel = this.channel
        return channel.inServer() ? channel.serverId : null
    }

    get server(): Server | null {
        return this.client.servers.cache.get(this.serverId as string) ?? null
    }

    get member(): ServerMember | null {
        return this.server?.members.cache.get(this.authorId) ?? null
    }

    get url(): string {
        return `https://app.revolt.chat/${this.serverId ? `server/${this.serverId}` : ''}/channel/${this.channelId}/${this.id}`
    }
}
