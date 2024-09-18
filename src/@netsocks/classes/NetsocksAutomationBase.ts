import { v4 } from 'uuid';

// eslint-disable-next-line no-use-before-define
abstract class NetsocksAutomationBase {

  _id: string;

  _TAG: string[] = [];

  get log() {
    const tag = this._TAG.join(' ');

    return {
      TAG: (...args: string[]) => this._TAG.push(args.join(' ')),
      conditionedBy(condition: boolean) {
        this.silenced = !!condition;
        return this;
      },
      d(...args: any[]) {
        if (this.silenced) return;

        // eslint-disable-next-line no-console
        console.log(tag, ...args);
      },
      e(...args: any[]) {
        if (this.silenced) return;

        // eslint-disable-next-line no-console
        console.error(tag, ...args);
      },
      removeTAG: (...args: string[]) => {
        // remove args from this._TAG
        this._TAG = this._TAG.filter((s) => !args.includes(s));
      },
      silenced: false,
      w(...args: any[]) {
        if (this.silenced) return;

        // eslint-disable-next-line no-console
        console.warn(tag, ...args);
      }
    };
  }

  constructor() {
    this._id = v4();
  }

}

export default NetsocksAutomationBase;
