import { stderr } from "process"
/** 
 *  Severities that Splunk understands for log messages from modular inputs.
*/
export const enum LOGGER_LEVELS {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    FATAL = "FATAL"
}

/**
* `Logger` logs messages to Splunk's internal logs.
*
*/
export const Logger = {
    /**
    * Logs messages about the state of this modular input to Splunk.
    * These messages will show up in Splunk's internal logs.
    *
    * @param severity The Severity of the logging event
    * @param name The name of this modular input.
    * @param message The message to log.
    * @param stream  A stream to write log messages to, defaults to process.stderr.
    */
    log(severity: LOGGER_LEVELS, name: string, message: string, stream?: NodeJS.WriteStream) {
        try {
            stream = stream ?? stderr;
            // Prevent a double space if name isn't passed.
            if (name && name.length > 0) {
                name = name + " ";
            }
            var msg = severity + " Modular input " + name + message + "\n";
            stream.write(msg);
        }
        catch (e) {
            throw e;
        }
    },
    /**
    * Logs messages about the state of this modular input to Splunk.
    * These messages will show up in Splunk's internal logs.
    *
    * @param name The name of this modular input.
    * @param message The message to log.
    * @param stream  A stream to write log messages to, defaults to process.stderr.
    */
    debug(name: string, message: string, stream?: NodeJS.WriteStream): void {
        Logger.log(LOGGER_LEVELS.DEBUG, name, message, stream);
    },
    /**
    * Logs messages about the state of this modular input to Splunk.
    * These messages will show up in Splunk's internal logs.
    *
    * @param name The name of this modular input.
    * @param message The message to log.
    * @param stream  A stream to write log messages to, defaults to process.stderr.
    */
    info(name: string, message: string, stream?: NodeJS.WriteStream): void {
        Logger.log(LOGGER_LEVELS.INFO, name, message, stream);
    },
    /**
    * Logs messages about the state of this modular input to Splunk.
    * These messages will show up in Splunk's internal logs.
    *
    * @param name The name of this modular input.
    * @param message The message to log.
    * @param stream  A stream to write log messages to, defaults to process.stderr.
    */
    warn(name: string, message: string, stream?: NodeJS.WriteStream): void {
        Logger.log(LOGGER_LEVELS.WARN, name, message, stream);
    },
    /**
     * Logs messages about the state of this modular input to Splunk.
     * These messages will show up in Splunk's internal logs.
     *
     * @param name The name of this modular input.
     * @param message The message to log.
     * @param stream  A stream to write log messages to, defaults to process.stderr.
     */
    error(name: string, message: string, stream?: NodeJS.WriteStream): void {
        Logger.log(LOGGER_LEVELS.ERROR, name, message, stream);
    },
    /**
     * Logs messages about the state of this modular input to Splunk.
     * These messages will show up in Splunk's internal logs.
     *
     * @param name The name of this modular input.
     * @param message The message to log.
     * @param stream  A stream to write log messages to, defaults to process.stderr.
     */
    fatal(name: string, message: string, stream?: NodeJS.WriteStream): void {
        Logger.log(LOGGER_LEVELS.FATAL, name, message, stream);
    }
}