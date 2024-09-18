import { OAuthError, WebServiceError } from '@oauth.ws/client';
import { Middleware }                  from 'routing-controllers';
import { ZodError }                    from 'zod';


const error = (ctx: any, err: any) => {
  if (!err) return;

  console.error('Error handled[', typeof err, ']:', err?.stack);

  const obj = {} as any;

  if (err instanceof ZodError) {
    obj.error = {
      code:    OAuthError.ZOD_VALIDATION_FAILED.id,
      errors:  err.errors,
      message: OAuthError.ZOD_VALIDATION_FAILED.id
    };
  } else {
    const message = err?.message || err;

    obj.error = {
      code: err?.code,
      message
    };
  }

  if (obj.error && err?.errors) {

    const errors = Object.values(err.errors).map((item: any) => item?.message);

    obj.error.message = errors.join('; ');
  }

  if (process.env.NODE_ENV === 'development') {
    obj.stackTrace = err.stack;
    obj.request = {
      headers: ctx.request.headers
    };
  }


  ctx.type = 'json';
  ctx.status = err.status || 500;
  ctx.body = obj;
  // ctx.app.emit('error', err, ctx);
};

@Middleware({ type: 'before' })
export default class ErrorHandler {

  async use(ctx: any, next: () => Promise<any>) {
    let hasFailed = false;

    try {
      await next();
    } catch (e) {
      hasFailed = true;
      error(ctx, e);
    }

    if (hasFailed) {
      return;
    }

    const isError = ctx.status >= 400;
    const requestBody = ctx.response.body as any;
    const errorBody = requestBody?.error || (isError ? requestBody : undefined);

    if (errorBody) {
      error(ctx, errorBody);
    } else if (isError) {

      if (ctx.response.message === 'Not Found') {
        error(
          ctx,
          new WebServiceError(
            `Some of the aliases you requested do not exist ${ctx.request.method} - ${ctx.request.path}`,
            OAuthError.ROUTE_NOT_FOUND
          )
        );
      } else {
        error(ctx, ctx?.response?.message);
      }
    }

  }

}
