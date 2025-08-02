// CORS Debug Test for BabbleBeaver
// Open this in browser console or add to a test page

async function testBabbleBeaverCORS() {
  console.log('🚀 Starting BabbleBeaver CORS Test...');
  console.log('Current Origin:', window.location.origin);
  console.log('Target URL: https://labs-babble.buildly.dev');
  
  // Test 1: Check debug endpoint
  console.log('\n📋 Test 1: Checking CORS configuration...');
  try {
    const debugResponse = await fetch('https://labs-babble.buildly.dev/debug/cors', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('✅ Debug endpoint accessible');
      console.log('CORS Origins:', debugData.cors_origins);
      console.log('Raw Env Var:', debugData.raw_env_var);
      console.log('Hostname:', debugData.hostname);
    } else {
      console.log('❌ Debug endpoint failed:', debugResponse.status);
    }
  } catch (debugError) {
    console.log('❌ Debug endpoint error:', debugError.message);
  }
  
  // Test 2: Test actual chatbot endpoint
  console.log('\n🤖 Test 2: Testing chatbot endpoint...');
  try {
    const chatResponse = await fetch('https://labs-babble.buildly.dev/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Test CORS connection - please respond with "CORS working"'
      })
    });
    
    console.log('Response Status:', chatResponse.status);
    console.log('Response Headers:');
    for (const [key, value] of chatResponse.headers.entries()) {
      if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Chatbot endpoint working!');
      console.log('Response:', chatData);
    } else {
      console.log('❌ Chatbot endpoint failed:', chatResponse.status, chatResponse.statusText);
    }
  } catch (chatError) {
    console.log('❌ Chatbot endpoint error:', chatError.message);
    
    if (chatError.message.includes('CORS')) {
      console.log('🔍 CORS Issue Detected:');
      console.log('- The server may not have the correct CORS headers');
      console.log('- Check if the origin is in the allowed list');
      console.log('- Verify preflight OPTIONS request is handled');
    }
  }
  
  // Test 3: Manual preflight test
  console.log('\n🛫 Test 3: Testing preflight OPTIONS request...');
  try {
    const preflightResponse = await fetch('https://labs-babble.buildly.dev/chatbot', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
        'Origin': window.location.origin
      }
    });
    
    console.log('Preflight Status:', preflightResponse.status);
    console.log('Preflight Headers:');
    for (const [key, value] of preflightResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (preflightError) {
    console.log('❌ Preflight error:', preflightError.message);
  }
  
  console.log('\n📊 Test Complete');
}

// Run the test
testBabbleBeaverCORS();
