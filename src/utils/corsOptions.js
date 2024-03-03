const corsOptions = {
  origin: "*",
  methods: "GET,POST,PATCH,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

export default corsOptions;
