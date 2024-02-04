import { FileSystem, Path } from "@effect/platform-node";
import { Effect, Layer } from "effect";

const program = Effect.gen(function* (_) {
  const fs = yield* _(FileSystem.FileSystem);
  const path = yield* _(Path.Path);

  yield* _(Effect.log(`[Build] Copying templates ...`));
  yield* _(
    fs.copy(path.join("src", "templates"), path.join("dist", "templates"))
  );
  yield* _(Effect.log("[Build] Build completed."));
}).pipe(Effect.provide(Layer.merge(FileSystem.layer, Path.layerPosix)));

Effect.runPromise(program).catch(console.error);
