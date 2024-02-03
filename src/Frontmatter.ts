import * as Schema from "@effect/schema/Schema";
import { Console, Context, Data, Effect, Either, Layer } from "effect";
import * as _FrontMatter from "front-matter";
import { FrontmatterSchema } from "./schema";

class FrontmatterError extends Data.TaggedError("FrontmatterError")<{
  error: unknown;
}> {}

export interface Frontmatter {
  readonly _: unique symbol;
}

export interface FrontmatterImpl {
  extractFrontmatter: (
    text: string
  ) => Effect.Effect<
    never,
    FrontmatterError,
    { body: string; frontmatterSchema: FrontmatterSchema }
  >;
}

export const Frontmatter = Context.Tag<Frontmatter, FrontmatterImpl>(
  "@app/Frontmatter"
);

export const FrontmatterLive = Layer.succeed(
  Frontmatter,
  Frontmatter.of({
    extractFrontmatter: (text) =>
      Effect.gen(function* (_) {
        const { body, attributes } = _FrontMatter.default(text);
        yield* _(Console.log(attributes));

        const frontmatterSchema = yield* _(
          attributes,
          Schema.decodeUnknownEither(FrontmatterSchema),
          Either.mapLeft((error) => new FrontmatterError({ error }))
        );
        return { body, frontmatterSchema };
      }),
  })
);
