class ApiResponse {
    constructor(status, data, message) {
        this.status = status;
        this.data = {
            message
        };

        if (data) this.data.data = data;
    }
}

export default ApiResponse;
