import { Nyx } from "./bootstrap/nyx";

(async () =>{
    const bot = new Nyx();

    await bot.runAsync();
})();