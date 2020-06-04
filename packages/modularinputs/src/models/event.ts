import { setProp } from "../utils"


/**
* Writes an `Event` object to the output stream specified
* in the constructor.
* @param stanza 
* @param event An `Event` Object.
* @param isFragmentEnd If sending an event as a fragment (unbroken) must set this value if not message is considered broken
*/
export type SendEvent = (stanza: string, event: Event, isFragmentEnd?: boolean) => Promise<void>


/**
 *`Event` represents an event or fragment of an event to be written by this
 * modular input to Splunk.
 **/
export interface Event {
    data: string
    /**
     * Specify the time using a UTC UNIX timestamp in seconds. Subseconds are supported up to 3 decimals spaces.
     * @description
     *  When writing modular input scripts, it is best to specify the time of an event with the tag. Splunk software does not read the timestamp from the body of the event (except in the case of unbroken events). 
     * If not present, Splunk software attempts to use the time the data arrives from the input source as the time of the event.
     * @example
     * 1330717125.125
     */
    time?: number
    /**Layered host for each stanza*/
    /**Global default host from inputs.conf*/
    host?: string
    /**Layered index for each stanza*/
    /**@default `Global default index from inputs.conf`*/
    index?: string
    /**@default SchemeName*/
    source?: string
    /**Default Value: SchemeName://InputName*/
    /**@default SchemeName*/
    sourcetype?: string
}
export interface _InternalEvent extends Event {
    "@stanza"?: string
    done?: null
    '@unbroken': 1 | 0
}


export function normalizeEvent(e: Event): Event {
    return {
        data: e.data,
        ...setProp(e, 'host'),
        ...setProp(e, "index"),
        ...setProp(e, 'source'),
        ...setProp(e, 'sourcetype'),
        ...setProp(e, 'time')
    }
}
