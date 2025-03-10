import { Awaitable } from "discord.js";

type PromiseFullfilled<T> = { status:"fullfilled", data:T };

type PromiseRejected = { status:"rejected",reason:unknown };

type PromiseWrapperResult<T> = PromiseFullfilled<T> | PromiseRejected;

function isPromiseFullFilled<T>(promise:PromiseWrapperResult<T>):promise is PromiseFullfilled<T>{
    return promise.status === "fullfilled";
}

function isPromiseRejected<T>(promise:PromiseWrapperResult<T>):promise is PromiseRejected{
    return promise.status === "rejected";
}

async function WaitOne<T>(promise:Promise<T> | Awaitable<T>):Promise<PromiseWrapperResult<T>>{
    try{
        const data = await promise;
        return { status:"fullfilled",data };
    }catch(reason:unknown){
        return { status:"rejected",reason };
    }
}

function WaitAll<T extends Promise<unknown>[]>(promises:T):Promise<PromiseWrapperResult<Awaited<T>>[]>{
    return Promise.all(
        promises.map((promise) =>
            promise
                .then(data => ({ status:"fullfilled",data } as PromiseFullfilled<Awaited<T>>))
                .catch(reason => ({ status:"rejected",reason } as PromiseRejected))
        ));
}

export { isPromiseFullFilled, isPromiseRejected, WaitAll, WaitOne };

