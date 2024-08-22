import { Nyx } from "../bootstrap/nyx"
import { SchedulerManager, ServiceHandler } from "../handlers";
import { FileService, LoggerService } from "../services";

class Host{
    private _services:ServiceHandler = ServiceHandler.getInstance();

    private _logger = LoggerService.getInstance();

    constructor(){
        this.registerServices();
        this.setupErrorHandlers();
    }

    private registerServices(){
        //Singleton
        this._services.register("LoggerService",LoggerService);
        
        //Transient
        this._services.register("FileService",FileService);
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

    private setupErrorHandlers(){
        // Handle unhandle exceptions
        process.on('uncaughtException',(error,origin) =>{
            this.handleError(error,"uncaughtException",origin);
        });

         // Handle unhandle promise rejections
        process.on('unhandledRejection',(error) =>{
            this.handleError(error,"unhandledRejection");
        });
    }

    public async runAsync(){
        const nyx = new Nyx();

        const scheduler = new SchedulerManager();

        try{
            await nyx.init();

            this._logger.info({
                message:"Nyx was initialized successfully!!!!.",
                metadata:[{provider:"host"}]
            });

        }catch(err:unknown){
            const message = err instanceof Error 
                ? `An unexpected error happen while initializing Nyx: ${err.message}`
                : "An unexpected error happen while initializing Nyx: Unknown Error";

            this._logger.error({
                message,
                metadata:[{
                    provider:"host",
                    stack:err instanceof Error ? err.stack || "Not available stack" : err
                }]
            });

            await scheduler.shutdown();

            process.exitCode = 1;
        }
    }
}

export { Host };