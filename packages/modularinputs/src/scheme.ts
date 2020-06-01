import { Argument } from "./argument"
import { Stanza } from "./definition"

export const enum SchemeStreamingMode {
    streamingModeSimple = "SIMPLE",
    streamingModeXML = "XML"
}

/**
 * Class representing the metadata for a modular input kind.
 *
 * A `Scheme` specifies a title, description, several options of how Splunk 
 * should run modular inputs of this kind, and a set of arguments that define
 * a particular modular input's properties.
 * The primary use of `Scheme` is to abstract away the construction of XML
 * to feed to Splunk.
 *
 */
export class Scheme<Conf extends Stanza> {

    title: string
    description?: string
    useExternalValidation: boolean
    useSingleInstance: boolean
    streamingMode: SchemeStreamingMode
    args: Argument<Extract<keyof Conf, string>>[]
    /**
     *
     * @example
     *
     *      var s =  new Scheme();
     *
     *      var myFullScheme = new Scheme("fullScheme");
     *      myFullScheme.description = "This is how you set the other properties";
     *      myFullScheme.useExternalValidation = true;
     *      myFullScheme.useSingleInstance = false;
     *      myFullScheme.streamingMode = Scheme.streamingModeSimple;
     *
     * @param title The identifier for this Scheme in Splunk.
     */
    constructor(title: string) {
        this.title = title;

        // Set the defaults.
        this.useExternalValidation = true;
        this.useSingleInstance = false;
        this.streamingMode = SchemeStreamingMode.streamingModeXML;

        // List of Argument objects, each to be represented by an <arg> tag.
        this.args = [];
    }
    /**
     * Add the provided argument, `arg`, to the `this.arguments` Array.
     *
     * @param arg An Argument object to add to this Scheme's argument list.
     */
    addArgument(arg: Argument<Extract<keyof Conf, string>>): void {
        if (arg) {
            this.args.push(arg);
        }
    }
    /**
     * Creates an XmlObject Element representing this Scheme, then returns it.
     *
     * @return An XmlObject representing this Scheme.
     */
    toXmlObject(): SchemeXmlObject {
        const obj = {
            title: this.title,
            use_external_validation: this.useExternalValidation,
            use_single_instance: this.useSingleInstance,
            streaming_mode: this.streamingMode
        } as SchemeXmlObject;

        if (this.description) obj.description = this.description
        return obj;
    }
}
/**
 * <scheme></scheme>
 */
export interface SchemeXmlObject {
    title: string
    description?: string
    use_external_validation: boolean
    use_single_instance: boolean
    streaming_mode: SchemeStreamingMode
}

/**
 * root
 * -scheme
 * -endpoint
 * --args
 *     endpoint:{
        args:ArgumentXmlObject[]
    }
 */