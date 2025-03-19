import { Awaitable } from "discord.js";
import { BaseEvent } from "../common/base/base-event";
import { DiscordEvent } from "../common/decorators/discord-components";
import { EventParams } from "../models/event.model";
import { LoggerService } from "../services/logger-service";

@DiscordEvent({ key:'error' })
class ErrorEvent extends BaseEvent<'error'>{
    callback({services}: EventParams, error: Error): Awaitable<unknown> {
        const logger = services.getServiceByName<LoggerService>('LoggerService');

        logger.error({
            message:"An unexpected error trigger the error event",
            metadata:[{
                provider:"error-event",
                stack: error.stack || error
            }]
        });

        return;
    }
}

export default new ErrorEvent();

