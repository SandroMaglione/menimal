import chalk from "chalk";
import * as Logger from "effect/Logger";

export const ChalkLogger = Logger.make(({ logLevel, message }) => {
  if (logLevel._tag === "Debug") {
    globalThis.console.log(chalk.gray(`[${logLevel.label}] ${message}`));
  } else if (logLevel._tag === "Error") {
    globalThis.console.log(
      chalk.red(chalk.bold(`[${logLevel.label}] `) + message)
    );
  } else {
    globalThis.console.log(
      chalk.blue(chalk.bold(`[${logLevel.label}] `) + message)
    );
  }
});
