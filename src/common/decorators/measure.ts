import { LoggerService } from "../../services/logger-service";

type MeasureOptions = {
    type: "command" | "event";
    validateTime?:boolean;
}

function Measure({ type, validateTime = true }: MeasureOptions) {
    return function(target: Function, context: ClassMethodDecoratorContext) {
        const methodName = target.name;
        const logger = LoggerService.getInstance();

        return function (this: unknown, ...args: unknown[]){
            const trackMethodDuration = (start: number, end: number, error?: unknown) => {
                const delta = end - start;

                if (error !== undefined) {
                     logger.error({
                        message:`The ${type} ${methodName} failed after ${delta}ms`,
                        metadata:[{
                            provider:"measure-decorator",
                            stack:error instanceof Error ? error.stack || "Not available stack" : error
                        }]
                    });
    
                    return;
                }

                if (delta > 3000 && validateTime) {
                    logger.warning({
                        message:`The ${type} ${methodName} finish succesfully after ${delta}ms, it excedded 3000ms, the connection with the discord webhook is lost`,
                        metadata:[{
                            provider:"measure-decorator"
                        }]
                    });
                } else {
                    logger.info({
                        message:`The ${type} ${methodName} finish succesfully after ${delta}ms`,
                        metadata:[{
                            provider:"measure-decorator"
                        }]
                    });
                }
            };

            const start = performance.now();

            // Wrapping the method to always return a promise (even if is a sync or async method)
            const wrapper = Promise.resolve(target.apply(this,args));

            return wrapper.then((result) =>{
                const end = performance.now();

                trackMethodDuration(start,end);

                return result;
            }).catch((error) =>{
                const end = performance.now();

                trackMethodDuration(start,end,error);

                throw error;
            });
        };
    };
}

export { Measure };

