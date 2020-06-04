import { GetInputMeta, InputDefinition, GetInputConf, Event, normalizeEvent, _InternalEvent, Stanza } from "../models";
import { XmlStream } from "../utils/xml_stream";
import { ModularInput } from "../modularinput";
import { LOGGER_LEVELS } from "../logger";



export async function streamEvents<T extends Stanza>(xmlstream: XmlStream, input: ModularInput<T>) {
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
            input.logger.log(LOGGER_LEVELS.ERROR,"StreamEvents", e.message)
            throw e;
        }
    }
    await input.processAllInputs(writter).finally(async () => await xmlstream.close());
}