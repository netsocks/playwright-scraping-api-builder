import { Context } from 'koa';

import {
  InferZodSchema,
  InferZodSchemaTuple
} from '@netsocks/types/Zod';


function ValidateRequest<T  extends InferZodSchema<T>[]>(
  ...schemas: InferZodSchemaTuple<T>
) {
  const cursor = Array.isArray(schemas) ? schemas : [schemas];

  return (ctx: Context, next: () => any) => {
    const { request, params, state } = ctx;
    const { query, body, headers } = request;

    cursor.forEach((schema: any) => {

      if (schema.query) {
        const validationResult = schema.query.parse(query);

        Object.assign(ctx.request.query, validationResult);
      }

      if (schema.body) {
        const validationResult = schema.body.parse(body);

        Object.assign(ctx.request.body || {}, validationResult);
      }

      if (schema.headers) {
        const validationResult = schema.headers.parse(headers);

        Object.assign(ctx.request.headers, validationResult);

      }

      if (schema.params) {
        const validationResult = schema.params.parse(params);

        Object.assign(ctx.params, validationResult);
      }

      if (schema.state) {
        const validationResult = schema.state.parse(state);

        Object.assign(ctx.state, validationResult);

      }
    });

    return next();
  };
}


export default ValidateRequest;
