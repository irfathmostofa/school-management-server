function notFound(req, res) {
  res.status(404).json({ ok: false, message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    message: err.message || "Internal server error",
  });
}

module.exports = { notFound, errorHandler };
