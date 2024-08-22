type SingletonConstructor<T> = { getInstance():T };

type TransientConstructor<T> = new (...options:unknown[]) => T;

export { SingletonConstructor,TransientConstructor };