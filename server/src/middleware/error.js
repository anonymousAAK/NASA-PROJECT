function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: {
      message: `Not Found - ${req.method} ${req.originalUrl}`,
      status: 404,
    },
  });
}

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal Server Error'
      : err.message;

  console.error(`[Error] ${req.method} ${req.originalUrl} - ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
}

module.exports = {
  asyncHandler,
  notFoundHandler,
  errorHandler,
};
