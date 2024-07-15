class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",  // default value
        errors = [],
        stack = "")
    {
        super(message);
        this.statusCode = statusCode;
        this.data = null;             // as Error, so no data recieved
        this.success = false;         // Error/Failed
        this.errors = errors;

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}