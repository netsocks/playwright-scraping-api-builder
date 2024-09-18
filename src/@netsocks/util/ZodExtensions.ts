
import { InferZodSchema } from '@netsocks/types/Zod';


export function createValidationSchema<T>(
  schema: T
) {

  return schema as InferZodSchema<T>;
}
