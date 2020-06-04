import { ArgumentDefinition, normalizeArgument } from "./argument"
import { Stanza } from "./definition"
import { setProp } from "../utils"

export const enum SchemeStreamingMode {
    streamingModeSimple = "SIMPLE",
    streamingModeXML = "XML"
}

/**
 *
 * A `Scheme` specifies a title, description, several options of how Splunk 
 * should run modular inputs of this kind, and a set of arguments that define
 * a particular modular input's properties.
 * The primary use of `Scheme` is to abstract away the construction of XML
 * to feed to Splunk.
 *
 */
export interface Scheme<Conf extends Stanza> {
    /**Provides a label for the script. The label appears in the Settings page for Data inputs.*/
    title: string
    /**Provides descriptive text for title in the Setings page for Data inputs. The description also appears on the Add new data inputs page.*/
    description?: string
    /**Enables external validation.
     * @default false*/
    use_external_validation?: boolean
    /**Indicates whether to launch a single instance of the script or one script instance for each input stanza. The default value, false, launches one script instance for each input stanza.
     * @default false
    */
    use_single_instance?: boolean
    /**Contains one or more Arguments that can be used to change the default behavior that is defined in the inputs.conf.spec file.
     *The parameters to an endpoint are accessible from the management port to Splunk Enterprise.
     *Additionally, Splunk Web uses the endpoint to display each Argument as an editable field in the Add new data inputs Settings page.
     */
    endpoint: {
        args: {
            arg: ArgumentDefinition<Exclude<keyof Conf, symbol | number>, any>[]
        }
    }

}
export interface _Scheme<Conf extends Stanza> extends Scheme<Conf> {
    /**Streams inputs as xml or plain text.
     *@default simple*/
    streaming_mode: SchemeStreamingMode
}
export function normalizeScheme<Conf extends Stanza>(scheme:Scheme<Conf>):Scheme<Conf> {
    return {
        title:scheme.title,
        endpoint:{
            args:{
                arg:scheme.endpoint.args.arg.map(a=>normalizeArgument(a))
            }
        },
        ...setProp(scheme,'description'),
        ...setProp(scheme,'use_external_validation'),
        ...setProp(scheme,'use_single_instance')
    }
}