import { J2xOptionsOptional, j2xParser, parse } from "fast-xml-parser"

export const XMLParserOptions: J2xOptionsOptional = {
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    ignoreAttributes: false,
};

export function IsNumeric(val: unknown): val is number {
    return !isNaN(val as number);
}
const toXml = new j2xParser(XMLParserOptions);
export const XMLSerializer = {
    serialize(obj: any) {
        return toXml.parse(obj) as string;
    },
    deserialize<T>(str: string): T {
        return parse(str, XMLParserOptions);
    }
}

/** 
   * Formats a time for Splunk, should be something like `1372187084.000`.
   *
   * @example
   *
   *   // When the time parameter is a string.
   *   var stringTime = "1372187084";
   *   var stringTimeFormatted = GetTimeInSeconds(stringTime);
   *
   *   // When the time parameter is a number, no decimals.
   *   var numericalTime = 1372187084;
   *   var numericalTimeFormatted = GetTimeInSeconds(numericalTime);
   *
   *   // When the time parameter is a number, with decimals.
   *   var decimalTime = 1372187084.424;
   *   var decimalTimeFormatted = GetTimeInSeconds(decimalTime);
   *
   *   // When the time parameter is a Date object.
   *   var dateObjectTime = Date.now();
   *   var dateObjectTimeFormatted = GetTimeInSeconds(dateObjectTime);
   *
   * @param time The unformatted time in milliseconds either as a string or number, ISO string format date, or `Date` Object.
   * @return The Splunk formatted time in seconds with 3 decimal places as a string.
   */
export function GetSplunkFormattedTime(time: string | number | Date): string {

    let _time: number;
    if (time instanceof Date) {
        _time = time.getTime()
    }
    else if (isNaN(time as number)) {
        _time = (new Date(time)).getTime()
    } else {
        _time = parseFloat(time as string)
    }
    return (_time / 1000).toFixed(3);
};
