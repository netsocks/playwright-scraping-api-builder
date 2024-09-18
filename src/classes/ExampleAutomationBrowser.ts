/* eslint-disable no-restricted-syntax */

import { BrowserType }                from '@netsocks/classes/BrowserManager';
import NetsocksAutomationTask         from '@netsocks/classes/NetsocksAutomationTask';
import type { AutomationTaskOptions } from '@netsocks/types/Automation';

// eslint-disable-next-line no-use-before-define
class ExampleAutomationBrowser extends NetsocksAutomationTask<ExampleAutomationBrowser> {

  constructor() {
    const disableFeatures = [
      'NetworkService',

      // default args
      'AcceptCHFrame',
      'AutoExpandDetailsElement',
      'AvoidUnnecessaryBeforeUnloadCheckSync',
      'CertificateTransparencyComponentUpdater',
      'DestroyProfileOnBrowserClose',
      'DialMediaRouteProvider',
      'GlobalMediaControls',
      'HttpsUpgrades',
      'ImprovedCookieControls',
      'LazyFrameLoading',
      'MediaRouter',
      'PaintHolding',
      'Translate'
    ].join(',');

    const initOptions: AutomationTaskOptions = {
      browserType: BrowserType.CHROMIUM,
      context:     {
        acceptDownloads:   false,
        hasTouch:          false,
        ignoreHTTPSErrors: true,
        javaScriptEnabled: true,
        locale:            'es',
        // screen:            {
        //   height: parseInt(screenHeight, 10),
        //   width:  parseInt(screenWidth, 10)
        // },
        userAgent:         'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
      },
      launch: {
        args: [
          '--no-sandbox',
          '--disable-notifications',
          '--disable-xss-auditor',
          '--disable-infobars',
          // '--single-process',
          '--no-pings',
          '--disable-sync',
          '--disable-domain-reliability',
          '--disable-background-networking',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          // '--disable-site-isolation-trials',
          '--disable-site-isolation',
          '--enable-file-cookies',
          '--disable-breakpad',
          '--disable-http-cache',
          '--disable-client-side-phishing-detection',
          '--disable-component-extensions-with-background-pages',
          '--disable-default-apps',
          `--disable-features=${disableFeatures}`
        ],
        devtools:          false,
        headless:          false,
        ignoreDefaultArgs: ['--disable-features']
      }
    };

    super(initOptions);

    // this.usePlugin(
    //   // new MyCustomPlugin(...)
    // );
  }

}

export default ExampleAutomationBrowser;
