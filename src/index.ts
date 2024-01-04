import { config } from 'dotenv';
import { demo } from './demo';

config();

const main = async () => {
  try {
    await demo();
  } catch (error) {
    console.error('There was an error in the demo:', error.message);
  }
}

main();