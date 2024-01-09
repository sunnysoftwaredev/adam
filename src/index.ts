import './dotenv';
import startDemo from './startDemo';

startDemo().catch(e => {
  console.error('There was an error in the startDemo process.', e);
});
