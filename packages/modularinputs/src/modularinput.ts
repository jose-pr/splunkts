import { Scheme, SendEvent } from "./models";
import { Stanza, DefinitionMeta } from "./models/definition";
import { Logger } from "./utils/logger";
import { LOGGER_LEVELS } from "./logger";

export type StepResult = [Error | undefined, 0 | 1]


export interface ModulaInputConstructor<Conf extends Stanza = Stanza> {
    /**
    * Runs before streaming begins.
    */
    create(logger:Logger<LOGGER_LEVELS>): Promise<ModularInput<Conf>>
}

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
export abstract class ModularInput<Conf extends Stanza = Stanza> {
    protected meta!: DefinitionMeta
    private _inputs!: Record<string, Conf>
    readonly logger: Logger<LOGGER_LEVELS>

    constructor(logger:Logger<LOGGER_LEVELS>){
        this.logger = logger;
    }

    init(meta: DefinitionMeta, inputs: Record<string, Conf>) {
        this.meta = meta;
        this._inputs = inputs;
    }
    async proccessInput(name: string, writer: SendEvent) {
        const input = this._inputs[name];
        await this.start?.call(this, name, input)
        await this.streamEvents(name, input, writer)
        await this.end?.call(this, name, input)
    }
    async processAllInputs(writer: SendEvent) {
        const waitFor = Object.keys(this._inputs).map((i) => this.proccessInput(i, writer))
        await Promise.all(waitFor);
    }
    /**
     * Runs once the streaming starts, for an input.
     * @param name The name of this modular input.
     * @param definition An InputDefinition object.
     */
    start?(name: string, input: Conf): Promise<void>

    /**
     * Runs once the streaming ends, for an input (upon successfully streaming all events).
     * @param name The name of this modular input.
     * @param definition An InputDefinition object.
     */
    end?(name: string, input: Conf): Promise<void>
    /**
    * Runs after all streaming is done for all inputs definitions.
    */
    dispose?(): Promise<void>
    /**
     * Provide Scheme to Splunk to build guis.
     */
    abstract getScheme(): Scheme<Conf>
    validateInput?(input: Conf, meta: DefinitionMeta): Promise<void>
    /**
     * 
     * @param name 
     * @param singleInput 
     * @param eventWriter 
     */
    abstract streamEvents(name: string, input: Conf, writer: SendEvent): Promise<void>
}
