import { PromiseFullfilled, PromiseRejected, PromiseWrapperResult } from "../models";

async function WaitOne<T>(promise:Promise<T>):Promise<PromiseWrapperResult<T>>{
    try{
        const data = await promise;
        return {status:"fullfilled",data};
    }catch(reason:unknown){
        return {status:"rejected",reason};
    }
}

function WaitAll<T extends Promise<unknown>[]>(promises:T):Promise<PromiseWrapperResult<Awaited<T>>[]>{
    return Promise.all(
        promises.map((promise) =>
            promise
                .then(data => ({status:"fullfilled",data} as PromiseFullfilled<Awaited<T>>))
                .catch(reason => ({status:"rejected",reason} as PromiseRejected))
        ));
}

export {WaitOne,WaitAll};