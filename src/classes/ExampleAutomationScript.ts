/* eslint-disable no-restricted-syntax */


import NetsocksAutomationScript from '@netsocks/classes/NetsocksAutomationScript';


// eslint-disable-next-line no-use-before-define
class ExampleAutomationScript extends NetsocksAutomationScript<ExampleAutomationScript> {
  constructor() {
    super({});

    this.log.d('Plugin constructor called');

    // this.usePlugin(
    //   new MyCustomPlugin(...)
    // );
  }


  myCustomMethod() {
    // do something
  }

}

export default ExampleAutomationScript;
