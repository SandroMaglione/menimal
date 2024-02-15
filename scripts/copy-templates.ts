import * as NodeFs from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import * as Fs from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import { Effect, Layer } from "effect";

const program = Effect.gen(function* (_) {
  const fs = yield* _(Fs.FileSystem);
  const path = yield* _(Path.Path);

  yield* _(Effect.log(`[Build] Copying templates ...`));
  yield* _(
    fs.copy(path.join("src", "templates"), path.join("dist", "templates"))
  );
  yield* _(Effect.log("[Build] Build completed."));
}).pipe(Effect.provide(Layer.merge(NodeFs.layer, NodePath.layerPosix)));

Effect.runPromise(program).catch(console.error);
