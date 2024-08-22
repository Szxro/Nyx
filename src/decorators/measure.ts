import { performance } from "node:perf_hooks";
import { LoggerService } from "../services";
import { IMeasureOptions } from "../models";
import { ServiceHandler } from "../handlers";

function Measure({name,type,validateTime = true}:IMeasureOptions){
    return function(target:Object,methodName:string | symbol,descriptor:PropertyDescriptor){
        const originalMethod = descriptor.value;

        const logger = ServiceHandler.getInstance().getServiceByName<LoggerService>("LoggerService");

        const trackMethodDuration = (start:number,end:number,error?:unknown) =>{
            const delta = end - start;

            if(error!== undefined){
                logger.error({
                    message:`The ${type} ${name} failed after ${delta}ms`,
                    metadata:[{
                        provider:"measure-decorator",
                        stack:error instanceof Error ? error.stack || "Not available stack" : error
                    }]
                });

                return;
            }

            if(delta > 3000 && validateTime){
                logger.warning({
                    message:`The ${type} ${name} finish succesfully after ${delta}ms, it excedded 3000ms, the connection with the discord webhook is lost`,
                    metadata:[{provider:"measure-decorator"}]
                });
            }else{
                logger.info({
                    message:`The ${type} ${name} finish succesfully after ${delta}ms`,
                    metadata:[{provider:"measure-decorator"}]
                });
            }
        }

        descriptor.value = function(...args:unknown[]){
            const start = performance.now();

            const wrapper = Promise.resolve(originalMethod.apply(this,args));

            return wrapper.then((result) =>{
                const end = performance.now();

                trackMethodDuration(start,end);

                return result;
            }).catch((error)=>{
                const end = performance.now();

                trackMethodDuration(start,end,error);

                throw error;
            })
        }
    }
}

export { Measure };