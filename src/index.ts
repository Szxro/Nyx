import { Nyx } from "./bootstrap/nyx";

(async () =>{
    const bot = new Nyx();
console.log("hola mundo");
    await bot.runAsync();
})();