import './dotenv';
import demo from './demo';

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

demo().catch(e => {
  console.error('There was an error in the demo.', e);
});