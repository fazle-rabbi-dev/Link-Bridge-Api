const notFoundError = (req, res, next) => {
  res.status(404).json({
    message: "404: Route not found. Looks like it's gone on vacation without leaving a forwarding address! 🏝️🌴"
  });
};

export default notFoundError;
