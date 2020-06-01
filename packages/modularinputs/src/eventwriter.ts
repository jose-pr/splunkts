import { Event } from "./event"
import { stderr, stdout } from "process"
import { XMLSerializer } from "./common"


/**
 * `EventWriter` writes events and error messages to Splunk from a modular input.
 *
 * Its two important methods are `writeEvent`, which takes an `Event` object,
 * and `log`, which takes a severity and an error message.

 */
export class EventWriter {
    private _out:NodeJS.WriteStream
    private _err:NodeJS.WriteStream
    private _headerWritten:boolean = false
    /**
     * @param output A stream to output data, defaults to `process.stdout`
     * @param error  A stream to output errors, defaults to `process.stderr`
     */
    constructor(output: NodeJS.WriteStream|undefined, error: NodeJS.WriteStream|undefined) {
        this._err = error ?? stderr
        this._out = output ?? stdout
    }
    /**
    * Writes an `Event` object to the output stream specified
    * in the constructor.
    *
    * @param event An `Event` Object.
    */
    writeEvent(event: Event<any>){
        if (!this._headerWritten) {
            this._out.write("<stream>");
            this._headerWritten = true;
        }
        try {
            const evtXml = XMLSerializer.serialize(event.toXmlObject());
            this._out.write(evtXml);
        }
        catch (e) {
       //     Logger.error("", e.message, this._err);
            throw e;
        }
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
    writeXMLDocument(xmlObject: {}):void{
        const xmlString = XMLSerializer.serialize(xmlObject);
        this._out.write(xmlString);
    }
    /**
    * Writes the closing </stream> tag to make the XML well formed.
    *
    */
    close(): void{
        this._out.write("</stream>");
    }
}