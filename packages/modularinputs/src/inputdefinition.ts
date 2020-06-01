import { XMLSerializer } from "./common";

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
export interface InputDefiniionXmlObject {
    server_host: string;
    server_uri: string;
    checkpoint_dir: string;
    session_key: string;
    configuration: {
        stanza: {
            '@_name': string
            param?: { '@_name': string, '#text': string }[]
            param_list?: { '@_name': string, value: string[] }[]
        }[]
    }
}

/**
* `InputDefinition` encodes the XML defining inputs that Splunk passes to
* a modular input script.
*/
export class InputDefinition {
    inputs: Record<string, Record<string, string | string[]>>
    metadata: {
        server_host: string;
        server_uri: string;
        checkpoint_dir: string;
        session_key: string;
    }
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
    static parse(str: string): InputDefinition {
        const obj = XMLSerializer.deserialize(str) as { input: InputDefiniionXmlObject };
        const inputs = new InputDefinition();
        inputs.metadata.checkpoint_dir = obj.input.checkpoint_dir;
        inputs.metadata.server_host = obj.input.server_host;
        inputs.metadata.server_uri = obj.input.server_uri;
        inputs.metadata.session_key = obj.input.session_key;

        for (let stanza of obj.input.configuration.stanza) {
            const conf:Record<string,string|string[]> = inputs.inputs[stanza["@_name"]] = {};
            for (let param of stanza.param ?? []) {
                conf[param["@_name"]] = param["#text"]
            }
            for (let param of stanza.param_list ?? []) {
                conf[param["@_name"]] = param.value
            }
        }
        return inputs;
    }
}


