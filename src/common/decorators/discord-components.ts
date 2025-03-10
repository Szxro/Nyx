import { CommandProps } from "../../models/commands";
import { EventKeys, EventProps } from "../../models/event";

type Constructor = { new(...args:any[]): NonNullable<unknown> };

function DiscordDecoratorFactory<TProps>(props: TProps) {
    return function <T extends Constructor>(target: T) {
        return class extends target {
            constructor(...args: any[]) {
                super(props);
            }
        };
    };
}

function DiscordCommand(props:Omit<CommandProps,'callback'>){
    return DiscordDecoratorFactory(props);
}

function DiscordEvent<TEvent extends EventKeys>(props:EventProps<TEvent>){
    return DiscordDecoratorFactory<EventProps<TEvent>>(props);
}

export { DiscordCommand, DiscordEvent };

