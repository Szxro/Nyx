import { Job } from "node-schedule";
import { ServiceHandler } from "../handlers";

type JobErrorHandler = (name: string, error: unknown, job:Job) => void;

type JobProps = { services:ServiceHandler };

interface IJobOptions{
    name: string;
    cronExpression:string;
    once?: boolean;
    onInit?:boolean;
    retryOnFailure?:boolean;
}

interface IJob extends IJobOptions {
    execute:(props:JobProps) => Promise<void> | void;
    stop:(props:JobProps) => Promise<void> | void;
    errorHandler:JobErrorHandler;
}

interface IJobSchedule {
    job:Job,
    cronExpression:string,
    onInit?:boolean
}

export { IJob, IJobSchedule,JobErrorHandler,IJobOptions,JobProps };

  