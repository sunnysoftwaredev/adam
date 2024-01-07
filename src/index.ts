import './dotenv';
import demo from './demo';

function logError(errorMessage: string, error: Error): void {
  console.error(errorMessage, error);
}

demo().catch(e => {
  logError('There was an error in the demo.', e);
});
