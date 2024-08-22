import { PromiseFullfilled, PromiseRejected, PromiseWrapperResult } from "../models";

function isPromiseFullFilled<T>(promise:PromiseWrapperResult<T>):promise is PromiseFullfilled<T>{
    return promise.status === "fullfilled";
}

function isPromiseRejected<T>(promise:PromiseWrapperResult<T>):promise is PromiseRejected{
    return promise.status === "rejected";
}

export {isPromiseFullFilled,isPromiseRejected};