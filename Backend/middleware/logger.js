function logger(req, res, next) {
  const now = new Date().toLocaleString();

  console.log(`
📌 REQUEST LOG
Time: ${now}
Method: ${req.method}
URL: ${req.originalUrl}
IP: ${req.ip}
User-Agent: ${req.headers['user-agent']}
Referer: ${req.headers.referer || 'N/A'}
--------------------------------
`);

  next(); // important to continue request
}

export default logger;
