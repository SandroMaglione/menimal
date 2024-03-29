import * as Schema from "@effect/schema/Schema";

export class FrontmatterSchema extends Schema.Class<FrontmatterSchema>()({
  tags: Schema.string.pipe(Schema.array),
}) {}

export class ConfigSchema extends Schema.Class<ConfigSchema>()({
  name: Schema.string,
}) {}
