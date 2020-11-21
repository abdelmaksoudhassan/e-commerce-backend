class validationError extends Error{
    constructor(field,message,code){
        super(message)
        this.field = field
        this.code = code
    }
}

module.exports = {
    validationError
}