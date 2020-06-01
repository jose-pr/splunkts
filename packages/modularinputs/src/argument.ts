
/**
 * These should be used for setting the value of an Argument object's dataType field.
 */
export const enum ArgumentType {
    dataTypeBoolean = "BOOLEAN",
    dataTypeNumber = "NUMBER",
    dataTypeString = "STRING"
}

/**
 * Represents an Argument as an XmlObject
 * arg
 */
export interface ArgumentXmlObject {
    '@_name': string
    description?: string
    validation?: string
    data_type: ArgumentType
    required_on_edit: boolean
    required_on_create: boolean
}

export interface ArgumentConfig<Name extends string, T extends ArgumentType = ArgumentType.dataTypeString> {
    name: Name
    description?: string
    validation?: string
    dataType?: T
    requiredOnEdit?: boolean
    requiredOnCreate?: boolean
}
/**
* Class representing an argument to a modular input kind.
*
* `Argument` is meant to be used with `Scheme` to generate an XML 
* definition of the modular input kind that Splunk understands.
*
* `name` is the only required parameter for the constructor.
*
*/
export class Argument<Name extends string, T extends ArgumentType = ArgumentType.dataTypeString>  {
    name: Name
    description?: string
    validation?: string
    dataType: T
    requiredOnEdit: boolean
    requiredOnCreate: boolean
    /**
    * @example
    *
    *      // Example with minimal parameters
    *      var myArg1 = new Argument({name: "arg1"});
    *
    *      // Example with all parameters
    *      var myArg2 = new Argument({
    *          name: "arg1",
    *          description: "This an argument with lots of parameters",
    *          validation: "is_pos_int('some_name')",
    *          dataType: Argument.dataTypeNumber,
    *          requiredOnEdit: true,
    *          requiredOnCreate: true
    *      });
    *
    * @param config An object containing at least the name property to configure this Argument
    */
    constructor(config: ArgumentConfig<Name, T>) {
        this.name = config.name;
        this.description = config.description;
        this.validation = config.validation;
        this.dataType = config.dataType as T ?? ArgumentType.dataTypeString;
        this.requiredOnEdit = config.requiredOnEdit ?? false
        this.requiredOnCreate = config.requiredOnCreate ?? false;
    }

    /**
     * Return an `Argument` XML object.
     * 
     *
     * @return An object representing a xml element for this argument.
     */
    toXmlObject(): ArgumentXmlObject {
        const arg = {
            "@_name": this.name,
            data_type: this.dataType,
            required_on_create: this.requiredOnCreate,
            required_on_edit: this.requiredOnEdit
        } as ArgumentXmlObject;

        if (this.description) arg.description = this.description
        if (this.validation) arg.validation = this.validation

        return arg;
    }

}