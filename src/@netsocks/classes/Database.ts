import assert from 'assert';

import mongoose from 'mongoose';

mongoose.set('debug', true);

const errorCodes = {
  DuplicateKey: 11000
};

const states = {
  ...mongoose.STATES
};

export default {
  connect(url: string, options?: any) {
    const opts = options || {};

    assert(url, 'Invalid Database Url');
    return mongoose.connect(url, {
      ...opts,
      autoIndex:          true,
      useNewUrlParser:    true,
      useUnifiedTopology: true
    });
  },

  disconnect() {
    return mongoose.disconnect();
  },


  getError() {
    return errorCodes;
  },


  getState() {
    return mongoose.connection.readyState;
  },


  isConnected() {
    return (
      mongoose.connection.readyState === states.connected
      || mongoose.connection.readyState === states.connecting
    );
  },

  isError(err: any, code: any) {
    return err && err.code === code;
  }
};
