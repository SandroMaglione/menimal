import { Function, Order, ReadonlyArray, String, pipe } from "effect";

const fileNameWithoutExtension = String.replace(/\.[^/.]+$/, "");

export const fileName = Function.compose(
  fileNameWithoutExtension,
  String.toLowerCase
);

export const title = Function.compose(
  fileNameWithoutExtension,
  String.replace(/-/g, " ")
);

export const sort = <T extends { modifiedAt: Date }>(array: T[]): T[] =>
  pipe(
    array,
    ReadonlyArray.sortBy(
      pipe(
        Order.Date,
        Order.reverse,
        Order.mapInput((t) => t.modifiedAt)
      )
    )
  );

export const formatDate = (date: Date): string => {
  const intl = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "long",
  });

  return intl.format(date);
};
