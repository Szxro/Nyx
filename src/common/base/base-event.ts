import { Awaitable, ClientEvents } from "discord.js";
import { EventKeys, EventParams, EventProps } from "../../models/event.model";

abstract class BaseEvent<TEvent extends EventKeys>{
    constructor(readonly props?:EventProps<TEvent>){}

    abstract callback(params:EventParams,...args:ClientEvents[TEvent]):Awaitable<unknown>;
}

export { BaseEvent };

