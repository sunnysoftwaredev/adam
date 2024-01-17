import './dotenv';
import demo from './demo';

async function main() {
    try {
        await demo();
    } catch (e) {
        console.error('There was an error in the demo.', e);
    }
}

main();
