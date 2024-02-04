import * as Schema from "@effect/schema/Schema";
import { Context, Data, Effect, Either, Layer } from "effect";
import matter from "gray-matter";
import { FrontmatterSchema } from "./schema.js";

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
        const { content: body, data } = matter(text);
        const frontmatterSchema = yield* _(
          data,
          Schema.decodeUnknownEither(FrontmatterSchema),
          Either.mapLeft((error) => new FrontmatterError({ error }))
        );
        return { body, frontmatterSchema };
      }),
  })
);
