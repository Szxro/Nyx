import { Awaitable, Client } from "discord.js";
import { BaseEvent } from "../common/base/base-event";
import { DiscordEvent } from "../common/decorators/discord-components";
import { EventParams } from "../models/event.model";
import { LoggerService } from "../services/logger-service";

@DiscordEvent({
    key:'ready',
    once:true
})
class ReadyEvent extends BaseEvent<'ready'>{
    callback({services}: EventParams, client: Client<true>): Awaitable<unknown> {
        const logger = services.getServiceByName<LoggerService>('LoggerService');

        return logger.info({
            message:`Logged in as ${client.user?.username || "username not avaliable"}`,
            metadata:[{
                provider:"ready-event"
            }]
        })
    }
}

export default new ReadyEvent();

