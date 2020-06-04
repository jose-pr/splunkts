import { NamedDefinition, Stanza } from "./definition"
import { setProp } from "../utils"

/**
 * These should be used for setting the value of an Argument object's dataType field.
 */
export const enum ArgumentType {
    dataTypeBoolean = "BOOLEAN",
    dataTypeNumber = "NUMBER",
    dataTypeString = "STRING"
}

/**
*  Object representing an argument to a modular input kind.
*
* `Argument` is meant to be used with `Scheme` to generate an XML 
* definition of the modular input kind that Splunk understands.
* @example
*{
*   name: "arg1",
*   description: "This an argument with lots of parameters",
*   validation: "is_pos_int('some_name')",
*   dataType: Argument.dataTypeNumber,
*   requiredOnEdit: true,
*   requiredOnCreate: true
* }
*
*/
export type ArgumentDefinition<N extends Exclude<keyof Conf, symbol | number>, Conf extends Stanza> = NamedDefinition<N> & {
    /**Provides a label for the parameter.*/
    title?: string
    /**Provides a description of the parameter.*/
    description?: string
    /**Define rules to validate the value of the argument passed to an endpoint create or edit action. See Validation of arguments for details.
     *This allows you to provide input validation for users attempting to modify the configuration using the endpoint.
     *For example, the following validation rule tests if the value passed for the argument is a boolean value:
     *The Splunk platform provides built-in validation functions that you can use. param in each function must match the name.
     *@example 
     *is_avail_tcp_port(param)  //Is the value a valid port number, available for TCP listening.
     *is_avail_udp_port(param)  //Is the value a valid port number, available for UDP listening.
     *is_nonneg_int(param)      //Is the value a non-negative integer.
     *is_bool(param)	        //Is the value a boolean expression ("true", "false", "yes", "no", "1", "0").
     *is_port(param)            //Is the value a valid port number (1-65536)
     *is_pos_int(param)         //Is the value a positive integer.
    */
    validation?: string
    /**Indicates whether the parameter is required for edit. Default behavior is that arguments for edit are optional. Set this to true to override this behavior, and make the parameter required.*/
    required_on_edit?: boolean
    /**Indicates whether the parameter is required for create. Default behavior is that arguments for create are required. Set this to false to override this behavior, and make the parameter optional.*/
    required_on_create?: boolean
} & (Conf[N] extends number ? { data_type: ArgumentType.dataTypeNumber } : Conf[N] extends boolean ? { data_type: ArgumentType.dataTypeBoolean } : { data_type?: ArgumentType.dataTypeString })


export function normalizeArgument<N extends Exclude<keyof Conf, symbol | number>, Conf extends Stanza>(arg: ArgumentDefinition<N, Conf>): ArgumentDefinition<N, Conf> {
    return {
        "@name": arg["@name"],
        ...setProp(arg, 'data_type') as any,
        ...setProp(arg, 'description'),
        ...setProp(arg, 'required_on_create'),
        ...setProp(arg, 'required_on_edit'),
        ...setProp(arg, 'title'),
        ...setProp(arg, 'validation')
    }
}

