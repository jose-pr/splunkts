
import cli from 'sywac';
import { ModularInput, ModulaInputConstructor as ModularInputConstructor } from './modularinput';
import { stdout, stderr, exit } from "process"
import { createReadStream, createWriteStream } from 'fs'
import { XmlStream } from './utils/xml_stream';
import { Scheme, ArgumentType, Stanza, SendEvent } from './models';
import { Logger } from "./utils/logger";
import { LOGGER_LEVELS, SplunkLogger } from './logger';
import { Flag } from "./utils/flaggedCommand"
import { ExecuteModularInput } from './commands/execute';

export async function main<T extends Stanza>(modularInputType: ModularInputConstructor<T>) {

    let LOGGER: SplunkLogger;
    try {
        await cli.strict(true).file('--in').file('--out').file('--error')
            .check(async (argv: any, context: any) => {
                console.log("Checking files");
                const stream_in = argv.in ? createReadStream(argv.in) as NodeJS.ReadableStream : process.stdin;
                const stream_out = argv.out ? createWriteStream(argv.out) as NodeJS.WritableStream : stdout;
                const stream_error = argv.error ? createWriteStream(argv.error) as NodeJS.WritableStream : stderr;

                [stream_out, stream_error].forEach(function (s: any) {
                    if (s && s.isTTY && s._handle && s._handle.setBlocking) {
                 //       s._handle.setBlocking(true);
                    }
                });

                argv.logger = LOGGER = new Logger('Modular Inputs', { stream: stream_error }).getSeverityLogger<LOGGER_LEVELS>(Object.keys(LOGGER_LEVELS) as any)
                argv.stream = new XmlStream({ input: stream_in, output: stream_out, error: stream_error });
                argv.inputType = modularInputType
                //@ts-ignore
            }).registerFactory('flag', (opts) => new Flag(opts)).option('--scheme', {
                type: 'flag',
                desc: "Return the modular input scheme"
            }).option('--validate-arguments', { type: "flag", desc: "Validate Modular Input Configuration" })
            .command(ExecuteModularInput)
            .help('-h, --help', {})
            .version('-v, --version', {})
            .outputSettings({ maxWidth: 75 })
            .parseAndExit();
        exit(0);
    } catch (e) {
        console.log(e)
        exit(1);
    }
}
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