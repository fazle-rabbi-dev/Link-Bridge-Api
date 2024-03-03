import rateLimit from "express-rate-limit"

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 5, // limit each IP to 100 requests per windowMs
    message: { error: "Too many requests from this IP, please try again later" }
});