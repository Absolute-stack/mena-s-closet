function errorLogger(err, req, res, next) {
  const now = new Date().toLocaleString();

  console.error(`
❌ ERROR LOG
Time: ${now}
Method: ${req.method}
URL: ${req.originalUrl}
IP: ${req.ip}
Message: ${err.message}
Status: ${err.status || 500}
Stack:
${err.stack}
--------------------------------
`);

  next(err); // pass error to next handler
}

export default errorLogger;
