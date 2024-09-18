import { createParamDecorator } from 'routing-controllers';

export default function ValidateSchema<T>(schema: T) {
  const decorator = createParamDecorator({
    required: true,
    value:    (action) => {
      const ctx = action.context;
      const {
        query, body, headers, params, state
      } = ctx.request;

      const s = schema as any;
      const result = {} as any;

      result.query = s?.query?.parse(query);
      result.body = s?.body?.parse(body);
      result.headers = s?.headers?.parse(headers);
      result.params = s?.params?.parse(params);
      result.state = s?.state?.parse(state);

      return result as T;
    }
  });

  // type return as Function with result of T:
  return decorator;
}
