import './dotenv';
import runDemo from './demo';

runDemo().catch(e => {
  console.error('There was an error in the runDemo.', e);
});
