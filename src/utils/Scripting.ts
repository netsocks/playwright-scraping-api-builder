import assert from 'assert';

import { Locator } from 'playwright';

import {
  AutomationContext,
  loadUrlOptions
} from '@netsocks/types/Automation';

export const loadUrl = async (
  { automation, page }: AutomationContext.TypedTask<any>,
  url: string,
  options: loadUrlOptions = {
    timeout: 30000
  }
) => {
  automation.log.d('Browsing to', url);

  await page.goto(url, {
    ...options,
    waitUntil: 'domcontentloaded'
  })
    .catch(async (err: any) => {
      automation.log.e('Browsing to', 'Error browsing to page [', url, ']', err);

      const pageCrashed = err.message.includes('Page crashed');

      assert(!pageCrashed, 'Error while browsing page: page crashed');
      assert(!err, `Error while browsing page: ${err.message}`);
    });

  automation.log.d('Waiting for page to load...');
  await page.waitForLoadState('load', {
    timeout: options.timeout
  }).catch(() => null);
  automation.log.d('Page loaded!');
};

export const clickLocator = async (
  { automation }: AutomationContext.TypedTask<any>,
  locator: Locator,
  options: {
    timeout?: number
  } = {}
) => {
  let clicked = false;

  await locator.scrollIntoViewIfNeeded({
    timeout: 4000
  }).catch(() => null);

  await locator.focus({
    timeout: options.timeout || 5000
  })
    .then(async () => {
      await locator.click({ force: true })
        .then(() => {
          clicked = true;
          automation.log.d('locator clicked!');
        })
        .catch((err) => {
          automation.log.e('Error clicking locator:', err);
        });
    }).catch(() => {
      return false;
    });
  return clicked;
};
