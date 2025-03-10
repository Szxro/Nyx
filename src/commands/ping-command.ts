import { BaseCommand } from "../common/base/base-command";
import { DiscordCommand } from "../common/decorators/discord-components";
import { Measure } from "../common/decorators/measure";
import { CommandParams } from "../models/commands";

@DiscordCommand({
    name:'ping',
    description:'replies with pong'
})
class PingCommand extends BaseCommand{
    @Measure({ type:'command' })
    async callback({ interaction }: CommandParams): Promise<void>{
        await interaction.reply({ content:'Pong' });

        return;
    }
}

export default new PingCommand();

