import { Awaitable, ClientEvents } from "discord.js";
import { IEvent,EventKeys, EventProps } from "../models";

abstract class BaseEvent<T extends EventKeys>{
    public options:IEvent<T>;

    constructor(options:IEvent<T>){
        this.options = options;
    }

    //ClientEvents[T] => // Represent the args for the selected client event
    abstract callback(props:EventProps,...args:ClientEvents[T]): Awaitable<unknown>;
}

export { BaseEvent };