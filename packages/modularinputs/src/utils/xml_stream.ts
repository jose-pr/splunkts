import { stderr, stdout, stdin } from "process"
import { J2xOptionsOptional, j2xParser, parse } from "fast-xml-parser"

const XMLParserOptions: J2xOptionsOptional = {
    attributeNamePrefix: "@",
    textNodeName: "#text",
    ignoreAttributes: false,
};

const toXml = new j2xParser(XMLParserOptions);
const XMLSerializer = {
    serialize(obj: any) {
        return toXml.parse(obj) as string;
    },
    deserialize<T>(str: string): T {
        return parse(str, XMLParserOptions);
    }
}


/**
 *
 */
export class XmlStream {
    private _tag: string[] = []

    protected readonly _out: NodeJS.WritableStream
    protected readonly _err: NodeJS.WritableStream
    protected readonly _in: NodeJS.ReadableStream
    /**
     * @param input A stream to read data @default stdin
     * @param output A stream to output data @default stdout
     * @param error  A stream to output errors @default stderr
     */
    constructor({ input, output, error }: { input?: NodeJS.ReadableStream, output?: NodeJS.WritableStream, error?: NodeJS.WritableStream }) {
        this._err = error ?? stderr
        this._out = output ?? stdout
        this._in = input ?? stdin
    }

    async open(tag: string, attrs?: string): Promise<void> {
        this._tag.push(tag);
        await this.writeString(`<${tag + (attrs ? (' ' + attrs) : '')}>`);
    }
    /**
    * Writes a string representation of an `XmlObject` Object to the 
    * output stream specified in the constructor.
    *
    * This function will throw an exception if there is an error
    * while making a string from `XmlObject`, or
    * while writing the string created from `XmlObject`.
    *
    * @param xmlObject An XmlObject representing an XML document.
    */
    async writeObject(xmlObject: {}): Promise<void> {
        const xmlString = XMLSerializer.serialize(xmlObject);
        await this.writeString(xmlString);
    }
    async writeString(str: string): Promise<void> {
        return new Promise((r, e) => {
            this._out.write(str, (err) => {
                if (err) e(e);
                else r();
            });
        });
    }
    async readObject<T extends {}>(tag: string): Promise<T> {
        return new Promise((resolve, reject) => {
            let data = Buffer.alloc(0);
            const timer = setTimeout(function () {
                reject(new Error(`Receiving ${tag} object.`));
            }, 30500);
            this._in.on("data", async function (chunk) {
                // Chunk will be a Buffer when interacting with Splunk.
                data = Buffer.concat([data, chunk]);
                // Remove any trailing whitespace.
                let bufferString = data.toString("utf8", 0, data.length).trim();
                if (bufferString.endsWith(`</${tag}>`)) {
                    clearTimeout(timer);
                    const obj = XMLSerializer.deserialize<{ [tag: string]: T }>(bufferString)[tag];
                    resolve(obj);
                }
            });
        });
    }
    /**
    * Close xmlelement.
    *
    */
    async close(tag?: string): Promise<void> {
        const _tag = tag ?? this._tag.pop();
        if (_tag === undefined) throw new Error("Nothing to close");
        await this.writeString(`</${_tag}>`);

    }
}