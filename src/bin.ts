import { Console, Effect, Layer, ReadonlyArray, pipe } from "effect";
import * as Converter from "./Converter";
import * as Css from "./Css";
import * as FileSystem from "./FileSystem";
import * as Template from "./Template";

const program = Effect.gen(function* (_) {
  const fileSystem = yield* _(FileSystem.FileSystem);
  const css = yield* _(Css.Css);
  const template = yield* _(Template.Template);
  const converter = yield* _(Converter.Converter);

  const files = yield* _(fileSystem.buildMarkdownFiles);
  yield* _(Console.log("File content:", files));

  yield* _(
    Effect.all(
      pipe(
        files,
        ReadonlyArray.map((markdownFile) =>
          Effect.gen(function* (_) {
            const body = yield* _(converter.makeHtml(markdownFile.markdown));
            const html = yield* _(
              template.makePage({ body, title: markdownFile.fileName })
            );

            return yield* _(
              fileSystem.writeHtml({ fileName: markdownFile.fileName, html })
            );
          })
        )
      )
    )
  );
  yield* _(Console.log("'build' generated!"));

  const styleCss = yield* _(css.build);
  yield* _(fileSystem.writeCss({ source: styleCss }));
  yield* _(Console.log("Added css styles!"));

  return;
});

const runnable = program.pipe(
  Effect.provide(
    Layer.mergeAll(
      Converter.ConverterShowdown,
      Template.TemplateMustache,
      Css.CssLightingCss,
      FileSystem.FileSystemLive
    )
  )
);

const main = runnable.pipe(
  Effect.catchTags({
    BadArgument: (error) => Console.log("Arg error", error),
    SystemError: (error) => Console.log("System error", error),
    ConverterError: (error) =>
      Console.log("Cannot covert markdown to html", error),
  })
);

Effect.runPromise(main);
