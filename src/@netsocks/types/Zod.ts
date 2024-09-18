import {
  z,
  ZodAnyDef,
  ZodType,
  ZodTypeAny
} from 'zod';

export type ZodSchemaDefinition<T> = Record<string, ZodType<ZodTypeAny, ZodAnyDef, T>>;

// export type InferredZodSchema<T> = {
//   [K in keyof T]: T[K] extends ZodType<infer U, any, any> ? U : never;
// };

// export type InferZodSchema<T> = {
//   [K in keyof T]: (T[K] extends ZodTypeAny ? T[K]['_output'] : T[K]) & T[K];
// };

// export type InferZodSchema<T extends () => ZodTypeAny> = z.infer<ReturnType<T>>;
type inferZod<T> = {
  [K in keyof T]: (
    T[K] extends ZodTypeAny ?
    z.infer<T[K]> : never
  );
};

export type InferZodSchema<T> = (
  T extends ZodTypeAny ?
  z.infer<T> : inferZod<T>
)

export type InferZodSchemaTuple<T extends InferZodSchema<any>[]> = [...T];


