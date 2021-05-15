import { join } from "path";
import { copy, readFile, outputFile } from "fs-extra";
import { format } from "date-fns";
import { logger } from "@fengshangwuqi/logger";

(async () => {
  const daily = format(new Date(), "yyyy/MM/dd");

  logger(`updateAt: ${new Date()}`).withLevel("INFO");

  const issueTitle = `title: 日报@${daily}`;
  const issueMeta = ["---", issueTitle, "---"].join("\n");

  const dailyFile = join(__dirname, `${daily}.md`);
  const issueFile = join(__dirname, "issue-template.md");

  try {
    await copy(dailyFile, issueFile);

    const content = await readFile(issueFile, "utf-8");
    await outputFile(issueFile, [issueMeta, content].join("\n"));

    logger("generate daily").withLevel("SUCCESS");
  } catch (err) {
    logger("today has no news.").withLevel("WARNING");
  }
})();
