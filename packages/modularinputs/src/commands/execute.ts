import { GetInputMeta, InputDefinition, GetInputConf, Event, normalizeEvent, _InternalEvent, Stanza, StanzaXmlObject, ValidationDefinition } from "../models";
import { XmlStream } from "../utils/xml_stream";
import { ModularInput } from "../modularinput";

async function streamEvents<T extends Stanza>(xmlstream: XmlStream, input: ModularInput<T>) {
    const def = await xmlstream.readObject<InputDefinition>('input')
    const meta = GetInputMeta(def);
    const stanzas = def.configuration.stanza.reduce((p, s) => {
        p[s["@name"]] = GetInputConf(s)
        return p;
    }, {} as Record<string, any>);
    input.init(meta, stanzas);
    await xmlstream.open('stream')
    async function writter(stanza: string, event: Event, isFragmentEnd?: boolean) {
        try {
            const _event = normalizeEvent(event) as _InternalEvent;
            if (isFragmentEnd !== undefined) {
                _event["@unbroken"] = 1
                if (isFragmentEnd) _event.done = null
            } else {
                _event["@unbroken"] = 0
            }
            _event["@stanza"] = stanza;
            await xmlstream.writeObject({ event: _event })
        }
        catch (e) {
            input.logger.ERROR("StreamEvents", e.message)
            throw e;
        }
    }
    await input.processAllInputs(writter);
}

export const ExecuteModularInput = {
    flags: "*",
    desc: "Stream Events",
    setup: (sywac: any) => {
        sywac.strict(false)
    },
    run: async (argv: any) => {
        console.log("streaming events")
        const input = await argv.inputType.create(argv.logger) as ModularInput<Stanza>;
        try {
            if (argv.scheme) {
                await (argv.stream as XmlStream).writeObject({ scheme: input.getScheme() });
            } else if (argv["validate-arguments"]) {
                await validateArguments(argv.stream, input);
            } else {
                await streamEvents(argv.stream, input);
            }
        } finally {
            await input.dispose?.call(input);
        }
    }
}
async function validateArguments(stream: XmlStream, input: ModularInput<Stanza>) {
    const def = await stream.readObject<ValidationDefinition>('items');
    if (input.validateInput === undefined) return;
    const meta = GetInputMeta(def);
    const stanza = GetInputConf(def.item);
    input.init(meta, {});
    await input.validateInput(stanza).catch(e => {
        input.logger.ERROR("", e.message);
        input.logger.ERROR("", "Stack trace for a modular input error: " + e.stack);
        stream.writeObject({
            error: {
                message: e.message
            }
        })
        throw e;
    });
} 