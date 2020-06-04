import { ILogger } from "./utils/logger";

/** 
 *  Severities that Splunk understands for log messages from modular inputs.
*/
export enum LOGGER_LEVELS {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    FATAL = "FATAL"
}
export type SplunkLogger = ILogger<LOGGER_LEVELS>;