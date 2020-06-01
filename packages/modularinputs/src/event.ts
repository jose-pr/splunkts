import { GetSplunkFormattedTime } from "./utils"

/**
 * `Event Configuration for Event Constructor`
 **/
export interface EventConfig<T> {
    data: T
    stanza: string
    time: number | Date | string
    host?: string
    index?: string
    source?: string
    sourcetype?: string
    done?: boolean
    unbroken?: boolean
}
/**
 * `Event` represents an event or fragment of an event to be written by this
 * modular input to Splunk.
 *
**/
export class Event<T extends {} | { toString(): string }> {
    data: T
    stanza: string
    time: number | Date | string
    host?: string
    index?: string
    source?: string
    sourcetype?: string
    done: boolean
    unbroken: boolean
    /**
    * @example    *
    *      // Minimal configuration
    *      var myEvent =  new Event({
    *          data: "This is a test of my new event.",
    *          stanza: "myStanzaName",
    *          time: parseFloat("1372187084.000")
    *      });
    *
    *      // Full configuration
    *      var myBetterEvent =  new Event({
    *          data: "This is a test of my better event.",
    *          stanza: "myStanzaName",
    *          time: parseFloat("1372187084.000"),
    *          host: "localhost",
    *          index: "main",
    *          source: "Splunk",
    *          sourcetype: "misc",
    *          done: true,
    *          unbroken: true
    *      });
    * @param config An object containing the configuration for an `Event`.
    */
    constructor(config: EventConfig<T>) {
        this.data = config.data;
        this.done = config.done ?? true;
        this.host = config.host;
        this.index = config.index;
        this.source = config.source;
        this.sourcetype = config.sourcetype;
        this.stanza = config.stanza;
        this.unbroken = config.unbroken ?? true;
        this.time = config.time;
    }

    /** 
    * Writes an XML representation of this, and Event object to the provided `Stream`,
    * starting at the provided offset.
    *
    * If this.data is undefined, or if there is an error writing to the provided `Stream`,
    * an error will be thrown.
    *
    * @param {Object} stream A `Stream` object to write this `Event` to.
    * @function splunkjs.ModularInputs.Event
    */


    toXmlObject(): EventXmlObject {
        const evt = {
            '@_stanza': this.stanza,
            '@_unbroken': this.unbroken ? '1' : '0',
            time: GetSplunkFormattedTime(this.time),
            data: typeof this.data === 'string' ? JSON.stringify(this.data) : this.data.toString(),
            source: this.source ?? '',
            sourcetype: this.sourcetype ?? '',
            host: this.host ?? '',
            index: this.index ?? ''
        } as EventXmlObject
        if (this.done) {
            evt.done = {}
        }
        return evt;
    }
}

/**
 * Represents an Event as an XmlObject
 * <event></event>
 */
export interface EventXmlObject {
    '@_stanza': string
    '@_unbroken': '1' | '0'
    time: string
    data: string
    source: string
    host: string
    sourcetype: string
    index: string
    done?: {}
}
