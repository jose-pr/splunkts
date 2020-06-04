export interface NamedDefinition<T extends string> {
    "@name": T
}

export interface DefinitionMeta {
    server_host: string;
    server_uri: string;
    checkpoint_dir: string;
    session_key: string;
}
export interface StanzaXmlObject {
    '@name': string;
    param?: ParamXmlObject[];
    param_list?: ParamlistXmlObject[];
}

export interface ParamlistXmlObject {
    '@name': string;
    value: string[];
}

export interface ParamXmlObject {
    '#text': string;
    '@name': string;
}

export interface ConfigurationXmlObject {
    stanza: StanzaXmlObject[];
}
export type ValidArgumentType = number | string | boolean
export type Stanza = {
    [name: string]: ValidArgumentType | ValidArgumentType[] | undefined
}
/**
* `InputDefinition` encodes the XML defining inputs that Splunk passes to
* a modular input script.
*/
export interface InputDefinition extends DefinitionMeta {
    configuration: ConfigurationXmlObject
}
export interface ValidationDefinition extends DefinitionMeta {
    item: StanzaXmlObject
}

export function GetInputMeta(obj: DefinitionMeta): DefinitionMeta {
    return {
        checkpoint_dir: obj.checkpoint_dir,
        server_host: obj.server_host,
        server_uri: obj.server_uri,
        session_key: obj.session_key
    }
}

export function GetInputConf<Conf extends Stanza>(xml: StanzaXmlObject): Conf {
    const stanza = {} as Conf;
    const params = Array.isArray(xml.param) || xml.param === undefined ? xml.param : [xml.param]
    for (let param of params ?? []) {
        stanza[param["@name"] as keyof Conf] = param["#text"] as Conf[keyof Conf]
    }
    const paramsList = Array.isArray(xml.param_list) || xml.param_list === undefined ? xml.param_list : [xml.param_list]
    for (let param of paramsList ?? []) {
        stanza[param["@name"] as keyof Conf] = param.value as Conf[keyof Conf]
    }
    return stanza;
}