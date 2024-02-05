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

class InvalidLinksError extends Data.TaggedError("InvalidLinksError")<{
  links: readonly string[];
}> {}

export interface LinkCheck {
  readonly _: unique symbol;
}

export interface LinkCheckImpl {
  checkLinks: (
    html: string
  ) => Effect.Effect<never, HtmlParse.HtmlParseError | InvalidLinksError, void>;
}

export const LinkCheck = Context.Tag<LinkCheck, LinkCheckImpl>(
  "@app/LinkCheck"
);

export const LinkCheckLive = Layer.effect(
  LinkCheck,
  Effect.map(HtmlParse.HtmlParse, (htmlParse) =>
    LinkCheck.of({
      checkLinks: (html) =>
        Effect.gen(function* (_) {
          const htmlElement = yield* _(htmlParse.parse(html));
          const allLinks = pipe(
            htmlElement.getElementsByTagName("A"),
            ReadonlyArray.filterMap((element) =>
              Option.fromNullable(element.getAttribute("HREF"))
            ),
            ReadonlyArray.filter((href) => href.startsWith("http"))
          );

          yield* _(Effect.logInfo(`🔗 ${allLinks.length} total links`));

          yield* _(
            allLinks,
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
              (invalidLinks) => new InvalidLinksError({ links: invalidLinks })
            )
          );

          yield* _(Effect.logInfo("🔗 All links valid"));
        }),
    })
  )
).pipe(Layer.provide(HtmlParse.NodeHtmlParseLive));
