class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        data,
        stack = ""

    ) {super(message) 
        //because I inherit the class of Error, I must call super() first inside contructor
        this.statusCode = statusCode
        this.data = null
        this.success=false
        this.errors=errors
        this.message=message


        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}