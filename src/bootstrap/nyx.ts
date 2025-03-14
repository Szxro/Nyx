import { ApplicationCommandDataResolvable, Client, REST, Routes } from "discord.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import { pathToFileURL } from "url";
import { BaseCommand } from "../common/base/base-command";
import { BaseEvent } from "../common/base/base-event";
import { configuration } from "../common/constants/config";
import { PropsCantBeUndefined } from "../common/errors/props-cant-be-undefined";
import { ServiceManager } from "../common/managers/service-manager";
import { CommandProps } from "../models/commands";
import { LoggerService } from "../services/logger-service";
import { isPromiseRejected, WaitOne } from "../utilities/promises";

class Nyx {
    private readonly _slashCommands:ApplicationCommandDataResolvable[] = [];
    public readonly slashCommandsMap:Map<string,CommandProps> = new Map<string,CommandProps>;

    constructor(
        private readonly _client:Client = new Client({ intents: configuration.CLIENT_INTENTS }),
        private readonly _logger:LoggerService = LoggerService.getInstance(),
        private readonly _serviceManager:ServiceManager = ServiceManager.getInstance()
    ){}
    
    async runAsync(): Promise<void>{
        this.registerErrorHandlersSync();
        await this.registerServicesAsync();
        await this.registerEventsAsync();
        await this.deployCommandsAsync();
        await this._client.login(configuration.DISCORD_TOKEN);
    }

    private registerErrorHandlersSync(){
        // Handle unhandled exceptions
        process.on('uncaughtException',(error,origin) =>{
            this.handleError(error,"uncaughtException",origin);
        });

         // Handle unhandled promise rejections
        process.on('unhandledRejection',(error) =>{
            this.handleError(error,"unhandledRejection");
        });
    }

    private async registerServicesAsync(): Promise<void>{
        const servicesInstances = await this.loadInstances('src/services');

        if(servicesInstances.length <= 0){
            this._logger.warning({
                message:'No services were found',
                metadata:[{
                    provider:'nyx'
                }]
            });

            return;
        }

        servicesInstances.forEach((instance) =>{
            this._serviceManager.register(instance.name,instance);
        });
        
        this._logger.info({
            message: `All services registered successfully.`,
            metadata: [{ 
                provider: "nyx" 
            }]
        });
    }

    private async registerEventsAsync(){
        const eventsInstances = await this.loadInstances('src/events');

        if(eventsInstances.length <= 0){
            this._logger.warning({
                message:'No events were found',
                metadata:[{
                    provider:'nyx'
                }]
            });

            return;
        }

        for(const eventInstance of eventsInstances){
            if(eventInstance instanceof BaseEvent){
                const { props , callback } = eventInstance;

                if(props == undefined) throw new PropsCantBeUndefined();

                const eventHandler = async (args:unknown) =>{
                    // Wrapping the events callback into a Promise.resolve because it may or may not be a promise 
                    await Promise.resolve(callback({
                        client:this,
                        services:this._serviceManager
                    },args));
                };

                if(props.once !== undefined){
                    this._client.once(props.key,eventHandler);
                    continue;
                }

                this._client.on(props.key,eventHandler);
            }else{
                this._logger.warning({
                    message:`Invalid event ${eventInstance.name}. Must extend BaseEvent`,
                    metadata:[{
                        provider:"nyx"
                    }]
                });
            }
        }

        this._logger.info({
            message:"All events registered successfully.",
            metadata:[{
                provider:"nyx"
            }]
        });
    } 

    private async deployCommandsAsync(){
        const commandsInstances = await this.loadInstances('src/commands');

        if(commandsInstances.length <= 0){
            this._logger.warning({
                message:'No commands were found',
                metadata:[{
                    provider:'nyx'
                }]
            });

            return;
        }

        for(const commandInstance of commandsInstances){
            if(commandInstance instanceof BaseCommand){
                const { props ,callback } = commandInstance;

                if(props === undefined) throw new PropsCantBeUndefined();

                this.slashCommandsMap.set(props.name,{...props, callback});
                this._slashCommands.push({...props});
            }else{
                this._logger.warning({
                    message:`Invalid command instance ${commandInstance.name}. Must extend BaseCommand`,
                    metadata:[{
                        provider:"nyx"
                    }]
                });
            }
        }

        try{
            const rest = new REST().setToken(configuration.DISCORD_TOKEN);
    
            const route = configuration.ENVIRONMENT === "development" 
                ? Routes.applicationGuildCommands(configuration.CLIENT_ID, configuration.SERVER_ID) 
                : Routes.applicationCommands(configuration.CLIENT_ID);
    
            await rest.put(route,{ body:this._slashCommands });
    
            this._logger.info({
                message:`Succesfully deploy of ${this._slashCommands.length} application (/) commands into the ${configuration.ENVIRONMENT} server`,
                metadata:[{provider:"nyx"}]
            });
        }catch(error:unknown){
            this._logger.error({
                message:`An unexpected error occurred while deploying slash commands, with the error message: '${error instanceof  Error ? error.message : "Unknown error message"}'`,
                metadata:[{
                    provider:"nyx",
                    stack:error instanceof Error ? error.stack || "Not available stack" : error
                }]
            });
        }
    }

    // Helpers
    private async loadInstances(path:string){
        const directory = join(cwd(),path);
        const files = await readdir(directory);
        const instances:Function[] = [];

        if(files.length <= 0) return [];

        const instanceFiles = files.filter(filename => !filename.includes("index"));

        for(const instance of instanceFiles){
                const modulePath = pathToFileURL(join(directory, instance)).href;
                const result = await WaitOne(import(modulePath));

                if(isPromiseRejected(result)){
                    this._logger.error({ 
                        message:`An unexpected error occurred while importing ${instance}`,
                        metadata:[{
                            provider: "nyx",
                            stack: result.reason instanceof Error ? result.reason.stack || "No stack available" : "No stack available"
                        }]
                    });
                    continue;
                }

                if(result.data.default !== undefined){
                    instances.push(result.data.default);
                    continue;
                }

                Object.keys(result.data).forEach((moduleName) =>{
                    instances.push(result.data[moduleName]);
                });
        } 

        return instances;
    }

    private handleError(error:unknown,type:"uncaughtException" | "unhandledRejection",origin?:string){
        const message = error instanceof Error
            ? `An ${type} happen at ${origin ?? "unknown origin"} with the error message: ${error.message}`
            : `An ${type} happen at ${origin ?? "unknown origin"} with the error message: Unknown error message`;

        this._logger.error({
            message,
            metadata:[{
                provider:"nyx",
                stack:error instanceof Error ? error.stack || "Not available stack" : error
            }]
        });

        process.exitCode = 1;
    }
}

export { Nyx };

