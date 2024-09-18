
import HelloBuilder      from './automations/hello-builder';
import { VSayHello }     from './validationSchemas';
import ExampleAutomation from '@/automations/ExampleAutomation';


class ExampleService {

  async sayHello(
    options: typeof VSayHello.body
  ) {
    const automator = new ExampleAutomation({});

    const result = await automator
      .runTask(
        [HelloBuilder, options]
      );
    return result;
  }
}

export default ExampleService;
