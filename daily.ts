import { join } from "path";
import { copy, readFile, outputFile } from "fs-extra";
import { format } from "date-fns";
import * as logger from "@fengshangwuqi/logger";

(async () => {
  const daily = format(new Date(), "yyyy/MM/dd");
  const output = "public";
  const issueTitle = `title: 日报@${daily}`;
  const issueMeta = ["---", issueTitle, "---"].join("\n");

  const dailyFile = join(__dirname, `${daily}.md`);
  const targetFile = join(__dirname, output, "README.md");
  const currFile = join(__dirname, output, `${daily}.md`);
  const issueFile = join(__dirname, output, "issue-template.md");

  try {
    await copy(dailyFile, targetFile);
    await copy(dailyFile, currFile);
    await copy(dailyFile, issueFile);

    const content = await readFile(issueFile, "utf-8");
    await outputFile(issueFile, [issueMeta, content].join("\n"));

    logger.success(`deploy - ${daily}`);
  } catch (err) {
    logger.warn("today has no news.");
  }
})();
