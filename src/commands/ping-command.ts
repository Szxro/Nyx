import { Awaitable } from "discord.js";
import { BaseCommand } from "../base";
import { CommandProps } from "../models";
import { Measure } from "../decorators/measure";

class PingCommand extends BaseCommand{
    constructor(){
        super({
            name:"ping",
            description:"replies with pong"
        });
    }

    @Measure({
        name:"ping",
        type:'command'
    })
    async callback({interaction}:CommandProps):Promise<Awaitable<unknown>>{
        await interaction.reply({content:'Pong'});

        return;
    }
}

export default new PingCommand();