interface IMeasureOptions{
    name:string;
    type: "job" | "command" | "event";
    validateTime?:boolean;
}

export { IMeasureOptions };