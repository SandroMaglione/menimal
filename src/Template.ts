import * as Fs from "@effect/platform-node/FileSystem";
import * as PlatformError from "@effect/platform/Error";
import { Context, Data, Effect, Layer, ReadonlyArray, pipe } from "effect";
import * as _Mustache from "mustache";
import * as file from "./file";

interface PostParams {
  title: string;
  body: string;
  h1: string;
  modifiedAt: string;
}

interface IndexParams {
  files: { origin: string; modifiedAt: Date }[];
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
  Effect.map(Fs.FileSystem, (fs) =>
    Template.of({
      makePost: (params) =>
        Effect.gen(function* (_) {
          const headerTemplate = yield* _(
            fs.readFileString("./templates/header.html")
          );
          const template = yield* _(fs.readFileString("./templates/post.html"));
          const header = _Mustache.render(headerTemplate, params);
          return _Mustache.render(template, {
            ...params,
            header,
          });
        }),

      makeIndex: (params) =>
        Effect.gen(function* (_) {
          const headerTemplate = yield* _(
            fs.readFileString("./templates/header.html")
          );
          const template = yield* _(
            fs.readFileString("./templates/index.html")
          );
          const header = _Mustache.render(headerTemplate, params);
          return _Mustache.render(template, {
            title: params.title,
            header,
            body: pipe(
              params.files,
              file.sort,
              ReadonlyArray.map(({ modifiedAt, origin }) => ({
                name: file.title(origin),
                time: modifiedAt.toDateString(),
                href: `/${file.fileName(origin)}.html`,
              }))
            ),
          });
        }),
    })
  )
).pipe(Layer.provide(Fs.layer));
