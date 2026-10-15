import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../server/routes/auth.js';
import { db } from '../server/db.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

async function testEndpoint() {
  console.log('--- TESTING /api/auth/login ENDPOINT SECURITY ---');
  
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/auth`;

  try {
    // Test 1: Wrong password for himanshu0481@gmail.com
    console.log('\n[TEST 1] Wrong password attempt for himanshu0481@gmail.com:');
    const res1 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'himanshu0481@gmail.com', password: 'WrongPassword123!' })
    });
    const data1 = await res1.json();
    console.log('Status:', res1.status, '(Expected: 401)');
    console.log('Response:', data1);
    if (res1.status === 401 && data1.success === false) {
      console.log('✅ PASSED: Wrong password strictly rejected!');
    } else {
      console.error('❌ FAILED: Wrong password was NOT rejected!');
    }

    // Test 2: Blank password
    console.log('\n[TEST 2] Blank password attempt:');
    const res2 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'himanshu0481@gmail.com', password: '' })
    });
    const data2 = await res2.json();
    console.log('Status:', res2.status, '(Expected: 400)');
    console.log('Response:', data2);
    if (res2.status === 400 && data2.success === false) {
      console.log('✅ PASSED: Blank password strictly rejected!');
    } else {
      console.error('❌ FAILED: Blank password was NOT rejected!');
    }

    // Test 3: Correct password
    console.log('\n[TEST 3] Correct password attempt for himanshu0481@gmail.com:');
    const res3 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'himanshu0481@gmail.com', password: 'Velneer@2026' })
    });
    const data3 = await res3.json();
    console.log('Status:', res3.status, '(Expected: 200)');
    console.log('User Role:', data3.user?.role, 'Name:', data3.user?.name);
    if (res3.status === 200 && data3.success === true && data3.token) {
      console.log('✅ PASSED: Correct password authorized with JWT token!');
    } else {
      console.error('❌ FAILED: Valid credentials could not log in!');
    }

    // Test 4: Another user wrong password
    console.log('\n[TEST 4] Wrong password for admin@velneer.in:');
    const res4 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@velneer.in', password: 'IncorrectPassword' })
    });
    const data4 = await res4.json();
    console.log('Status:', res4.status, '(Expected: 401)');
    if (res4.status === 401 && data4.success === false) {
      console.log('✅ PASSED: Wrong password strictly rejected!');
    } else {
      console.error('❌ FAILED: Wrong password was NOT rejected!');
    }

  } finally {
    server.close();
  }
}

testEndpoint().then(() => {
  console.log('\nAll tests completed.');
  process.exit(0);
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
