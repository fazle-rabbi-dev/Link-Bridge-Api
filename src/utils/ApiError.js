class ApiError {
    constructor(status, message) {
        error: {
            this.status = status;
            this.message = message;
        }
    }
}

export default ApiError;
