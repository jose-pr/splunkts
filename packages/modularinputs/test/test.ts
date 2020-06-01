import { InputDefinition } from "../src/inputdefinition";
import {readFileSync} from "fs"

const xml = readFileSync("./inputdefinition.xml");
InputDefinition.parse("")