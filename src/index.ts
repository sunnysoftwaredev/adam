```typescript
import './dotenv';
import demo from './demo';

demo().catch((e: Error) => {
  console.error('There was an error in the demo. Message:', e.message, 'Stack:', e.stack);
});
```
