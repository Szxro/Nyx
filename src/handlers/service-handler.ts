import { SingletonConstructor,TransientConstructor } from "../models";
import { NotFoundService } from "../errors/not-found-service";

class ServiceHandler{
    private _singleton:Map<string,unknown> = new Map();
    private _transient:Map<string,unknown> = new Map();

    private static _instance:ServiceHandler;

    private constructor(){}

    public static getInstance():ServiceHandler{
        if(!ServiceHandler._instance){
            this._instance = new ServiceHandler();
        }

        return ServiceHandler._instance;
    }
    
    register<T>(serviceName:string,serviceConstructor:SingletonConstructor<T> | TransientConstructor<T>):void{
        if(this._singleton.has(serviceName) || this._transient.has(serviceName)) return;

        if(this.isSingleton(serviceConstructor)){
            const instance = serviceConstructor.getInstance();

            this._singleton.set(serviceName,instance);
        }else{
            this._transient.set(serviceName,serviceConstructor);
        }
    }

    getServiceByName<T = unknown>(serviceName:string,options?:unknown[]):T{
        if(this._singleton.has(serviceName)){
            const instance = this._singleton.get(serviceName);

            return instance as T;
        }

        if(this._transient.has(serviceName)){
            const serviceConstructor = this._transient.get(serviceName) as TransientConstructor<T>;

            return new serviceConstructor(options);
        }

        throw new NotFoundService(`The service with the name ${serviceName} is not currently register`);
    }

    private isSingleton<T>(service:unknown):service is SingletonConstructor<T>{
        return (service as SingletonConstructor<T>).getInstance !== undefined || typeof (service as SingletonConstructor<T>).getInstance === 'function';
    }
}

export { ServiceHandler };