import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
const base = process.env.THEME_DEPLOY_BASE;
if (!base || !/^[a-f0-9]{40}$/.test(base) || /^0+$/.test(base))
  throw new Error("A valid deployment base commit is required.");
const names = execFileSync("git", ["diff", "--name-only", "-z", base, "HEAD"], {
  encoding: "utf8",
})
  .split("\0")
  .filter((name) =>
    /^(assets|blocks|config|layout|locales|sections|snippets|templates)\//.test(
      name,
    ),
  );
if (names.some((name) => !existsSync(name)))
  throw new Error(
    "Theme file deletions require a separate reviewed deployment.",
  );
if (names.length) {
  const cli = existsSync("node_modules/.bin/shopify")
    ? "node_modules/.bin/shopify"
    : "shopify";
  const args = [
    "theme",
    "push",
    "--store",
    process.env.SHOPIFY_FLAG_STORE,
    "--theme",
    process.env.THEME_DEPLOY_ID || "185079038330",
    "--allow-live",
    "--nodelete",
  ];
  for (const name of names) args.push("--only", name);
  execFileSync(cli, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      SHOPIFY_CLI_AGENT_INFO: "n:Codex|v:CI|p:OpenAI",
      SHOPIFY_CLI_AGENT_IDS: `r:${process.env.GITHUB_RUN_ID || "local"}`,
    },
  });
}
