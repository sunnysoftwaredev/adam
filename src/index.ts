import './dotenv';
import demo from './demo';

demo().catch(e => {
  console.error('There was an error in the demo. Error Name: ', e.name, '. Error Message: ', e.message, '. Stack: ', e.stack);
});
