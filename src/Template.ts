import * as Fs from "@effect/platform-node/FileSystem";
import * as Path from "@effect/platform-node/Path";
import * as PlatformError from "@effect/platform/Error";
import { Context, Data, Effect, Layer, ReadonlyArray, pipe } from "effect";
import _Mustache from "mustache";
import * as file from "./file.js";
import type { FrontmatterSchema } from "./schema.js";

interface PostParams {
  title: string;
  body: string;
  h1: string;
  modifiedAt: string;
  frontmatterSchema: FrontmatterSchema;
}

interface IndexParams {
  files: {
    origin: string;
    modifiedAt: Date;
    frontmatterSchema: FrontmatterSchema;
  }[];
  title: string;
}

class TemplateError extends Data.TaggedError("TemplateError")<{
  error: unknown;
}> {}

export interface Template {
  readonly _: unique symbol;
}

export interface TemplateImpl {
  makePost: (
    params: PostParams
  ) => Effect.Effect<
    never,
    PlatformError.PlatformError | TemplateError,
    string
  >;

  makeIndex: (
    params: IndexParams
  ) => Effect.Effect<
    never,
    PlatformError.PlatformError | TemplateError,
    string
  >;
}

export const Template = Context.Tag<Template, TemplateImpl>("@app/Template");

export const TemplateMustache = Layer.effect(
  Template,
  Effect.map(Effect.all([Fs.FileSystem, Path.Path]), ([fs, path]) =>
    Template.of({
      makePost: (params) =>
        Effect.gen(function* (_) {
          const headerTemplate = yield* _(
            fs.readFileString(path.join(__dirname, "templates", "header.html"))
          );
          const template = yield* _(
            fs.readFileString(path.join(__dirname, "templates", "post.html"))
          );
          const header = _Mustache.render(headerTemplate, params);
          return _Mustache.render(template, {
            tags: params.frontmatterSchema.tags,
            body: params.body,
            h1: params.h1,
            modifiedAt: params.modifiedAt,
            title: params.title,
            header,
          });
        }),

      makeIndex: (params) =>
        Effect.gen(function* (_) {
          const headerTemplate = yield* _(
            fs.readFileString(path.join(__dirname, "templates", "header.html"))
          );
          const template = yield* _(
            fs.readFileString(path.join(__dirname, "templates", "index.html"))
          );
          const header = _Mustache.render(headerTemplate, params);
          return _Mustache.render(template, {
            title: params.title,
            header,
            body: pipe(
              params.files,
              file.sort,
              ReadonlyArray.map(
                ({ modifiedAt, origin, frontmatterSchema }) => ({
                  tags: frontmatterSchema.tags,
                  name: file.title(origin),
                  time: modifiedAt.toDateString(),
                  href: `/${file.fileName(origin)}.html`,
                })
              )
            ),
          });
        }),
    })
  )
).pipe(Layer.provide(Layer.mergeAll(Fs.layer, Path.layer)));
