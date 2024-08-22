import { Host } from "./start/host";

(async() =>{
    const host = new Host();

    await host.runAsync();
})();
