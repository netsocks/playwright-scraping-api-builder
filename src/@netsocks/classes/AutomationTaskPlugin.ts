/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty-function */
import {
  Page, Response
} from 'playwright';

import type { AutomatedRoute, AutomationContext, AutomationTaskOptions } from '@netsocks/types/Automation';


abstract class AutomationTaskPlugin {
  context!: AutomationContext.TypedTask<any>;

  overridenAutomationOptions?: AutomationTaskOptions;

  async install(): Promise<void> {}

  async onTabCreated(page: Page, isFirstTab: boolean): Promise<void> {}

  async preInstall(): Promise<void>  {
  }

  async postInstall(): Promise<void> {
  }

  async onRoute(url: string, route: AutomatedRoute): Promise<void> {
  }

  async onResponse(response: Response): Promise<void> {

  }

}

export default AutomationTaskPlugin;
