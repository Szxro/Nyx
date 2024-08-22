class QueueNode<T>{
    public element:T;
    public next:QueueNode<T> | null = null;

    constructor(element:T){
        this.element = element;
    }
}

export { QueueNode };