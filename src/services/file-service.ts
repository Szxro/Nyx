import { glob } from "glob";
import {join, sep} from "path";
import { ServiceHandler } from "../handlers";
import { LoggerService } from "./index";
import { ILoadOptions } from "../models";

class FileService{
    private _logger = ServiceHandler.getInstance().getServiceByName<LoggerService>("LoggerService")

    async LoadModules({path,pattern}:ILoadOptions):Promise<Object[]>{
        const instances:Object[] = [];

        const filePaths = await glob(`${join(process.cwd(),path)}${pattern ?? "/*[.ts,.js]"}`,{ignore:"./node_modules/*"});

        for(const filePath of filePaths){
            try{
                const module = await import(`file://${join(process.cwd(),filePath)}`);

                if(module.default !== undefined){
                    instances.push(module.default);
                }else{
                    this._logger.warning({
                        message:`Not default export found in the file ${filePath}`,
                        metadata:[{provider:"file-service"}]
                    });
                }
            }catch(error:unknown){
                const fileName = filePath.split(sep).pop()?.split(".")[0];

                this._logger.error({
                    message:`An unexpected error happen while trying to load an instance from the file '${fileName ?? "No available filename"}' `,
                    metadata:[{
                        provider:"file-service",
                        stack:error instanceof Error ? error.stack || "No available stack" : error
                        }]
                    });

                continue;
                }
            }
            return instances;
    }
}

export { FileService };