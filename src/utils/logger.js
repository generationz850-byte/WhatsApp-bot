const winston = require('winston');

// Configure the logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Adding level methods
logger.info = (msg) => logger.log('info', msg);
logger.warn = (msg) => logger.log('warn', msg);
logger.error = (msg) => logger.log('error', msg);
logger.debug = (msg) => logger.log('debug', msg);

module.exports = logger;