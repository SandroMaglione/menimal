import { Brand, Context, Data, Effect, Layer } from "effect";
import * as Showdown from "showdown";

class ConverterError extends Data.TaggedError("ConverterError")<{
  error: unknown;
}> {}

type Html = string & Brand.Brand<"Html">;
const Html = Brand.nominal<Html>();

export interface Converter {
  readonly _: unique symbol;
}

export interface ConverterImpl {
  makeHtml: (markdown: string) => Effect.Effect<never, ConverterError, Html>;
}

export const Converter = Context.Tag<Converter, ConverterImpl>(
  "@app/Converter"
);

export const ConverterShowdown = Layer.succeed(
  Converter,
  Converter.of({
    makeHtml: (markdown) =>
      Effect.gen(function* (_) {
        const converter = new Showdown.Converter(); // TODO: Make service
        const html = converter.makeHtml(markdown);
        return Html(html);
      }),
  })
);
