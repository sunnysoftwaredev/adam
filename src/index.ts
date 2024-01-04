import './dotenv';
import demo from './demo';

demo().catch(e => {
  console.error('There was an error in the demo.', e);
});