import winston from 'winston';

const { LOG_LEVEL = 'info' } = process.env;
const { printf, combine, timestamp } = winston.format;

const formatter = printf(({ level, message, timestamp }) => {
  return `${timestamp} | ${level} | ${message}`;
});

export default winston.createLogger({
  level: LOG_LEVEL,
  format: combine(timestamp(), formatter),
  transports: [new winston.transports.Console()],
});
