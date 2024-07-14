class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",  // default value
        errors = [],
        stack = "")
    {
        super(message)
        this.statusCode = statusCode
        this.data = null             // not mentioned in arguments
        this.message = message;     //  why again?
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}