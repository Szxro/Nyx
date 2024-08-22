import { config } from "dotenv";
import path from "path";

const enviroment = process.env.NODE_ENV || "development";

config({path:path.resolve(process.cwd(),`.env.${enviroment}`)});

const ENVIROMENT_CONFIG = process.env.NODE_ENV || "development";

const CLIENT_CONFIG = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    SERVER_ID:process.env.SERVER_ID,
} as const;

// 32767 represent all possibles intents
const CLIENT_INTENTS = 32767; 

const LOGGER_CONFIG = {
    MIN_LEVEL: process.env.LOGGER_MIN_LEVEL,
    LOG_DIRNAME:path.join(process.cwd(),'logs')
} as const;

export { CLIENT_CONFIG,CLIENT_INTENTS,LOGGER_CONFIG,ENVIROMENT_CONFIG };