import * as Fs from "@effect/platform-node/FileSystem";
import * as PlatformError from "@effect/platform/Error";
import { Context, Data, Effect, Layer } from "effect";
import * as _Mustache from "mustache";

interface PageParams {
  title: string;
  body: string;
  h1: string;
}

class TemplateError extends Data.TaggedError("TemplateError")<{
  error: unknown;
}> {}

export interface Template {
  readonly _: unique symbol;
}

export interface TemplateImpl {
  makePage: (
    params: PageParams
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
      makePage: (params) =>
        Effect.gen(function* (_) {
          const headerTemplate = yield* _(
            fs.readFileString("./templates/header.html")
          );
          const template = yield* _(
            fs.readFileString("./templates/index.html")
          );
          const header = _Mustache.render(headerTemplate, params);
          return _Mustache.render(template, {
            ...params,
            header,
          });
        }),
    })
  )
).pipe(Layer.provide(Fs.layer));
