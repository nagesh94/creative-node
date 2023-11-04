class appError extends Error{
    constructor(message,statusCode)
    {
        super(message);
        this.statusCode=statusCode;
        this.status=String(statusCode).startsWith('4') ? "failure":"server error"
        Error.captureStackTrace(this,this.constructor)

    }
}

module.exports=appError;
