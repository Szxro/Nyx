import { ApplicationCommandDataResolvable, Client, Collection, REST, Routes } from "discord.js";
import { CLIENT_CONFIG, CLIENT_INTENTS, ENVIROMENT_CONFIG } from "../constants/config";
import { ICommand } from "../models";
import { ServiceHandler } from "../handlers";
import { FileService, LoggerService } from "../services";
import { BaseEvent,BaseCommand } from "../base";

class Nyx extends Client {
    public slashCommandCollection:Collection<string,ICommand> = new Collection();
    private _slashCommand:ApplicationCommandDataResolvable[] = [];

    private _fileService:FileService = ServiceHandler.getInstance().getServiceByName<FileService>("FileService");
    private _logger:LoggerService = ServiceHandler.getInstance().getServiceByName<LoggerService>("LoggerService");

    constructor(){
        super({
            intents:CLIENT_INTENTS
        });
    }

    public async init():Promise<void>{        
        await this.registerEvents();
        await this.deploySlashCommands();
        await this.login(CLIENT_CONFIG.DISCORD_TOKEN);
    }

    private async registerEvents():Promise<void>{
        const eventsModules = await this._fileService.LoadModules({path:"src/events"});

        if(eventsModules.length <= 0){
            this._logger.warning({
                message:'No events were found',
                metadata:[{provider:"nyx"}]
            });

            return;
        }

        for(const eventModule of eventsModules){
            if(eventModule instanceof BaseEvent){
                const { callback, options } = eventModule;

                const eventHandler = async (args:unknown) =>{
                    // Wrapping the events callback into a Promise.resolve because it may or may not be a promise 
                    await Promise.resolve(callback({
                        client:this,
                        services:ServiceHandler.getInstance()
                    },args));
                };

                if(options.once !== undefined){
                    this.once(options.key,eventHandler);

                    continue;
                }

                this.on(options.key,eventHandler);
            }else{
                this._logger.warning({
                    message:`Invalid event ${eventModule.constructor.name}. Must extend BaseEvent`,
                    metadata:[{provider:"nyx"}]
                });
            }
        }

        this._logger.info({
            message:"All events registered successfully.",
            metadata:[{provider:"nyx"}]
        });
    }

    private async deploySlashCommands():Promise<void>{
        try{
            const rest = new REST().setToken(CLIENT_CONFIG.DISCORD_TOKEN);

            const commandModules = await this._fileService.LoadModules({path:"src/commands"});

            if(commandModules.length <= 0){
                this._logger.warning({
                    message:"No commands were found",
                    metadata:[{provider:"nyx"}]
                })

                return;
            }
    
            for(const commandModule of commandModules){
                if(commandModule instanceof BaseCommand){
                   const { name } = commandModule.options;
        
                   this.slashCommandCollection.set(name,{...commandModule.options,callback:commandModule.callback});
                   this._slashCommand.push({...commandModule.options,...commandModule.callback});
                }else{
                    this._logger.warning({
                        message:`Invalid command instance ${commandModule.constructor.name}. Must extend BaseCommand`,
                        metadata:[{provider:"nyx"}]
                    });
                }
            }

            // Guild Commands => for development // Application Commands => for production
            const route = ENVIROMENT_CONFIG === "development" 
                ? Routes.applicationGuildCommands(CLIENT_CONFIG.CLIENT_ID,CLIENT_CONFIG.SERVER_ID) 
                : Routes.applicationCommands(CLIENT_CONFIG.CLIENT_ID);

            await rest.put(route,{body:this._slashCommand});
    
            this._logger.info({
                message:`Succesfully deploy of ${this._slashCommand.length} application (/) commands into the ${ENVIROMENT_CONFIG} server`,
                metadata:[{provider:"nyx"}]
            });

        }catch(error:unknown){
            this._logger.error({
                message:`An unexpected error occurred while deploying slash commands, with the error message: '${error instanceof  Error ? error.message : "Unknown error message"}'`,
                metadata:[{
                    provider:"nyx",
                    stack:error instanceof Error ? error.stack || "Not available stack" : error
                }]
            })
        }
    }
}

export { Nyx };