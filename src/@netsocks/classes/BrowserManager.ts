import { Mutex } from 'async-mutex';
import {
  Browser
} from 'playwright';
import {
  addExtra,
  chromium,
  firefox
} from 'playwright-extra';

import type AutomationBase from './NetsocksAutomationTask';

export enum BrowserType {
  CHROMIUM = 'chromium',
  FIREFOX = 'firefox'
}

const launchMutex = new Mutex();

const BrowserManager = {
  browsers: {} as {
    [_id: string]: Browser
  },
  async close(browser?: Browser) {
    try {
      await browser?.close();
      return true;
    } catch (_) {
      return false;
    }
  },

  async closeAll() {
    const promises = Object
      .values(this.browsers)
      .map(async (browser) => this.close(browser));

    const result = await  Promise.allSettled(promises);
    return result;
  },

  async closeById(_id: string) {
    const browser = this.browsers[_id];

    if (browser) {
      console.log('Closing browser [', _id, '] ...');
      return this.close(browser);
    }

    console.log('Browser [', _id, '] not found!');
    return false;
  },

  defaultKey: '__default',

  exists(_id: string) {
    if (this.browsers[_id]) {
      return true;
    }
    return false;
  },

  isRunning(browserId: string) {
    try {
      const isConnected = this.browsers[browserId].isConnected();

      if (!isConnected) {
        this.close(this.browsers[browserId]);
      }

      return isConnected;
    } catch (_) {
      return false;
    }
  },

  async launch(
    module: AutomationBase<any>,
    singleton: boolean = true
  ): Promise<Browser | undefined> {

    let browser: Browser | undefined;
    const { browserType } = module.options;
    const defaultBrowserId = `${this.defaultKey}-${browserType}`;
    const browserId = singleton ? defaultBrowserId : module._id;

    if (module._id === defaultBrowserId) {
      throw new Error(`Cannot launch browser using a reserved key: ${defaultBrowserId}`);
    }

    const release = await launchMutex.acquire();

    if (!singleton) {
      release();
    }

    if (!this.exists(browserId) && !this.isRunning(browserId)) {

      if (browserType === BrowserType.FIREFOX) {
        const binary = addExtra(firefox);

        browser = await binary.launch(module.options.launch);
      } else {
        const binary = addExtra(chromium);

        browser = await binary.launch(module.options.launch);
      }


      console.log('Browser [', browserId, '] launched!!');
      browser.once('disconnected', async () => {
        console.log('Browser [', browserId, '] disconnected!!');

        try {
          await browser?.close();
        } catch (_) {
          // ignore
        }

        delete this.browsers[browserId];
      });

      this.browsers[browserId] = browser;
    } else if (this.isRunning(browserId)) {
      // console.log('Browser [', browserId, '] is already running!');
    }

    release();

    return this.browsers[browserId];
  }


};

export default BrowserManager;
