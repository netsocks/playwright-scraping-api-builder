import {
  nativeEnum,
  number, object, string
} from 'zod';

import { createValidationSchema } from '@netsocks/util/ZodExtensions';

import { Platforms } from './definitions';

export const VSayHello = createValidationSchema({
  body: object({
    kind:    nativeEnum(Platforms),
    text:    string(),
    timeout: number().default(120000)
  })
});

