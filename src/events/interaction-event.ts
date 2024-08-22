import { Interaction, CacheType, Awaitable, Events } from "discord.js";
import { BaseEvent } from "../base";
import { EventProps, ExtendedInteraction } from "../models";
import { LoggerService } from "../services";
import { ServiceHandler } from "../handlers";

class InteractionEvent extends BaseEvent<Events.InteractionCreate>{
    constructor(){
        super({
            key:Events.InteractionCreate
        });
    }

    async callback({client,services}: EventProps, interaction: Interaction<CacheType>): Promise<Awaitable<unknown>>{
        const logger = services.getServiceByName<LoggerService>("LoggerService");

        if(!interaction.isChatInputCommand()) return;

        logger.info({
            message:`Command "${interaction.commandName}" was invoked by ${interaction.user?.username ?? "No username available"}`,
            metadata:[{provider:"interaction-event"}]
        })

        const command = client.slashCommandCollection.get(interaction.commandName);

        if(command === undefined){
            logger.warning({
                message:`${interaction.user?.username ?? "No username available"} tried to use an unknown command: ${interaction.commandName}`,
                metadata:[{provider:"interaction-event"}]
            })

            return await interaction.reply({content:"Invalid command, check and try again"});
        }

        try{
            return await command.callback({
                client,
                args:interaction.options,
                interaction:interaction as ExtendedInteraction,
                services:ServiceHandler.getInstance()
            });
        }catch(err:unknown){
            logger.error({
                message: `Error executing command "${interaction.commandName}"`,
                metadata: [{ 
                    provider: "interaction-event",
                    stack: err instanceof Error ? err.stack || "No stack available" : err
                 }]
            });
    

             await interaction.reply({
                 content: "An error occurred while executing the command.",
                ephemeral: true
             });

             throw err;
        }
    }
}

export default new InteractionEvent();