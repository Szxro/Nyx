import { NotFoundService } from "../src/common/errors/not-found-service";
import { ServiceManager } from "../src/common/managers/service-manager";

class Transient{}

class Singleton{
    private static _instance:Singleton;

    private constructor(){}

    public static getInstance():Singleton{
        if(!Singleton._instance){
            this._instance = new Singleton();
        }

        return Singleton._instance;
    }
}

const manager = ServiceManager.getInstance();

afterEach(() =>{
    manager.clear();
});

describe('Service Manager tests',() =>{

    test('Service manager instance cant be undefined',() =>{
        expect(manager).not.toBeUndefined();
    });

    test('Service manager instance must be singleton',()=>{
        const instance2 = ServiceManager.getInstance();

        expect(instance2).toBe(manager);
    });
});

describe('getInstance method tests',()=>{

    test("When the method is call, it must return an instance of ServiceManager",()=>{
        const instance = ServiceManager.getInstance();

        expect(instance).toBeInstanceOf(ServiceManager);
    });
});

describe('getServiceByName method tests',()=>{

    test('When the service is not register, its going to throw an exception',()=>{
        expect(() => manager.getServiceByName("DumbService")).toThrow(NotFoundService);
    });

    test('When the service is register, its going to return an instance of it',() =>{
        manager.register('Transient',Transient);
        
        const expectedService = manager.getServiceByName<Transient>(Transient.name);
        
        expect(expectedService).toBeInstanceOf(Transient);
    });

    test("When the service is type transient, its going to retrieve a new one every time",()=>{
        manager.register('Transient',Transient);

        const instance1 = manager.getServiceByName<Transient>(Transient.name);

        const instance2 = manager.getServiceByName<Transient>(Transient.name);

        expect(instance1).not.toBe(instance2);
    });

    test("When the service is type singleton, its going to retrieve a single instance",()=>{
        manager.register(Singleton.name,Singleton);

        const instance1 = manager.getServiceByName<Singleton>(Singleton.name);

        const instance2 = manager.getServiceByName<Singleton>(Singleton.name);

        expect(instance1).toBe(instance2);
    });
});

describe('clear method tests',()=>{

    test("When the clear method is call, its going to wiped all the services from both maps",()=>{
        manager.register('Transient',Transient);

        manager.clear();

        expect(() => manager.getServiceByName("Transient")).toThrow(NotFoundService);
    });
});
