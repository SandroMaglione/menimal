import { Brand, Context, Data, Effect, Layer } from "effect";
import * as Showdown from "./Showdown.js";

class ConverterError extends Data.TaggedError("ConverterError")<{
  error: unknown;
}> {}

type Html = string & Brand.Brand<"Html">;
const Html = Brand.nominal<Html>();

export interface Converter {
  readonly _: unique symbol;
}

export interface ConverterImpl {
  makeHtml: (markdown: string) => Effect.Effect<Html, ConverterError, never>;
}

export const Converter = Context.GenericTag<Converter, ConverterImpl>(
  "@app/Converter"
);

export const ConverterShowdown = Layer.effect(
  Converter,
  Effect.map(Showdown.Showdown, (converter) =>
    Converter.of({
      makeHtml: (markdown) =>
        Effect.gen(function* (_) {
          const html = converter.makeHtml(markdown);
          return Html(html);
        }),
    })
  )
).pipe(Layer.provide(Showdown.ShowdownLive));
