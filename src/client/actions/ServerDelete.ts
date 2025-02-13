import { Server as RawServer } from 'revolt-api/types/Servers'
import { Action } from './Action'
import { Events } from '../../util/Constants'

export class ServerDeleteAction extends Action {
    handle(data: RawServer): unknown {
        const server = this.client.servers.cache.get(data._id)

        if (server) {
            server.deleted = true
            this.client.servers._remove(server.id)
            this.client.emit(Events.SERVER_DELETE, server)
        }

        return { server }
    }
}
