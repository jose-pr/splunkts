import { StanzaXmlObject, DefinitionMeta, CloneDefintionMeta, Stanza, GetParameters } from "./definition";
import { XMLSerializer } from "./utils";

/**
 *The XML typically will look like this:
     * @example
     * `<items>`
     * `   <server_host>myHost</server_host>`
     * `     <server_uri>https://127.0.0.1:8089</server_uri>`
     * `     <session_key>123102983109283019283</session_key>`
     * `     <checkpoint_dir>/opt/splunk/var/lib/splunk/modinputs</checkpoint_dir>`
     * `     <item name="myScheme">`
     * `       <param name="param1">value1</param>`
     * `       <param_list name="param2">`
     * `         <value>value2</value>`
     * `         <value>value3</value>`
     * `         <value>value4</value>`
     * `       </param_list>`
     * `     </item>`
     * `</items>`
 */
export interface ValidationDefinitionXmlObject {
    items: ValidationDefinitionItemXmlObject;
}
export interface ValidationDefinitionItemXmlObject extends DefinitionMeta {
    item: StanzaXmlObject
}

/**
* This class represents the XML sent by Splunk for external validation of a
* new modular input.
*
* @example
*
*      var v =  new ValidationDefinition();
*
*/
export class ValidationDefinition<Conf extends  Stanza> {
    metadata: DefinitionMeta & { name: string }
    parameters: Conf
    constructor() {
        this.metadata = {} as any;
        this.parameters = {} as Conf;
    }
    /**
    * Creates a `ValidationDefinition` from a provided string containing XML.
    *
    * This function will throw an exception if `str`
    * contains unexpected XML.
    *
    *
    * @param str A string containing XML to parse.
    *
    */
    static parse<Conf extends Stanza>(str: string): ValidationDefinition<Conf> {
        const obj = XMLSerializer.deserialize(str) as ValidationDefinitionXmlObject;
        const def = new ValidationDefinition<Conf>();
        def.metadata = CloneDefintionMeta(obj.items) as DefinitionMeta&{name:string};
        def.metadata.name = obj.items.item["@_name"]
        def.parameters = GetParameters<Conf>(obj.items.item);
        return def;
    }
}
