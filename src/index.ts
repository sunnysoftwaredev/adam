import './dotenv';
import demo from './demo';

demo().catch(error => {
  console.error('There was an error in the demo.', error);
});
