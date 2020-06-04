
import cli from 'sywac';
import { ModularInput, ModulaInputConstructor as ModularInputConstructor } from './modularinput';
import { stdout, stderr, exit } from "process"
import { createReadStream, createWriteStream } from 'fs'
import { streamEvents } from './commands/streamevents';
import { XmlStream } from './utils/xml_stream';
import { Scheme, ArgumentType, Stanza, SendEvent } from './models';
import { Logger } from "./utils/logger";
import { LOGGER_LEVELS, SplunkLogger } from './logger';

export async function main<T extends Stanza>(modularInputType: ModularInputConstructor<T>) {
    // In order to ensure that everything that is written to stdout/stderr is flushed before we exit,
    // set the file handles to blocking. This ensures we exit properly in a timely fashion.
    // https://github.com/nodejs/node/issues/6456
    [stdout, stderr].forEach(function (s: any) {
        if (s && s.isTTY && s._handle && s._handle.setBlocking) {
            //    s._handle.setBlocking(true);
        }
    });

    const [stream_in, stream_out, stream_error] = [
        createReadStream("test/inputdefinition.xml") as NodeJS.ReadableStream,
        createWriteStream('out/out.xml') as NodeJS.WritableStream,
        createWriteStream('out/error.txt') as NodeJS.WritableStream
    ];

    const LOGGER = new Logger('Modular Inputs', { stream: stream_error }).getSeverityLogger<LOGGER_LEVELS>(Object.keys(LOGGER_LEVELS) as any)
    await new Promise((r) => stream_out.once('open', r));
    try {
        const stream = new XmlStream({ input: stream_in, output: stream_out, error: stream_error });
        const input = await modularInputType.create(LOGGER);
        cli.command('streamevents <in> <out> <error>', {
            run: async () => {
                console.log("streaming")
                await streamEvents(stream, input)
            }
        }).help('-h, --help', {})
            .version('-v, --version', {})
            .showHelpByDefault()
            .outputSettings({ maxWidth: 75 });

        await cli.parseAndExit();
        await input.dispose?.call(input);
        exit(0);
    } catch (e) {
        console.log(e)
        exit(1);
    }
}
class ExampleClass extends ModularInput<{ test: number }>{
    static async create(logger: SplunkLogger): Promise<ExampleClass> {
        return await new ExampleClass(logger);
    }
    getScheme(): Scheme<{ test: number }> {
        return {
            title: 'test',
            endpoint: {
                args: {
                    arg: [
                        {
                            "@name": 'test',
                            data_type: ArgumentType.dataTypeNumber
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