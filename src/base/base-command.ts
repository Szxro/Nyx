import { Awaitable } from "discord.js";
import { ICommandOptions, CommandProps } from "../models";

abstract class BaseCommand{
    public options:ICommandOptions;

    constructor(options:ICommandOptions){
        this.options = options;
    }

    // Awaitable represent a type that may be or not return a promise
    abstract callback(props:CommandProps): Awaitable<unknown>;
}

export { BaseCommand };

