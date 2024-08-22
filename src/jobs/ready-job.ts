import { BaseJob } from "../base";
import { Measure } from "../decorators/measure";
import { JobProps } from "../models";
import { LoggerService } from "../services";

class ReadyJob extends BaseJob{
    constructor(){
        super({
            name:"ReadyJob",
            cronExpression:"*/3 * * * *",
            once:true
        })
    }

    @Measure({
        name:'ready',
        type:'job',
        validateTime:false
    })
    execute({services}:JobProps):void{
        const logger = services.getServiceByName<LoggerService>("LoggerService");

        logger.info({
            message:"Hello from ReadyJob",
            metadata:[{provider:"ready-job"}]
        });
    };
    

    stop({services}:JobProps):Promise<void>{
        const logger = services.getServiceByName<LoggerService>("LoggerService");

        return new Promise((resolve) =>{
            setTimeout(() =>{
                logger.info({
                    message:"Bye from ReadyJob",
                    metadata:[{provider:"ready-job"}]
                });
                
                resolve();
            },2500);
        });
    };
}

export default new ReadyJob();