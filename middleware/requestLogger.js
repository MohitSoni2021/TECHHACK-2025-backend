const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date();
  const formattedDate = format(timestamp, 'yyyy-MM-dd');
  const logFilePath = path.join(logsDir, `requests-${formattedDate}.log`);
  
  // Log the request details
  const logData = {
    timestamp: timestamp.toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent') || 'unknown',
    referrer: req.get('referrer') || 'none',
    statusCode: res.statusCode,
    responseTime: 0 // Will be updated after response is sent
  };

  // Log response finish
  res.on('finish', () => {
    logData.responseTime = Date.now() - start;
    logData.statusCode = res.statusCode;
    
    const logLine = `${logData.timestamp} | ${logData.method} ${logData.url} | ${logData.statusCode} | ${logData.responseTime}ms | IP: ${logData.ip} | Agent: ${logData.userAgent}${logData.referrer !== 'none' ? ` | Referrer: ${logData.referrer}` : ''}\n`;
    
    // Write to console
    console.log(logLine.trim());
    
    // Write to log file
    fs.appendFile(logFilePath, logLine, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  });

  next();
};

module.exports = requestLogger;
