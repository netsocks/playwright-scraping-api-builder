import {
  JsonController,
  Post
} from 'routing-controllers';

import ValidateSchema from '@netsocks/decorators/ValidateSchema';


import ExampleService from './service';
import { VSayHello }  from './validationSchemas';


const service = new ExampleService();

@JsonController('/example')
export class ExampleController {

  @Post('/')
  async sayHello(
    @ValidateSchema(VSayHello) {
      body
    }: typeof VSayHello
  ) {

    const result = await service.sayHello(body);

    console.log(result);
    return { result };
  }


}
