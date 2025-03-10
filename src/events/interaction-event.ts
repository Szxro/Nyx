import { CacheType, Interaction } from "discord.js";
import { BaseEvent } from "../common/base/base-event";
import { DiscordEvent } from "../common/decorators/discord-components";
import { ExtendedInteraction } from "../models/commands";
import { EventParams } from "../models/event";
import { LoggerService } from "../services/logger-service";
import { isPromiseRejected, WaitOne } from "../utilities/promises";

@DiscordEvent({ key:'interactionCreate' })
class InteractionEvent extends BaseEvent<'interactionCreate'>{
    async callback({ services, client }: EventParams, interaction: Interaction<CacheType>): Promise<unknown>{
        const logger = services.getServiceByName<LoggerService>("LoggerService");

        if(!interaction.isChatInputCommand()) return;

        logger.info({
            message:`Command "${interaction.commandName}" was invoked by ${interaction.user?.username ?? "No username available"}`,
            metadata:[{
                provider:"interaction-event"
            }]
        });

        const command = client.slashCommandsMap.get(interaction.commandName);

        if(command !== undefined){
            const result = await WaitOne(command.callback({
                client,
                services,
                args:interaction.options,
                interaction: interaction as ExtendedInteraction
            }));

            if(isPromiseRejected(result)){
                logger.error({
                    message: `Error executing command "${interaction.commandName}"`,
                    metadata: [{ 
                        provider: "interaction-event",
                        stack: result.reason instanceof Error ? result.reason.stack || "No stack available" : result.reason
                     }]
                });
                await interaction.reply({
                    content: "An error occurred while executing the command.",
                    ephemeral: true
                });
    
                throw result.reason;
            }
            return result.data;
        }

        logger.warning({
            message:` The user '${ interaction.user?.username ?? "no username available" }' tried to use an unknown command: ${interaction.commandName}`,
            metadata:[{
                provider:"interaction-event"
            }]
        })

        await interaction.reply({content:"Invalid command, check and try again"});
    }
}

export default new InteractionEvent();

