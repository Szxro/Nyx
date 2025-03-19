import { Awaitable, CacheType, CommandInteraction, CommandInteractionOptionResolver, GuildMember, PermissionResolvable } from "discord.js";
import { Bot } from "../bootstrap/bot";
import { ServiceManager } from "../common/managers/service-manager";

// type extension to include the GuildMember abstract class
type ExtendedInteraction = {member: GuildMember} & CommandInteraction;

type CommandParams = {
    client:Bot,
    interaction:ExtendedInteraction, // Represents the command interaction
    //A resolver for command interaction options.
    args:Omit<CommandInteractionOptionResolver<CacheType>,"getMessage" | "getFocused">,
    services:ServiceManager
};

interface CommandProps{
    name:string;
    description:string;
    coldown?:number;
    userPermission?: PermissionResolvable[];
    callback:(params:CommandParams) => Awaitable<unknown>;
}

export { CommandParams, CommandProps, ExtendedInteraction };

