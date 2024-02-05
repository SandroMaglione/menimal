import { Context, Data, Effect, Layer } from "effect";
import * as NodeHtmlParse from "node-html-parser";

export class HtmlParseError extends Data.TaggedError("HtmlParseError")<{
  error: unknown;
}> {}

export interface HtmlParse {
  readonly _: unique symbol;
}

export interface HtmlParseImpl {
  parse: (
    html: string
  ) => Effect.Effect<never, HtmlParseError, NodeHtmlParse.HTMLElement>;
}

export const HtmlParse = Context.Tag<HtmlParse, HtmlParseImpl>(
  "@app/HtmlParse"
);

export const NodeHtmlParseLive = Layer.succeed(
  HtmlParse,
  HtmlParse.of({
    parse: (html) =>
      Effect.gen(function* (_) {
        return yield* _(
          Effect.try({
            try: () => NodeHtmlParse.parse(html),
            catch: (error) => new HtmlParseError({ error }),
          })
        );
      }),
  })
);
