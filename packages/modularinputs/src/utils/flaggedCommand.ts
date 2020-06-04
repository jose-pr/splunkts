//@ts-nocheck
const Type = require('sywac/types/boolean')
export class Flag extends Type {
  get datatype () {
    return 'flag'
  }
  isApplicable(){
      return false
  }
}