import { config } from "dotenv";
import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { z } from "zod";

// Load environment variables
const ENVIRONMENT  = process.env.NODE_ENV || "development";

config({path:resolve(process.cwd(),`.env.${ENVIRONMENT}`)});

// Discord intents
const CLIENT_INTENTS = 32767;  // Note: 32767 represent all possibles intents

// Log directory setup
const LOG_DIRNAME = join(process.cwd(),'logs');

if(!existsSync(LOG_DIRNAME)){
    mkdirSync(LOG_DIRNAME,{ recursive: true});
}

// Environment variable validation
const envSchema = z.object({
    CLIENT_ID: z.string().min(1,"CLIENT_ID must be defined"),
    DISCORD_TOKEN: z.string().min(1,"DISCORD_TOKEN must be defined"),
    LOGGER_MIN_LEVEL: z.string().default("info"),
    SERVER_ID: z.string().min(1,"SERVER_ID must be defined")
});

const { success, data, error } = envSchema.safeParse(process.env);

if(!success){
    console.error("❌ Invalid environment variables:",error.format());
    process.exit(1);
}

export const configuration = {
    LOG_DIRNAME,
    CLIENT_INTENTS,
    ENVIRONMENT,
    ...data
}