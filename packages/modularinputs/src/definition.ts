export interface DefinitionMeta {
    server_host: string;
    server_uri: string;
    checkpoint_dir: string;
    session_key: string;
}
export interface StanzaXmlObject {
    '@_name': string;
    param?: ParamXmlObject[];
    param_list?: ParamlistXmlObject[];
}

export interface ParamlistXmlObject {
    '@_name': string;
    value: string[];
}

export interface ParamXmlObject {
    '#text': string;
    '@_name': string;
}

export interface ConfigurationXmlObject {
    stanza: StanzaXmlObject[];
}

export function CloneDefintionMeta(obj: DefinitionMeta): DefinitionMeta {
    return {
        checkpoint_dir: obj.checkpoint_dir,
        server_host: obj.server_host,
        server_uri: obj.server_uri,
        session_key: obj.session_key
    }
}

export type Stanza = {
    [name: string]: string | string[] | undefined
}

export function GetParameters<Conf extends Stanza>(xml: StanzaXmlObject): Conf {
    const stanza = {} as Conf;
    const params = Array.isArray(xml.param) || xml.param === undefined ? xml.param : [xml.param]
    for (let param of params ?? []) {
        stanza[param["@_name"] as keyof Conf] = param["#text"] as Conf[keyof Conf]
    }
    const paramsList = Array.isArray(xml.param_list) || xml.param_list === undefined ? xml.param_list : [xml.param_list]
    for (let param of paramsList ?? []) {
        stanza[param["@_name"] as keyof Conf] = param.value as Conf[keyof Conf]
    }
    return stanza;
}