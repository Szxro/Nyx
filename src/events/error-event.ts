import { Awaitable, Events } from "discord.js";
import { BaseEvent } from "../base";
import { EventProps } from "../models";
import { LoggerService } from "../services";

class ErrorEvent extends BaseEvent<Events.Error>{
    constructor(){
        super({
            key:Events.Error
        })
    }

    //TODO: GET THE ADMIN OF THE SERVER BY ROLES AND SEND AN EMBED TELLING WHAT HAPPEN
    callback({ services }:EventProps,err:Error):Awaitable<unknown>{
        const logger = services.getServiceByName<LoggerService>("LoggerService");

        logger.error({
            message:"An Unexpected error trigger the error event",
            metadata:[{
                provider:"error-event",
                stack: err.stack || err
            }]
        });

        return;
    }
}

export default new ErrorEvent();