import { Awaitable } from "discord.js";
import { CommandParams, CommandProps } from "../../models/commands.model";

abstract class BaseCommand{
    constructor(readonly props?:Omit<CommandProps,'callback'>){}
    
    abstract callback(props:CommandParams): Awaitable<unknown>;
}

export { BaseCommand };

