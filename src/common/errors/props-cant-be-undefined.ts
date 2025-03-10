class PropsCantBeUndefined extends Error{
    constructor(){
        super("Props can't be undefined, check and try again");

        this.name = "PropsCanBeUndefined";
    }
}
export { PropsCantBeUndefined };
