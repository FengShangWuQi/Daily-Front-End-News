import { Page } from "puppeteer";
import { differenceInCalendarDays } from "date-fns";
import dotenv, { DotenvParseOutput } from "dotenv";

const envs = dotenv.config().parsed as DotenvParseOutput;

export class Twitter {
  page: Page;
  URL = "https://twitter.com";
  period = 1;
  maxLength = 30;

  constructor(page: Page) {
    this.page = page;
  }

  async login() {
    await this.page.goto(this.URL);

    const [username, password] = envs.twitter.split(",");

    await this.page.waitForSelector("input[name='session[username_or_email]']");
    await this.page.type("input[name='session[username_or_email]']", username);
    await this.page.type("input[name='session[password]']", password);
    await this.page.click("[data-testid='LoginForm_Login_Button']");

    await this.page.waitForNavigation();
    await this.page.waitForSelector("[data-testid='tweet']");
  }

  async getTweets(username: string) {
    await this.page.goto(`${this.URL}/${username}`);
    await this.page.waitForSelector("[data-testid='tweet']");

    const map = new Map();

    while (1) {
      const data = await this.page.evaluate((maxLength) => {
        const arr = Array.from(
          document.querySelectorAll("[data-testid='tweet']")
        );
        const result = arr.map((item) => ({
          dateTime: (item.lastChild?.firstChild?.firstChild?.firstChild
            ?.firstChild?.lastChild?.lastChild as any)?.dateTime as string,
          link: (item.lastChild?.firstChild?.firstChild?.firstChild?.firstChild
            ?.lastChild as any)?.href as string,
          content: (item.lastChild?.lastChild?.textContent as string)
            .slice(0, maxLength)
            .replace(/\n/g, ""),
        }));

        return result;
      }, this.maxLength);

      const finalData = data.filter(
        (item) =>
          differenceInCalendarDays(new Date(), new Date(item.dateTime)) <
          this.period
      );

      finalData.forEach((item) => map.set(item.dateTime, item));

      if (data.length !== finalData.length) {
        break;
      }

      await this.page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await this.page.waitForTimeout(200);
    }

    const arr = Array.from(map.values());
    const tweets = arr.map(({ link, content }) => {
      return {
        link,
        content:
          content.length >= this.maxLength - 5
            ? content.padEnd(content.length + 3, "...")
            : content,
      };
    });

    return tweets;
  }
}
