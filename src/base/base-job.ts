import { Job } from "node-schedule";
import { IJobOptions, JobProps } from "../models/job.model";
import { ServiceHandler } from "../handlers/service-handler";
import { LoggerService } from "../services";

abstract class BaseJob{
    public options:IJobOptions;

    private _logger = ServiceHandler.getInstance().getServiceByName<LoggerService>("LoggerService");

    constructor(options:IJobOptions){
        this.options = options;
    }
    
    // With arrow function the 'this' is bind by default to the current context
     public errorHandler = (name:string,err:unknown,job:Job) => {
        const message = err instanceof Error
            ? `Unexpected error during the execution of the job ${name} with the message ${err.message}`
            : `Unexpected unknown error during the execution of the job ${name}`;

        this._logger.error({
            message,
            metadata: [{
                provider: "scheduler-service",
                stack: (err instanceof Error ? err.stack : 'No stack available')
            }]
        });

        job.cancel();
    }

    public abstract execute(props:JobProps):Promise<void> | void;

    public abstract stop(props:JobProps):Promise<void> | void;
}

export { BaseJob };