import { XMLSerializer } from "./utils";
import { DefinitionMeta, ConfigurationXmlObject, CloneDefintionMeta, Stanza, GetParameters } from "./definition";

/**
* @example
* `<input>`
*   `<server_host>tiny</server_host>`
*   `<server_uri>https://127.0.0.1:8089</server_uri>`
*   `<checkpoint_dir>/opt/splunk/var/lib/splunk/modinputs</checkpoint_dir>`
*   `<session_key>123102983109283019283</session_key>`
*   `<configuration>`
*     `<stanza name="foobar://aaa">`
*       `<param name="param1">value1</param>`
*       `<param name="param2">value2</param>`
*       `<param name="disabled">0</param>`
*       `<param name="index">default</param>`
*     `</stanza>`
*     `<stanza name="foobar://bbb">`
*       `<param name="param1">value11</param>`
*       `<param name="param2">value22</param>`
*       `<param name="disabled">0</param>`
*       `<param name="index">default</param>`
*       `<param_list name="multiValue">`
*         `<value>value1</value>`
*         `<value>value2</value>`
*       `</param_list>`
*       `<param_list name="multiValue2">`
*         `<value>value3</value>`
*         `<value>value4</value>`
*       `</param_list>`
*     `</stanza>`
*   `</configuration>`
* `</input>`
*/
export interface InputDefinitionXmlObject {
    input: InputXmlObject;
}

export interface InputXmlObject extends DefinitionMeta {
    configuration: ConfigurationXmlObject
}

/**
* `InputDefinition` encodes the XML defining inputs that Splunk passes to
* a modular input script.
*/
export class InputDefinition<Conf extends Stanza> {
    inputs: Record<string,Conf>
    metadata: DefinitionMeta
    /**
    * @example
    *
    *      var i =  new InputDefinition();
    *
    */
    constructor() {
        this.metadata = {} as any;
        this.inputs = {};
    }
    /**
    * Parse a string containing InputDefiniionXmlObject into an `InputDefinition`.
    *
    * This function will throw an exception if `str`
    * contains unexpected XML.
    *
    *
    * @param str A string  containing XML to parse.
    * @return An InputDefiniion object.
    */
    static parse<Conf extends Stanza>(str: string): InputDefinition<Conf> {
        const obj = XMLSerializer.deserialize(str) as InputDefinitionXmlObject;
        const inputs = new InputDefinition<Conf>();
        inputs.metadata = CloneDefintionMeta(obj.input);

        for (let stanza of obj.input.configuration.stanza) {
            inputs.inputs[stanza["@_name"]] = GetParameters<Conf>(stanza);
        }
        return inputs;
    }
}


