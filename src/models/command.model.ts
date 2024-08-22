import { Awaitable, CacheType, Client, CommandInteraction, CommandInteractionOptionResolver, GuildMember, PermissionResolvable } from "discord.js"
import { ServiceHandler } from "../handlers";

// type extension to include the GuildMembet abstract class
type ExtendedInteraction = {member: GuildMember} & CommandInteraction;

type CommandProps = {
    client:Client,
     // Represents the command interaction
    interaction:ExtendedInteraction,
    //A resolver for command interaction options.
    args:Omit<CommandInteractionOptionResolver<CacheType>,
     "getMessage" | "getFocused">,
    services:ServiceHandler
};

interface ICommandOptions{
    name:string;
    description:string;
    coldown?:number;
    userPermission?: PermissionResolvable[];
}

interface ICommand extends ICommandOptions{
    callback:(props:CommandProps) => Awaitable<unknown>;
}

export { ICommand, CommandProps,ExtendedInteraction,ICommandOptions }; 