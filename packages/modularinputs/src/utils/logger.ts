export interface LoggerOptions{
    stream?: NodeJS.WritableStream,
    format?: string,
}
function format(template: string, keys: { severity: string, from: string, message: string, source: string }) {
    return new Function("return `" + template + "`;").call(keys);
}


export type ILogger<T extends string> = {
    [severity in T]: (from: string, message: string, extras?: Record<string, string>) => void
}


export class Logger {

    private readonly _stream: NodeJS.WritableStream;
    private readonly _format: string
    private readonly _name: string

    constructor(name: string, opts?: LoggerOptions) {
        this._stream = opts?.stream ?? process.stderr;
        this._format = (opts?.format ?? "${severity} ${source} ${from} ${message}\n").replace(/\$\{/g, "${this.");
        this._name = name;
    }

    /**
    * Logs messages about the state of this modular input to Splunk.
    * These messages will show up in Splunk's internal logs.
    *
    * @param severity The Severity of the logging event
    * @param message The message to log.
    */
    log(severity: string, from: string, message: string, extras?: Record<string, string>) {
        try {
            const log = format(this._format, { ...extras || false, severity, message, from, source: this._name })
            this._stream.write(log);
        }
        catch (e) {
            throw e;
        }
    }
    getSeverityLogger<T extends string>(levels:T[]):ILogger<T>{
        const that = this;
        const logger = {} as ILogger<T>;
        levels.forEach(s => {
            logger[s] = function (from: string, message: string, extras?: Record<string, string>) {
                that.log(s, from, message, extras)
            } as any;
        })
        return logger;
    }
}