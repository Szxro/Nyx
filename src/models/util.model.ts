type PromiseFullfilled<T> = { status:"fullfilled", data:T };

type PromiseRejected = { status:"rejected",reason:unknown };


type PromiseWrapperResult<T> = PromiseFullfilled<T> | PromiseRejected;

export { PromiseWrapperResult,PromiseFullfilled,PromiseRejected };