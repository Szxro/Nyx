import { ClientEvents } from "discord.js";
import { Nyx } from "../bootstrap/nyx";
import { ServiceManager } from "../common/managers/service-manager";

type EventKeys = keyof ClientEvents;

type EventParams = {
    client:Nyx,
    services:ServiceManager    
};

type EventProps<TEvent extends EventKeys> = {
    key: TEvent,
    once?: boolean
}

export { EventKeys, EventParams, EventProps };

