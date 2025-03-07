import { config } from "dotenv";
import { join, resolve } from "path";

const enviroment = process.env.NODE_ENV || "development";

config({path:resolve(process.cwd(),`.env.${enviroment}`)});

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
    LOG_DIRNAME: join(process.cwd(),'logs')
} as const;

export { CLIENT_CONFIG, CLIENT_INTENTS, ENVIROMENT_CONFIG, LOGGER_CONFIG };

