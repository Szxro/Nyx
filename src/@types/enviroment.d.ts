// d.ts files are use for global variables
declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DISCORD_TOKEN: string;
        CLIENT_ID: string;
        SERVER_ID:string;
        LOGGER_MIN_LEVEL:string;
        NODE_ENV:string;
      }
    }
  }
  
  export { }; // exporting the global object for use

