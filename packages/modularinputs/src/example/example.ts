import { ModularInput } from "../modularinput";
import { SplunkLogger } from "../logger";
import { Scheme, ArgumentType, SendEvent } from "../models";
import { main } from "../index";

class ExampleClass extends ModularInput<{ test: string[] }>{
    static async create(logger: SplunkLogger): Promise<ExampleClass> {
        return await new ExampleClass(logger);
    }
    getScheme(): Scheme<{ test: string[] }> {
        return {
            title: 'test',
            endpoint: {
                args: {
                    arg: [
                        {
                            "@name": 'test',
                            list_delimiter: ",",
                            data_type: ArgumentType.dataTypeString
                        }
                    ]
                }
            }

        }
    }
    async streamEvents(name: string, input: any, writer: SendEvent): Promise<void> {
        this.logger.INFO('name', 'test')
        await writer(name, { data: '123' }, true)
    }

}
main(ExampleClass)