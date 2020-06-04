import { stderr, stdout, stdin } from "process"
export abstract class ProccessStream {
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
}