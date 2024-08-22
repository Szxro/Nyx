import { QueueNode } from "./index"

class Queue<T>{
    private _first:QueueNode<T> | null = null;
    private _last:QueueNode<T> | null = null;
    private _size:number = 0;

    enqueue(element:T):void{
        const newNode = new QueueNode<T>(element);

        if(this._first === null){
            this._first = newNode;
            this._last = newNode;
        }else{
            this._last = newNode;
            this._last.next = newNode;
        }

        this._size++;
    }

    dequeue():QueueNode<T> | null{
        if(this._size <= 0) return null;

        const root = this._first;
        this._first = root!.next;

        this._size--;

        return root;
    }

    peek():QueueNode<T> | null{
        return this._first;
    }

    isEmpty():boolean{
        return this._size === 0;
    }
}

export { Queue };