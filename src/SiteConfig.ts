import * as Schema from "@effect/schema/Schema";
import { Context, Data, Effect, Either } from "effect";
import * as FileSystem from "./FileSystem.js";
import { ConfigSchema } from "./schema.js";

class SiteConfigError extends Data.TaggedError("SiteConfigError")<{
  error: unknown;
}> {}

export interface SiteConfig {
  readonly _: unique symbol;
}

export const SiteConfig = Context.Tag<SiteConfig, ConfigSchema>(
  "@app/SiteConfig"
);

export const load = Effect.gen(function* (_) {
  const fileSystem = yield* _(FileSystem.FileSystem);
  const config = yield* _(fileSystem.readConfig);
  const siteConfig = yield* _(
    config,
    Schema.decodeUnknownEither(Schema.parseJson()),
    Either.flatMap(Schema.decodeUnknownEither(ConfigSchema)),
    Either.mapLeft((error) => new SiteConfigError({ error }))
  );
  return SiteConfig.of(siteConfig);
});
