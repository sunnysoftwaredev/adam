import './dotenv';
import demo from './demo';

class ErrorHandler {
  static handle(error: Error): void {
    console.error('There was an error in the demo.', error);
    // This could be extended to include error reporting, etc.
  }
}

demo().catch(ErrorHandler.handle);
