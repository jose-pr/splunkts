import { EventWriter } from "./eventwriter";
import { InputDefinition } from "./inputdefinition";
import { ValidationDefinition } from "./validationdefinition";
import { Scheme } from "./scheme";
import { Stanza } from "./definition";
import { Logger } from "./logger";
import { ReadXmlObjectFromStream } from "./utils";


export interface ModularInputsExport<Conf extends Stanza> {

    /**
     * Runs before streaming begins.
     *
     */
    setup?: () => Promise<void>

    /**
     * Runs once the streaming starts, for an input.
     *
     * @param name The name of this modular input.
     * @param definition An InputDefinition object.
     */
    start?: (name: string, definition: Conf) => Promise<void>

    /**
     * Runs once the streaming ends, for an input (upon successfully streaming all events).
     *
     * @param name The name of this modular input.
     * @param definition An InputDefinition object.
     */
    end?: (name: string, definition: Conf) => Promise<void>
    /**
    * Runs after all streaming is done for all inputs definitions.
    *
    */
    teardown?: () => Promise<void>
    getScheme(): Scheme<Conf>
    validateInput?(def: ValidationDefinition<Conf>): Promise<void>
    streamEvents(name: string, singleInput: Conf, eventWriter: EventWriter): Promise<void>
}

export type StepResult = [Error | undefined, 0 | 1]

/**
 * A base class for implementing modular inputs.
 *
 * Subclasses should implement `getScheme` and `streamEvents`,
 * and optionally `validateInput` if the modular input uses 
 * external validation.
 * 
 * The `run` function is used to run modular inputs; it typically
 * should not be overridden.
 */
export abstract class ModularInputs<Conf extends Stanza> {
    private _inputDefinition?: InputDefinition<Conf>
    private _service: any



    async proccessInput(name: string, eventWriter: EventWriter) {
        const input = this._inputDefinition!.inputs[name];
        await this.start(name, input)
        await this.streamEvents(name, input, eventWriter)
        await this.end(name, input)
    }
    async processAllInputs(eventWriter: EventWriter) {
        const waitFor = Object.keys(this._inputDefinition!.inputs).map((i) => this.proccessInput(i, eventWriter))
        await Promise.all(waitFor).then(() => {
            eventWriter.close();
        }, (e) => {
            eventWriter.close();
            throw e;
        })
    }


    /**
     * Handles all the specifics of running a modular input.
     *
     * @param modularInput An object representing a modular input script.
     * @param args A list of command line arguments passed to this script.
     * @param eventWriter An `EventWriter` object for writing event.
     * @param inputStream A `Stream` object for reading inputs.
     * @param callback The function to call after running this script: `(err, status)`.
     */
    static runScript<Conf extends Stanza>(modularInput: ModularInputs<Conf>, args: string[], eventWriter: EventWriter, inputStream: NodeJS.ReadWriteStream & { isTTY?: boolean }): Promise<StepResult> {
        const that = this as any;
        // Resume streams before trying to read their data.
        // If the inputStream is a TTY, we don't want to open the stream as it will hold the process open.
        if (inputStream.resume && !inputStream.isTTY) inputStream.resume();

        return new Promise<StepResult>(async (resolve, reject) => {
            // When streaming events...
            if (args.length === 1) {
                try {
                    const defString = await ReadXmlObjectFromStream('input', inputStream)
                    that._inputDefinition = modularInput._inputDefinition = InputDefinition.parse<Conf>(defString);
                    await modularInput.processAllInputs(eventWriter);
                    resolve([undefined, 0])
                } catch (e) {
                    reject([e, 1])
                }
            }
            // When getting the scheme...
            else if (args.length >= 2 && args[1].toString().toLowerCase() === "--scheme") {
                var scheme = modularInput.getScheme();

                if (!scheme) {
                    Logger.fatal("", "script returned a null scheme.", eventWriter._err);
                    reject([null, 1]);
                }
                else {
                    try {
                        await eventWriter.writeXMLDocument(scheme.toXmlObject());
                        reject([null, 0]);
                    }
                    catch (e) {
                        Logger.fatal("", "script could not return the scheme, error: " + e, eventWriter._err);
                        reject([e, 1]);
                    }
                }
            }
            // When validating arguments...
            else if (args.length >= 2 && args[1].toString().toLowerCase() === "--validate-arguments") {
                try {
                    const defString = await ReadXmlObjectFromStream('items', inputStream)
                    const definition = ValidationDefinition.parse<Conf>(defString);
                    await modularInput.validateInput(definition)
                    resolve([undefined, 0])
                } catch (err) {
                    Logger.error("", err.message);
                    Logger.error("", "Stack trace for a modular input error: " + err.stack);
                    try {
                        var errorRoot = { error: { message: err.message } }
                        eventWriter.writeXMLDocument(errorRoot);
                        reject([err, 1]); // Some error while validating the input.
                    }
                    catch (e) {
                        reject([e, 1]); // Error trying to write the error.
                    }
                }
            }
            // When we get unexpected args...
            else {
                var msg = "Invalid arguments to modular input script: " + args.join() + "\n";
                Logger.error("", msg, eventWriter._err);
                reject([msg, 1]);
            }
        });
    }

    /**
    * Returns a `splunkjs.Service` object for this script invocation.
    *
    * The service object is created from the Splunkd URI and session key
    * passed to the command invocation on the modular input stream. It is
    * available as soon as the `ModularInput.streamEvents` function is called.
    *
    * @return A `Splunkjs.Service` Object, or null if you call this function before the `ModularInput.streamEvents` function is called.
    */
    static service(): Service | null {
        if (this._service) {
            return this._service;
        }

        if (!this._inputDefinition) {
            return null;
        }

        var splunkdURI = this._inputDefinition.metadata["server_uri"];
        var sessionKey = this._inputDefinition.metadata["session_key"];

        var urlParts = url.parse(splunkdURI);

        // urlParts.protocol will have a trailing colon; remove it.
        var scheme = urlParts.protocol.replace(":", "");
        var splunkdHost = urlParts.hostname;
        var splunkdPort = urlParts.port;

        this._service = new Service({
            scheme: scheme,
            host: splunkdHost,
            port: splunkdPort,
            token: sessionKey
        });

        return this._service;
    }

    /**
     * Runs before streaming begins.
     *
     */
    async setup(): Promise<void> {
        return
    }

    /**
     * Runs once the streaming starts, for an input.
     *
     * @param name The name of this modular input.
     * @param definition An InputDefinition object.
     */
    async start(name: string, definition: Conf): Promise<void> {
        return
    }

    /**
     * Runs once the streaming ends, for an input (upon successfully streaming all events).
     *
     * @param name The name of this modular input.
     * @param definition An InputDefinition object.
     */
    async end(name: string, definition: Conf): Promise<void> {
        return
    }
    /**
    * Runs after all streaming is done for all inputs definitions.
    *
    */
    async teardown(): Promise<void> {
        return;
    }
    async validateInput(def: ValidationDefinition<Conf>): Promise<void> {
        return;
    }
    abstract getScheme(): Scheme<Conf>
    abstract streamEvents(name: string, singleInput: Conf, eventWriter: EventWriter): Promise<void>

}