import { createLogger, format, Logger, transports } from "winston";
import { LOGGER_CONFIG } from "../constants/config";
import { LogMessage } from "../models";

class LoggerService{
    private _logger:Logger = createLogger({
        level:LOGGER_CONFIG.MIN_LEVEL,
        transports:[
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.timestamp({
                        format:'YYYY-MM-DD HH:mm:ss A'
                    }),
                    format.printf((info) => `[${info.timestamp}] ${info.level}: [${info.provider}] ${info.message}`)
                )
            }),
            new transports.File({
                filename:"error.log",
                level:"error",
                dirname:LOGGER_CONFIG.LOG_DIRNAME,
                format:format.combine(
                    format.json(),
                    format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss A'
                    }),
                    format.prettyPrint()
                ),
            }),
            new transports.File({
                filename:"warn.log",
                level:"warn",
                dirname:LOGGER_CONFIG.LOG_DIRNAME,
                format:format.combine(
                    format.json(),
                    format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss A'
                    }),
                    format.prettyPrint()
                )
            })
        ]
    });

    private static _instance:LoggerService;

    private constructor(){}

    public static getInstance():LoggerService{
        if(!LoggerService._instance){
            this._instance = new LoggerService();
        }

        return LoggerService._instance;
    }

    public info({message,metadata}:LogMessage){
        return this._logger.info(message,...metadata);
    }

    public error({message,metadata}:LogMessage){
        return this._logger.error(message,...metadata);
    }

    public warning({message,metadata}:LogMessage){
        return this._logger.warn(message,...metadata);
    }
}

export { LoggerService };
