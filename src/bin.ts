import { Console, Effect } from "effect";

const program = Console.log("Hello, World!");

Effect.runSync(program);
