import moment from "moment";
import { gracefulShutdown, Job } from "node-schedule";
import { Queue, BaseJob } from "../base";
import { ServiceHandler } from "./index";
import { FileService,LoggerService } from "../services";
import { IJob, IJobSchedule } from "../models";

class SchedulerManager{
    private _queue = new Queue<IJobSchedule>();

    // Services
    private _fileService = ServiceHandler.getInstance().getServiceByName<FileService>("FileService");
    private _loggerService = ServiceHandler.getInstance().getServiceByName<LoggerService>("LoggerService");

    async register():Promise<void>{
        const jobModules = await this._fileService.LoadModules({path:"src/jobs"});

        if(jobModules.length <= 0){
            this._loggerService.warning({
                message:"No current jobs were found",
                metadata:[{provider:"scheduler-handler"}]
            });

            return;
        }

        this._loggerService.info({
            message:`Starting the registering ${jobModules.length} jobs.`,
            metadata:[{provider:"scheduler-handler"}]
        });

        for(const jobModule of jobModules){
            if(jobModule instanceof BaseJob){
                const { cronExpression, onInit } = jobModule.options;

                const job = this.createJob({
                    ...jobModule.options,
                    errorHandler:jobModule.errorHandler,
                    execute:jobModule.execute,
                    stop:jobModule.stop
                });

                this._queue.enqueue({job, cronExpression, onInit});
            }else{
                this._loggerService.warning({
                    message:`Invalid job ${jobModule.constructor.name}. Must extend BaseJob`,
                    metadata:[{provider:"scheduler-handler"}]
                });
            }
        }

        this._loggerService.info({
            message:"All jobs registered successfully.",
            metadata:[{provider:"nyx"}]
        });
    }

    public runner():void{
        if(this._queue.isEmpty()){
            this._loggerService.warning({
                message:"No current jobs in the queue",
                metadata:[{provider:"scheduler-handler"}]
            });

            return;
        }

        while(!this._queue.isEmpty()){
            const node = this._queue.dequeue();

            if(node === null) continue;

            const {job, cronExpression, onInit} = node.element;

            job.schedule(cronExpression);

            if(onInit){
                job.invoke();
            }
        }
    }

    public async shutdown():Promise<void>{
        try{
            this._loggerService.info({
                message:"Shutting down the current running jobs",
                metadata:[{provider:"scheduler-handler"}]
            })
            await gracefulShutdown();
        }catch(err:unknown){
            this._loggerService.error({
                message:"An unknown error occurred while trying to shut down the current running jobs",
                metadata:[{
                    provider:"scheduler-handler",
                    stack: (err instanceof Error ? err.stack : 'Not stack available')
                }]
            })
        }
    }

    private createJob(instance:IJob):Job{
        const {name, execute ,errorHandler ,retryOnFailure ,stop ,once} = instance;

        const newJob = new Job(name,(async() =>{
            try{
                this._loggerService.info({
                    message:`Starting the job ${name} at ${moment().format('MM-DD-YYYY LTS')}`,
                    metadata:[{provider:"scheduler-handler"}]
                });
                
                await Promise.resolve(execute({services:ServiceHandler.getInstance()}));

            }catch(err:unknown){
                if(retryOnFailure !== undefined){
                    await this.retryJobOnFailure(instance,newJob);

                    return;
                }
                
                errorHandler(name,err,newJob);
            }finally{
                if(once !== undefined){
                    newJob.cancel();
                }
            }
        }));

        //@ts-ignore
        newJob.on('canceled',(async() =>{
            try{
                this._loggerService.info({
                    message:`The job ${name} was signaled to canceled its operations at ${moment().format('MM-DD-YYYY LTS')}`,
                    metadata:[{provider:"scheduler-handler"}]
                })

                await Promise.resolve(stop({services:ServiceHandler.getInstance()}));
            }catch(err:unknown){
                this._loggerService.error({
                    message:`An error occurred when trying to stop the job ${name}`,
                    metadata:[{
                        provider:"scheduler-handler",
                        stack: (err instanceof Error ? err.stack : 'Not stack available')
                    }]
                })
            }
        }));

        return newJob;
    }

    private async retryJobOnFailure(instance:IJob,job:Job,maxRetries:number = 3):Promise<void>{
        const { name ,execute } = instance;

        let attempts:number = 0;

        while(attempts < maxRetries){
            try{
                await execute({services:ServiceHandler.getInstance()});
                return;
            }catch(err:unknown){
                attempts++;
                this._loggerService.error({
                    message:`The job ${name} failed after retry count ${attempts}/${maxRetries}`,
                    metadata:[{
                        provider:"scheduler-handler",
                        stack: (err instanceof Error ? err.stack : 'Not stack available')
                    }]
                });
            }
        }

        this._loggerService.info({
            message:`Max attempts reached, stopping the job ${name} at ${moment().format('MM-DD-YYYY LTS')}`,
            metadata:[{provider:"scheduler-handler"}]
        })

        job.cancel();
    }
}

export { SchedulerManager };