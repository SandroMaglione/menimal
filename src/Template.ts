import * as Fs from "@effect/platform-node/FileSystem";
import * as PlatformError from "@effect/platform/Error";
import { Context, Data, Effect, Layer } from "effect";
import * as _Mustache from "mustache";

interface TemplateParams {
  title: string;
  body: string;
}

class TemplateError extends Data.TaggedError("TemplateError")<{
  error: unknown;
}> {}

export interface Template {
  readonly _: unique symbol;
}

export interface TemplateImpl {
  makePage: (
    params: TemplateParams
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
          const template = yield* _(
            fs.readFileString("./templates/index.html")
          );
          return _Mustache.render(template, params);
        }),
    })
  )
).pipe(Layer.provide(Fs.layer));
