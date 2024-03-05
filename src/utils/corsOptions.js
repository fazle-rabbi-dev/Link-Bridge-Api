const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: "GET,POST,PATCH,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

export default corsOptions;
