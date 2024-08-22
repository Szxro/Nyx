class NotFoundService extends Error{
    constructor(message:string){
        super(message);

        this.name = "NotFoundService";
    }
}

export { NotFoundService };