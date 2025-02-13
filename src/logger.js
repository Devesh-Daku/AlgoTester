import fs  from 'fs';
import path  from 'path';

function setupLogger(userName, email) {
  const date = new Date();
  const logFileName = `log_${date.toISOString().replace(/:/g,'-')}.txt`;
  const logFileDir = './Logs';
  const logFilePath = path.join(logFileDir, logFileName);

  if (!fs.existsSync(logFileDir)) {
    fs.mkdirSync(logFileDir);
  }

  const logStream = fs.createWriteStream(logFilePath, {flag:'a'});
  logStream.write(`DATE, TIME of initialization: ${date.toLocaleString()}\n`);
  logStream.write(`User: ${userName}\n`);
  logStream.write(`Email: ${email}\n\n\n`);

  return function log(message) {
    console.log(message);
    logStream.write(message + '\n');
  };
}

export  { setupLogger };
