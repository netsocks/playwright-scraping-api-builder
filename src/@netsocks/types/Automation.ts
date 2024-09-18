/* eslint-disable max-classes-per-file */
import { CreateAxiosDefaults }                        from 'axios';
import {
  BrowserContextOptions, LaunchOptions, Page, Route
} from 'playwright';

import { BrowserType }          from '@netsocks/classes/BrowserManager';
import NetsocksAutomationScript from '@netsocks/classes/NetsocksAutomationScript';

export interface AutomatedRoute extends Route {
    _modifiedHeaders: Record<string, string>;
    _handlingPromise?: Promise<any>;
    setHeader(name: string, value: string): void;
}

export namespace AutomationContext {
    export interface TypedTask<C> {
        __kind: 'task';
        automation: C;
        page: Page;
    }

    export interface TypedScript<C extends NetsocksAutomationScript<C>> {
        __kind: 'script';
        automation: C;
    }
}


export type AutomationRunOptions<T> = {
    beforeRun?: (context: T) => Promise<void>;
    afterRun?: (context: T) => Promise<void>;
}

export type AutomationTaskOptions = {
    browserType?: BrowserType;
    context?: BrowserContextOptions;
    launch?: LaunchOptions;
}


export type AutomationScriptOptions = {
    axios?: CreateAxiosDefaults
}

export type loadUrlOptions = {
    referer?: string;
    timeout: number;
  };
