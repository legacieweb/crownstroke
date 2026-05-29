import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/index.css',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk.toString()}`);
  });
  res.on('end', () => {
    console.log('Response ended');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// Write some JSON data to the body
req.write('{"test": "data"}');
req.end();