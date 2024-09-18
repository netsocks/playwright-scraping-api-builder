/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */

import axios, { AxiosInstance } from 'axios';
import { merge }                from 'lodash';
import { v4 }                   from 'uuid';

import type {
  AutomationContext, AutomationRunOptions, AutomationScriptOptions
} from '@netsocks/types/Automation';

import AutomationScriptPlugin from './AutomationScriptPlugin';
import NetsocksAutomationBase from './NetsocksAutomationBase';

// eslint-disable-next-line no-use-before-define, max-len
abstract class NetsocksAutomationScript<SuperClass extends NetsocksAutomationScript<SuperClass>> extends NetsocksAutomationBase {
  plugins: Array<AutomationScriptPlugin> = [];

  options: AutomationScriptOptions;

  private _axiosInstance: AxiosInstance;

  usePlugin(...plugins: typeof this.plugins) {
    this.plugins?.push(...plugins);
  }

  constructor(options: AutomationScriptOptions, plugins?: Array<AutomationScriptPlugin>) {
    super();
    this.options = options;
    this.plugins = plugins || [];
    this._id = v4();
    this.mergeOptionsFromPlugins();

    this._axiosInstance = axios.create(options?.axios);
    this.installPlugins();
  }

  async mergeOptionsFromPlugins() {
    if (!this.plugins) return;

    for await (const plug of this.plugins) {
      const merged = merge(this.options, plug.overridenAutomationOptions || {});

      Object.assign(this.options, merged);
    }
  }

  async installPlugins() {

    if (!this.plugins) {
      this.log.w('No plugins to install!', this.options);
      return;
    }


    for await (const plug of this.plugins) {
      plug.context = {
        __kind:     'script',
        automation: this as any
      } as AutomationContext.TypedScript<any>;

      await plug.preInstall().catch((err) => {
        this.log.e('Error before installing plugin', plug.constructor.name, err);

      });

      this._axiosInstance.interceptors.request.use(plug.onRequest);
      this._axiosInstance.interceptors.response.use(plug.onResponse);

      await plug.install().catch((err) => {
        this.log.e('Error while installing plugin', plug.constructor.name, err);
      });

      await plug.postInstall().catch((err) => {
        this.log.e('Error after installing plugin', plug.constructor.name, err);
      });
    }
  }

  async runScript<T extends(
    context:AutomationContext.TypedScript<SuperClass>, ...targs: any) => Promise<any>>(
    script: T | [T, ...targs: Omit<Parameters<T>, 0>],
    options: AutomationRunOptions<AutomationContext.TypedScript<SuperClass>> = {}
  ) {

    const myScript = Array.isArray(script) ? script[0] : script;
    const params = Array.isArray(script) ? script.slice(1) : [];
    const TAG = `[${myScript.name} - ${this._id}]:`;

    this.log.TAG(TAG);

    const automationContext: AutomationContext.TypedScript<SuperClass> = {
      __kind:     'script',
      automation: this as unknown as SuperClass
    };

    const onScriptFailed = async (err: any) => {
      this.log.e('Error executing script:', err);
      return err;
    };

    for await (const plug of this.plugins.filter((p) => p.beforeRun)) {
      await plug.beforeRun();
    }

    if (options.beforeRun) {
      await options
        .beforeRun(automationContext)
        .catch(onScriptFailed);
    }

    const result = await myScript.apply(
      automationContext,
      [
        automationContext,
        ...params
      ]
    )
      .catch(onScriptFailed);

    this.log.d('Automation finished with result:', result);

    for await (const plug of this.plugins.filter((p) => p.afterRun)) {
      await plug.afterRun();
    }

    if (options.afterRun) {
      await options
        .afterRun(automationContext)
        .catch(onScriptFailed);
    }

    return result as ReturnType<T> | Error;


  }

}

export default NetsocksAutomationScript;
