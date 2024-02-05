#!/usr/bin/env node

import { Effect, Layer, LogLevel, Logger, ReadonlyArray, pipe } from "effect";
import * as Converter from "./Converter.js";
import * as Css from "./Css.js";
import * as FileSystem from "./FileSystem.js";
import * as LinkCheck from "./LinkCheck.js";
import { ChalkLogger } from "./Logger.js";
import * as SiteConfig from "./SiteConfig.js";
import * as Template from "./Template.js";

const program = Effect.gen(function* (_) {
  const fileSystem = yield* _(FileSystem.FileSystem);
  const css = yield* _(Css.Css);
  const template = yield* _(Template.Template);
  const converter = yield* _(Converter.Converter);
  const siteConfig = yield* _(SiteConfig.SiteConfig);
  const linkCheck = yield* _(LinkCheck.LinkCheck);

  yield* _(Effect.logInfo("Start build"));
  const files = yield* _(fileSystem.buildMarkdownFiles);
  const fileNames = files.map(({ fileName }) => fileName);

  yield* _(
    Effect.all(
      pipe(
        files,
        ReadonlyArray.map((markdownFile) =>
          Effect.gen(function* (_) {
            const bodyHtml = yield* _(converter.makeHtml(markdownFile.body));

            const html = yield* _(
              template.makePost({
                body: bodyHtml,
                title: siteConfig.name,
                h1: markdownFile.title,
                modifiedAt: markdownFile.modifiedAt.toDateString(),
                frontmatterSchema: markdownFile.frontmatterSchema,
              })
            );

            yield* _(linkCheck.checkLinks({ html, fileNames }));
            return yield* _(
              fileSystem.writeHtml({
                fileName: markdownFile.fileName,
                html,
                frontmatterSchema: markdownFile.frontmatterSchema,
              })
            );
          })
        )
      )
    )
  );
  yield* _(Effect.logInfo("build folder generated"));

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
  yield* _(Effect.logInfo("Added css styles"));

  yield* _(fileSystem.writeStaticFiles);
  yield* _(Effect.logInfo("Copied static files"));
  yield* _(Effect.logInfo("Done ✅"));

  return;
});

const MainLive = Layer.mergeAll(
  Logger.replace(Logger.defaultLogger, ChalkLogger),
  Logger.minimumLogLevel(LogLevel.Info),
  Converter.ConverterShowdown,
  Template.TemplateMustache,
  Css.CssLightingCss,
  FileSystem.FileSystemLive,
  LinkCheck.LinkCheckLive
);

const runnable = program.pipe(
  Effect.provideServiceEffect(SiteConfig.SiteConfig, SiteConfig.load),
  Effect.provide(MainLive)
);

const main: Effect.Effect<never, never, void> = runnable.pipe(
  Effect.catchTags({
    HtmlParseError: (error) => Effect.logError("Invalid HTML"),
    InvalidLinksError: (error) =>
      Effect.logError(`Found invalid links: ${error.links}`),
    SiteConfigError: (error) => Effect.logError("Config error"),
    BadArgument: (error) => Effect.logError("Arg error"),
    SystemError: (error) => Effect.logError(`[System error] ${error.message}`),
    CssError: (error) => Effect.logError("Css error"),
    FrontmatterError: (error) => Effect.logError("Frontmatter invalid"),
    TemplateError: (error) => Effect.logError("Template error"),
    ConverterError: (error) =>
      Effect.logError("Cannot covert markdown to html"),
  })
);

Effect.runPromise(main).catch(console.error);
