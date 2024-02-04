#!/usr/bin/env node

import { Effect, Layer, ReadonlyArray, pipe } from "effect";
import * as Converter from "./Converter";
import * as Css from "./Css";
import * as FileSystem from "./FileSystem";
import * as Frontmatter from "./Frontmatter";
import * as SiteConfig from "./SiteConfig";
import * as Template from "./Template";

const program = Effect.gen(function* (_) {
  const fileSystem = yield* _(FileSystem.FileSystem);
  const css = yield* _(Css.Css);
  const template = yield* _(Template.Template);
  const converter = yield* _(Converter.Converter);
  const frontmatter = yield* _(Frontmatter.Frontmatter);
  const siteConfig = yield* _(SiteConfig.SiteConfig);

  const files = yield* _(fileSystem.buildMarkdownFiles);
  yield* _(Effect.logInfo(`File content: ${files}`));

  yield* _(
    Effect.all(
      pipe(
        files,
        ReadonlyArray.map((markdownFile) =>
          Effect.gen(function* (_) {
            const { body, frontmatterSchema } = yield* _(
              frontmatter.extractFrontmatter(markdownFile.markdown)
            );
            const bodyHtml = yield* _(converter.makeHtml(body));

            const html = yield* _(
              template.makePost({
                body: bodyHtml,
                title: siteConfig.name,
                h1: markdownFile.title,
                modifiedAt: markdownFile.modifiedAt.toDateString(),
              })
            );

            return yield* _(
              fileSystem.writeHtml({
                fileName: markdownFile.fileName,
                html,
                frontmatterSchema,
              })
            );
          })
        )
      )
    )
  );
  yield* _(Effect.logInfo("'build' generated!"));

  const indexHtml = yield* _(
    template.makeIndex({
      title: siteConfig.name,
      files,
    })
  );
  yield* _(fileSystem.writeIndex({ html: indexHtml }));
  yield* _(Effect.logInfo("Added index"));

  const styleCss = yield* _(css.build);
  yield* _(fileSystem.writeCss({ source: styleCss }));
  yield* _(Effect.logInfo("Added css styles!"));

  yield* _(fileSystem.writeStaticFiles);
  yield* _(Effect.logInfo("Copied static files!"));

  return;
});

const runnable = program.pipe(
  Effect.provideServiceEffect(SiteConfig.SiteConfig, SiteConfig.load),
  Effect.provide(
    Layer.mergeAll(
      Converter.ConverterShowdown,
      Template.TemplateMustache,
      Css.CssLightingCss,
      FileSystem.FileSystemLive,
      Frontmatter.FrontmatterLive
    )
  )
);

const main: Effect.Effect<never, never, void> = runnable.pipe(
  Effect.catchTags({
    SiteConfigError: (error) => Effect.logInfo("Config error"),
    BadArgument: (error) => Effect.logInfo("Arg error"),
    SystemError: (error) => Effect.logInfo("System error"),
    CssError: (error) => Effect.logInfo("Css error"),
    FrontmatterError: (error) => Effect.logInfo("Frontmatter invalid"),
    TemplateError: (error) => Effect.logInfo("Template error"),
    ConverterError: (error) => Effect.logInfo("Cannot covert markdown to html"),
  })
);

Effect.runPromise(main);
