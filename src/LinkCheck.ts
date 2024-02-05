import {
  Context,
  Data,
  Effect,
  Layer,
  Option,
  ReadonlyArray,
  pipe,
} from "effect";
import * as HtmlParse from "./HtmlParse";
import * as file from "./file.js";

class InvalidLinksError extends Data.TaggedError("InvalidLinksError")<{
  source: "internal" | "external";
  links: readonly string[];
}> {}

export interface LinkCheck {
  readonly _: unique symbol;
}

export interface LinkCheckImpl {
  checkLinks: (params: {
    html: string;
    fileNames: readonly string[];
  }) => Effect.Effect<
    never,
    HtmlParse.HtmlParseError | InvalidLinksError,
    void
  >;
}

export const LinkCheck = Context.Tag<LinkCheck, LinkCheckImpl>(
  "@app/LinkCheck"
);

export const LinkCheckLive = Layer.effect(
  LinkCheck,
  Effect.map(HtmlParse.HtmlParse, (htmlParse) =>
    LinkCheck.of({
      checkLinks: ({ html, fileNames }) =>
        Effect.gen(function* (_) {
          const htmlElement = yield* _(htmlParse.parse(html));
          const [allInternalLinks, allExternalLinks] = pipe(
            htmlElement.getElementsByTagName("A"),
            ReadonlyArray.filterMap((element) =>
              Option.fromNullable(element.getAttribute("HREF"))
            ),
            ReadonlyArray.partition((href) => href.startsWith("http"))
          );

          yield* _(
            Effect.logInfo(`🔗 ${allInternalLinks.length} total internal links`)
          );
          yield* _(
            Effect.logInfo(`🔗 ${allExternalLinks.length} total external links`)
          );

          yield* _(
            allExternalLinks,
            Effect.validateAll((href) =>
              pipe(
                Effect.tryPromise({
                  try: () => fetch(href, { method: "HEAD" }),
                  catch: () => href,
                }),
                Effect.flatMap((response) =>
                  response.ok ? Effect.succeed(href) : Effect.fail(href)
                )
              )
            ),
            Effect.mapError(
              (invalidLinks) =>
                new InvalidLinksError({
                  links: invalidLinks,
                  source: "external",
                })
            )
          );

          yield* _(
            allInternalLinks,
            Effect.validateAll((href) =>
              href === "/" ||
              (href.endsWith(".html") &&
                fileNames.includes(file.fileName(href)))
                ? Effect.succeed(href)
                : Effect.fail(href)
            ),
            Effect.mapError(
              (invalidLinks) =>
                new InvalidLinksError({
                  links: invalidLinks,
                  source: "internal",
                })
            )
          );

          yield* _(Effect.logInfo("🔗 All links valid"));
        }),
    })
  )
).pipe(Layer.provide(HtmlParse.NodeHtmlParseLive));
