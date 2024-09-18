/* eslint-disable no-underscore-dangle */
/* eslint-disable no-empty-function */

import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import type { AutomationContext, AutomationScriptOptions } from '@netsocks/types/Automation';


abstract class AutomationScriptPlugin {
  overridenAutomationOptions?: AutomationScriptOptions;

  context!: AutomationContext.TypedScript<any>;

  async beforeRun(): Promise<void> {}

  async afterRun(): Promise<void>  {}

  async onResponse(response: AxiosResponse<any, any>): Promise<AxiosResponse<any, any>> {
    return response;
  }

  async install(): Promise<void> {}

  async preInstall(): Promise<void>  {
  }

  async postInstall(): Promise<void> {
  }


  async onRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig>  {
    return config;
  }

}

export default AutomationScriptPlugin;
