export function errorHandler(err, req, res, next) {
  console.error('[ServerError]', err.stack || err.message || err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
      code: 'UPLOAD_ERROR',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred.',
    code: err.code || 'INTERNAL_ERROR',
  });
}
