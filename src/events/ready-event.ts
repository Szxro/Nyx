import { Awaitable, Client, Events } from "discord.js";
import { BaseEvent } from "../base";
import { EventProps } from "../models";
import { LoggerService } from "../services";
import { SchedulerManager } from "../handlers";

class ReadyEvent extends BaseEvent<Events.ClientReady>{
    constructor(){
        super({
            key:Events.ClientReady
        })
    }

    async callback({services}: EventProps, client: Client<true>): Promise<Awaitable<unknown>>{
        const logger = services.getServiceByName<LoggerService>("LoggerService");

        const scheduler = new SchedulerManager();

        await scheduler.register();

        scheduler.runner();

        return logger.info({
            message:`Logged in as ${client.user?.username || "Username not avaliable"}`,
            metadata:[{provider:"ready-event"}]
        })
    }
}

export default new ReadyEvent();