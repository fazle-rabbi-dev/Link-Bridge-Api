const corsOptions = {
  // origin: "*",
  origin: "https://linkbridge.vercel.app",
  methods: "GET,POST,PATCH,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

export default corsOptions;
