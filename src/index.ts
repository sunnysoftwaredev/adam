import './dotenv';
import demo from './demo';

async function runDemo() {
  try {
    await demo();
  } catch (e) {
    console.error('There was an error running the demo.', e);
    process.exit(1);
  }
}

runDemo();