import {
  HydratedDocument, InferSchemaType, model, Schema
} from 'mongoose';

import { Platforms } from './definitions';

const schema = new Schema({
  platform: {
    enum:     Object.values(Platforms),
    required: false,
    type:     String
  },
  text: {
    required: false,
    type:     String
  }
}, {
  collection: 'properties'
});

export type IHelloWord = HydratedDocument<InferSchemaType<typeof schema>>;

const HelloWord = model<IHelloWord>('hello_words', schema);

export default HelloWord;
