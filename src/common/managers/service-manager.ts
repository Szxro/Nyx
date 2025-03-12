import { NotFoundService } from "../errors/not-found-service";

type SingletonConstructor<T> = { getInstance():T };

type TransientConstructor<T> = new (...options:unknown[]) => T;

class ServiceManager{
    private _singleton:Map<string,unknown> = new Map();
    private _transient:Map<string,unknown> = new Map();

    private static _instance:ServiceManager;

    private constructor(){}

    public static getInstance():ServiceManager{
        if(!ServiceManager._instance){
            this._instance = new ServiceManager();
        }

        return ServiceManager._instance;
    }
    
    register(serviceName:string,serviceConstructor:Function):void{
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

    clear(): void{
        this._singleton.clear();
        this._transient.clear();
    }

    private isSingleton<T>(service:unknown):service is SingletonConstructor<T>{
        return (service as SingletonConstructor<T>).getInstance !== undefined || typeof (service as SingletonConstructor<T>).getInstance === 'function';
    }
}


export { ServiceManager };

