import './dotenv';
import demo from './demo';

(async () => {
  try {
    await demo();
  } catch (e) {
    console.error('There was an error in the demo.', e);
  }
})();
