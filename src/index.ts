import { Bot } from "./bootstrap/bot";

(async () =>{
    const bot = new Bot();
console.log("hola")
    await bot.runAsync();
})();