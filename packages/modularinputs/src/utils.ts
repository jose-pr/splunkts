export function setProp<K extends keyof T, T extends {}>(obj: T, key: K) {
    return obj[key] !== undefined && { [key]: obj[key] }
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
export function Wait(ms: number, cancellationToken?: Promise<void>) {
    return new Promise((done, reject) => {
        const timer = setTimeout(done, 30500);
        cancellationToken?.then(() => clearTimeout(timer));
    });
}