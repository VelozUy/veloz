// Polyfill fetch for Firebase in Node.js
if (typeof global.fetch === 'undefined') {
  const fetch = require('node-fetch');
  global.fetch = fetch;
  global.Headers = fetch.Headers;
  global.Request = fetch.Request;
  global.Response = fetch.Response;
}

// Test global fetch polyfill
global.fetch = global.fetch || (() => {});
global.require = global.require || (() => {});
