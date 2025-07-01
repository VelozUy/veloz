// Polyfill fetch for Firebase in Node.js
try {
  if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fetch = require('node-fetch');
    global.fetch = fetch;
    global.Headers = fetch.Headers;
    global.Request = fetch.Request;
    global.Response = fetch.Response;
  }
} catch (e) {
  // Ignore if node-fetch is not available
} 