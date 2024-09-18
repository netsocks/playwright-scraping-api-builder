/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */

import { Mutex }         from 'async-mutex';
import { merge }         from 'lodash';
import {
  Browser,
  BrowserContext, Page
} from 'playwright';
import { v4 } from 'uuid';

import type {
  AutomatedRoute, AutomationContext, AutomationRunOptions, AutomationTaskOptions
} from '@netsocks/types/Automation';

import AutomationTaskPlugin   from './AutomationTaskPlugin';
import BrowserManager         from './BrowserManager';
import NetsocksAutomationBase from './NetsocksAutomationBase';

// eslint-disable-next-line no-use-before-define, max-len
abstract class NetsocksAutomationTask<SuperClass extends NetsocksAutomationTask<SuperClass>> extends NetsocksAutomationBase {
  plugins: Array<AutomationTaskPlugin> = [];

  options: AutomationTaskOptions;

  browser!: Browser;

  context!: BrowserContext;

  _mutex = {
    context: new Mutex()
  };

  usePlugin(...plugins: typeof this.plugins) {
    this.plugins?.push(...plugins);
  }

  constructor(options: AutomationTaskOptions, plugins?: Array<AutomationTaskPlugin>) {
    super();
    this.options = options;
    this.plugins = plugins || [];
    this._id = v4();
  }

  async mergeOptionsFromPlugins() {
    if (!this.plugins) return;

    for await (const plug of this.plugins) {
      const merged = merge(this.options, plug.overridenAutomationOptions || {});

      Object.assign(this.options, merged);
    }
  }

  async installPlugins() {
    if (!this.context) throw new Error('Trying to install plugins before building module! (No context found)');

    if (!this.plugins) {
      this.log.w('No plugins to install!', this.options);
      return;
    }

    for await (const plug of this.plugins) {
      plug.context = {
        __kind:     'task',
        automation: this as unknown as SuperClass,
        page:       new Proxy({} as any, {
          get() {
            throw new Error('Page is not available in this context!');
          }
        })
      } as AutomationContext.TypedTask<any>;

      await plug.preInstall().catch((err) => {
        this.log.e('Error before installing plugin', plug.constructor.name, err);
      });

      await plug.install().catch((err) => {
        this.log.e('Error installing plugin', plug.constructor.name, err);
      });

      await plug.postInstall().catch((err) => {
        this.log.e('Error after installing plugin', plug.constructor.name, err);
      });
    }

    this.context.on('page', async (page: Page) => {
      if (!this.plugins) return;

      for (const plug of this.plugins) {

        const isFirstTab = plug.context.page instanceof Proxy;

        if (isFirstTab) {
          plug.context.page = page;
        }

        plug.onTabCreated(page, isFirstTab);
      }

      page.on('response', async (response) => {
        for await (const plug of this.plugins) {
          await plug.onResponse(response).catch((err) => {
            this.log.e('Failed to handle response', err);
          });
        }
      });

      await page.route(/.*/iu, async (route) => {
        const mRoute = route as unknown as AutomatedRoute;

        mRoute._modifiedHeaders = { ...route.request().headers() };
        mRoute.setHeader = (key: string, value: string) => {
          mRoute._modifiedHeaders[key] = value;
        };

        for await (const plug of this.plugins) {
          await plug.onRoute(mRoute.request().url(), mRoute).catch((err) => {
            this.log.e('Failed to handle route', err);
          });
        }

        if (mRoute._handlingPromise) {
          const opts = {
            headers: mRoute._modifiedHeaders
          };

          await route.continue(opts).catch((err) => {
            this.log.e('Failed to continue route', err);
          });

          delete (mRoute as any)._modifiedHeaders;
        }
      });
    });
  }

  async createContext() {

    const release = await this._mutex.context.acquire();

    if (this.context) {
      release();
      return this.context;
    }

    await this.mergeOptionsFromPlugins();

    if (!this.browser) {
      const b = await BrowserManager.launch(this);

      if (!b) throw new Error('Browser not valid! Did it fail to launch?');

      this.browser = b;
    }

    this.context = await this.browser.newContext(this.options.context);

    await this.installPlugins();
    // this.context.on('close', () => {
    //   // abort all requests
    // });

    return this.context;
  }

  async runTask<T extends(
    context: AutomationContext.TypedTask<SuperClass>,
    ...targs: any) => Promise<any>>(
    task: T | [T, ...targs: Omit<Parameters<T>, 0>],
    options: AutomationRunOptions<AutomationContext.TypedTask<SuperClass>> = {}
  ) {
    await this.createContext();

    const myTask = Array.isArray(task) ? task[0] : task;
    const params = Array.isArray(task) ? task.slice(1) : [];
    const page = await this.context.newPage();
    const TAG = `[${myTask.name} - ${this._id}]:`;

    this.log.TAG(TAG);

    const automationContext: AutomationContext.TypedTask<SuperClass> = {
      __kind:     'task',
      automation: this as unknown as SuperClass,
      page
    };

    const onTaskFailed = async (err: any) => {
      this.log.e('Error executing task:', err);
      await page.waitForTimeout(30 * 1000);
      page.close();
      return err;
    };

    if (options.beforeRun) {
      await options
        .beforeRun(automationContext)
        .catch(onTaskFailed);
    }

    const result = await myTask.apply(
      automationContext,
      [
        automationContext,
        ...params
      ]
    )
      .catch(onTaskFailed);

    this.log.d('Automation finished with result:', result);

    if (options.afterRun) {
      await options
        .afterRun(automationContext)
        .catch(onTaskFailed);
    }

    await page.close();

    return result as ReturnType<T> | Error;
  }

}

export default NetsocksAutomationTask;
