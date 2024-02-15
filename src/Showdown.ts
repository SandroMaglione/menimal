import { Context, Layer } from "effect";
import _Showdown from "showdown";

export interface Showdown {
  readonly _: unique symbol;
}

const make = new _Showdown.Converter({
  openLinksInNewWindow: true,
  strikethrough: true,
});

export const Showdown = Context.GenericTag<Showdown, typeof make>(
  "@app/Showdown"
);

export const ShowdownLive = Layer.succeed(Showdown, Showdown.of(make));
