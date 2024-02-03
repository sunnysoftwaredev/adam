import './dotenv';
import executeDemo from './demo';

executeDemo().catch(e => {
  console.error('There was an error in the executeDemo function.', e);
});
