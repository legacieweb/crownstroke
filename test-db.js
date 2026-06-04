// Test script to check what the database returns
const fetch_module = import('node-fetch').then(m => m.default);

async function testDB() {
  const fetch = await fetch_module;
  
  try {
    // Test designers query
    const response = await fetch('http://localhost:3001/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT * FROM designers LIMIT 1',
        params: [],
        isValues: true
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Designers data:', JSON.stringify(data, null, 2));
    
    if (data.length > 0) {
      console.log('\nFirst designer object keys:', Object.keys(data[0]));
      console.log('First designer object:', JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testDB();
