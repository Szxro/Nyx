import { Bot } from "./bootstrap/bot";

(async () =>{
    const bot = new Bot();

    await bot.runAsync();
})();