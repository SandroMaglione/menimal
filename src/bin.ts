import * as Fs from "@effect/platform-node/FileSystem";
import { Console, Effect, Layer, ReadonlyArray, pipe } from "effect";
import * as Converter from "./Converter";
import * as Template from "./Template";

interface MarkdownFile {
  markdown: string;
  fileName: string;
}

const readFiles = (fileNameWithExtension: string) =>
  Effect.gen(function* (_) {
    const fs = yield* _(Fs.FileSystem);
    const markdown = yield* _(
      fs.readFileString(`./pages/${fileNameWithExtension}`)
    );
    const fileName = fileNameWithExtension.replace(/\.[^/.]+$/, "");
    return { fileName, markdown };
  });

const writeHtml = (markdownFile: MarkdownFile) =>
  Effect.gen(function* (_) {
    const fs = yield* _(Fs.FileSystem);
    const template = yield* _(Template.Template);

    const converter = yield* _(Converter.Converter);
    const body = yield* _(converter.makeHtml(markdownFile.markdown));
    const html = yield* _(
      template.makePage({ body, title: markdownFile.fileName })
    );
    yield* _(fs.writeFileString(`./build/${markdownFile.fileName}.html`, html));
    return;
  });

const program = Effect.gen(function* (_) {
  const fs = yield* _(Fs.FileSystem);
  const fileNames = yield* _(fs.readDirectory(`./pages`)); // TODO: Config for path "pages"
  yield* _(Console.log("Files in 'pages':", fileNames));

  const files = yield* _(
    Effect.all(
      pipe(fileNames, ReadonlyArray.map(readFiles)),
      { concurrency: "unbounded" } // TODO
    )
  );
  yield* _(Console.log("File content:", files));

  const existsBuild = yield* _(fs.exists("./build"));
  if (existsBuild) {
    yield* _(fs.remove("./build", { recursive: true }));
  }

  yield* _(fs.makeDirectory("./build"));

  yield* _(Effect.all(pipe(files, ReadonlyArray.map(writeHtml))));
  yield* _(Console.log("'build' generated!"));

  return;
});

const runnable = program.pipe(
  Effect.provide(
    Layer.mergeAll(
      Fs.layer,
      Converter.ConverterShowdown,
      Template.TemplateMustache
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
