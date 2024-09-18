import dns from 'node:dns';

import bootstrap from '@netsocks/index';

dns.setDefaultResultOrder('ipv4first');

bootstrap()
  .then  (()  => console.log('Server started on port', process.env.PORT))
  .catch ((err) => console.error(err));
