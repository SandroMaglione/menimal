import * as Fs from "@effect/platform-node/FileSystem";
import { Console, Effect } from "effect";

const program = Effect.gen(function* (_) {
  const fs = yield* _(Fs.FileSystem);
  const fileNames = yield* _(fs.readDirectory(`./pages`));
  yield* _(Console.log("Files in 'pages':", fileNames));

  const files = yield* _(
    Effect.all(
      fileNames.map((fileName) => fs.readFileString(`./pages/${fileName}`)),
      { concurrency: "unbounded" } // TODO
    )
  );
  yield* _(Console.log("File content:", files));

  return;
});

const runnable = program.pipe(Effect.provide(Fs.layer));

const main = runnable.pipe(
  Effect.catchTags({
    BadArgument: (error) => Console.log("Arg error", error),
    SystemError: (error) => Console.log("System error", error),
  })
);

Effect.runPromise(main);
