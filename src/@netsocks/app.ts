import 'reflect-metadata';

import i18next          from 'i18next';
import Koa              from 'koa';
import { useKoaServer } from 'routing-controllers';
import { z }            from 'zod';
import { zodI18nMap }   from 'zod-i18n-map';
import translation      from 'zod-i18n-map/locales/es/zod.json';


const app = new Koa({ proxy: true });

i18next.init({
  lng:       'es',
  resources: {
    es: { zod: translation }
  }
});
z.setErrorMap(zodI18nMap);


const routingControllersOptions = {
  classTransformer: false,
  controllers:      [
    `${__dirname}/../modules/**/controller.ts`,
    `${__dirname}/../modules/**/controller.js`
  ],
  cors:                true,
  defaultErrorHandler: false,
  development:         true,
  middlewares:         [`${__dirname}/middlewares/v1/before/*.ts`, `${__dirname}/middlewares/v1/before/*.js`],
  routePrefix:         '/api/v1',
  validation:          false
};

useKoaServer(app, routingControllersOptions);

export default app;
