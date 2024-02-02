import * as Fs from "@effect/platform-node/FileSystem";
import * as PlatformError from "@effect/platform/Error";
import { Console, Context, Effect, Layer, ReadonlyArray, pipe } from "effect";

interface MarkdownFile {
  markdown: string;
  fileName: string;
}

export interface FileSystem {
  readonly _: unique symbol;
}
export interface FileSystemImpl {
  buildMarkdownFiles: Effect.Effect<
    never,
    PlatformError.PlatformError,
    MarkdownFile[]
  >;

  writeHtml: (params: {
    fileName: string;
    html: string;
  }) => Effect.Effect<never, PlatformError.PlatformError, void>;

  writeCss: (params: {
    source: globalThis.Uint8Array;
  }) => Effect.Effect<never, PlatformError.PlatformError, void>;
}

export const FileSystem = Context.Tag<FileSystem, FileSystemImpl>(
  "@app/FileSystem"
);

export const FileSystemLive = Layer.effect(
  FileSystem,
  Effect.map(Fs.FileSystem, (fs) =>
    FileSystem.of({
      buildMarkdownFiles: Effect.gen(function* (_) {
        const fileNames = yield* _(fs.readDirectory(`./pages`)); // TODO: Config for path "pages"
        yield* _(Console.log("Files in 'pages':", fileNames));

        const readFiles = (fileNameWithExtension: string) =>
          Effect.gen(function* (_) {
            const markdown = yield* _(
              fs.readFileString(`./pages/${fileNameWithExtension}`)
            );
            const fileName = fileNameWithExtension.replace(/\.[^/.]+$/, "");
            return { fileName, markdown };
          });

        const files = yield* _(
          Effect.all(
            pipe(fileNames, ReadonlyArray.map(readFiles)),
            { concurrency: "unbounded" } // TODO
          )
        );

        const existsBuild = yield* _(fs.exists("./build"));
        if (existsBuild) {
          yield* _(fs.remove("./build", { recursive: true }));
        }

        yield* _(fs.makeDirectory("./build"));

        return files;
      }),

      writeHtml: ({ fileName, html }) =>
        Effect.gen(function* (_) {
          yield* _(fs.writeFileString(`./build/${fileName}.html`, html));
        }),

      writeCss: ({ source }) =>
        Effect.gen(function* (_) {
          yield* _(fs.writeFile("./build/style.css", source));
        }),
    })
  )
).pipe(Layer.provide(Fs.layer));
