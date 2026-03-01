const http = require('http');

const data = JSON.stringify({
  email: 'admin@lightofindia.com',
  password: 'Admin@123',
  name: 'Admin User',
  role: 'super_admin'
});

const PORT = process.env.PORT || 4000;

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/v1/admin/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      console.log('Response:', JSON.parse(body));
    } catch (e) {
      console.log('Response:', body);
    }
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
