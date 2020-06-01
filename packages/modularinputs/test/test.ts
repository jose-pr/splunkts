import { InputDefinition } from "../src/inputdefinition";
import {readFileSync} from "fs"

const xml = readFileSync("./test/inputdefinition.xml").toString();
const obj = InputDefinition.parse(xml)

console.log(xml,obj)