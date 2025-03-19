import { ClientEvents } from "discord.js";
import { Bot } from "../bootstrap/bot";
import { ServiceManager } from "../common/managers/service-manager";

type EventKeys = keyof ClientEvents;

type EventParams = {
    client:Bot,
    services:ServiceManager    
};

type EventProps<TEvent extends EventKeys> = {
    key: TEvent,
    once?: boolean
}

export { EventKeys, EventParams, EventProps };

