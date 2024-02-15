import * as NodeFs from "@effect/platform-node/NodeFileSystem";
import * as PlatformError from "@effect/platform/Error";
import * as Fs from "@effect/platform/FileSystem";
import { Context, Data, Effect, Layer } from "effect";
import * as _Lightningcss from "lightningcss";

class CssError extends Data.TaggedError("CssError")<{
  error: unknown;
}> {}

export interface Css {
  readonly _: unique symbol;
}

export interface CssImpl {
  build: Effect.Effect<
    globalThis.Uint8Array,
    PlatformError.PlatformError | CssError,
    never
  >;
}

export const Css = Context.GenericTag<Css, CssImpl>("@app/Css");

export const CssLightingCss = Layer.effect(
  Css,
  Effect.map(Fs.FileSystem, (fs) =>
    Css.of({
      build: Effect.gen(function* (_) {
        const code = yield* _(fs.readFile("./style.css"));
        const result = _Lightningcss.transform({
          code,
          filename: "style.css",
          minify: true,
        });
        return result.code;
      }),
    })
  )
).pipe(Layer.provide(NodeFs.layer));
