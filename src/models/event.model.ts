import { ClientEvents } from "discord.js";
import { Nyx } from "../bootstrap/nyx";
import { ServiceHandler } from "../handlers";

// Represent all the keys avaliables for the events
type EventKeys = keyof ClientEvents;

// Props that will pass through the event callback
type EventProps = { client:Nyx,services:ServiceHandler };

interface IEvent<T extends EventKeys>{
    key:T,
    once?:boolean;
}

export { IEvent,EventKeys,EventProps };