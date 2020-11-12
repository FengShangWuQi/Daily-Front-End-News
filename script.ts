import puppeteer from "puppeteer";
import { writeFile } from "fs-extra";
import * as logger from "@fengshangwuqi/logger";

import { Twitter } from "./Twitter";

const twitterFollowing = [
  "ProgressBar202_",
  "ruanyf",
  "infoqchina",
  "f2er",
  "reactjs",
  "reactdaily",
  "JavaScriptDaily",
  "Esnextnews",
  "eggheadio",
  "mathias",
];

(async () => {
  let content = [] as string[];

  const withSection = (title: string, list: string) => {
    content.push([`### ${title}`, list].join("\n\n"));
  };

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  const newPage = Object.create(page);

  newPage.goto = (url: string, opts?: puppeteer.DirectNavigationOptions) => {
    logger.info(`goto: ${url}`);
    return page.goto(url, opts);
  };

  await newPage.setDefaultTimeout(0);

  const twitter = new Twitter(newPage);
  await twitter.login();

  for (let username of twitterFollowing) {
    const tweets = await twitter.getTweets(username);

    if (tweets.length !== 0) {
      logger.success(`${username}: ${tweets.length} items`);
      const list = tweets
        .map(({ content, link }) => `- [${content}](${link})`)
        .join("\n");
      withSection(username, list);
    }
  }

  await browser.close();

  const name = require("./package.json").name;
  const title = `> # ${name}`;

  await writeFile("./README.md", [title, ...content].join("\n\n"));

  logger.log(`\nend`);
})();
