/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-restricted-syntax */


import assert from 'http-assert';

import ExampleAutomationBrowser from '@/classes/ExampleAutomationBrowser';
import { loadUrl }              from '@/utils/Scripting';
import { AutomationContext }    from '@netsocks/types/Automation';

import { VSayHello } from '../validationSchemas';

declare const document: Document;

export default async function PropertyCreator(
  context: AutomationContext.TypedTask<ExampleAutomationBrowser>,
  settings: typeof VSayHello.body
) {

  const { automation, page } = context;

  page.addInitScript(() => {
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      enumerable:   true,
      set:          () => {
        console.log('document.cookie intercepted');
      },
      value: '' // No-op setter function
    });
  });

  const sleepMs = settings.timeout;

  await loadUrl(context, `https://playground.netsocks.io/playwright/say-hello?text${settings.text}`, {
    timeout: sleepMs
  });

  automation.log.d('Waiting for the page to load');

  await page.waitForURL((uri) => {
    return uri.searchParams.has('generated');
  }, {
    timeout:   sleepMs,
    waitUntil: 'domcontentloaded'
  }).catch(() => {
    assert(false, 500, 'Failed to say hello: generated flag was not found');
  });

  automation.log.d('Generated flag found!');

  return page.content();
}
