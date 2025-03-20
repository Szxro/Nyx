import { config } from "dotenv";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { z } from "zod";

config();

// Log directory setup
const LOG_DIRNAME = join(process.cwd(),'logs');

if(!existsSync(LOG_DIRNAME)){
    mkdirSync(LOG_DIRNAME,{ recursive: true});
}

// Environment variable validation
const envSchema = z.object({
    NODE_ENV: z.string().min(1,"NODE_ENV must be provided"),
    DISCORD_TOKEN: z.string().min(1,"DISCORD_TOKEN must be defined"),
    APPLICATION_ID: z.string().min(1,"APPLICATION_ID must be defined"),
    DEV_SERVER_ID: z.string().min(1,"DEV_SERVER_ID must be defined"),
    PROD_SERVER_ID: z.string().min(1,"PROD_SERVER_ID must be defined"),
    LOGGER_MIN_LEVEL: z.string().default("info")
});

const { success, data, error } = envSchema.safeParse(process.env);

if(!success){
    console.error("❌ Invalid environment variables:",error.format());
    process.exit(1);
}

export const configuration = {
    CLIENT_INTENTS: 32767,  // Note: 32767 represent all possibles intents
    LOG_DIRNAME,
    ...data
}