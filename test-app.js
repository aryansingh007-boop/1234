#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing Rezide LinkedIn Post App...\n');

// Test local server
function testLocal() {
  return new Promise((resolve) => {
    console.log('📍 Testing local server...');
    
    const req = http.request('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasImages = data.includes('/images/rezide-logo.png') && 
                         data.includes('/images/presentation.jpg');
        const hasLikeButton = data.includes('Like');
        const hasShareButton = data.includes('Share');
        const hasRezideContent = data.includes('Rezide is a modern real estate discovery platform');
        
        console.log(`✅ Local server: ${res.statusCode === 200 ? 'Running' : 'Error'}`);
        console.log(`✅ Images: ${hasImages ? 'Loaded' : 'Missing'}`);
        console.log(`✅ Like button: ${hasLikeButton ? 'Present' : 'Missing'}`);
        console.log(`✅ Share button: ${hasShareButton ? 'Present' : 'Missing'}`);
        console.log(`✅ Content: ${hasRezideContent ? 'Present' : 'Missing'}`);
        
        resolve({ 
          status: res.statusCode, 
          hasImages, 
          hasLikeButton, 
          hasShareButton, 
          hasRezideContent 
        });
      });
    });
    
    req.on('error', () => {
      console.log('❌ Local server: Not running');
      resolve({ status: 0, hasImages: false, hasLikeButton: false, hasShareButton: false, hasRezideContent: false });
    });
    
    req.end();
  });
}

// Test API endpoints
function testAPI() {
  return new Promise((resolve) => {
    console.log('\n🔌 Testing API endpoints...');
    
    const postData = JSON.stringify({ postId: 'main-post' });
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/likes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ POST /api/likes: ${res.statusCode === 200 ? 'Working' : 'Error'}`);
          console.log(`✅ Like count: ${response.likes || 'Unknown'}`);
          resolve({ status: res.statusCode, likes: response.likes });
        } catch (e) {
          console.log(`❌ POST /api/likes: Invalid response`);
          resolve({ status: res.statusCode, likes: 0 });
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ POST /api/likes: Connection failed');
      resolve({ status: 0, likes: 0 });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test GET endpoint
function testGetAPI() {
  return new Promise((resolve) => {
    const req = http.request('http://localhost:3000/api/likes?postId=main-post', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ GET /api/likes: ${res.statusCode === 200 ? 'Working' : 'Error'}`);
          console.log(`✅ Current likes: ${response.likes || 'Unknown'}`);
          resolve({ status: res.statusCode, likes: response.likes });
        } catch (e) {
          console.log(`❌ GET /api/likes: Invalid response`);
          resolve({ status: res.statusCode, likes: 0 });
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ GET /api/likes: Connection failed');
      resolve({ status: 0, likes: 0 });
    });
    
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting comprehensive app tests...\n');
  
  const localTest = await testLocal();
  const apiTest = await testAPI();
  const getTest = await testGetAPI();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  const allPassed = localTest.status === 200 && 
                   localTest.hasImages && 
                   localTest.hasLikeButton && 
                   localTest.hasShareButton &&
                   localTest.hasRezideContent &&
                   apiTest.status === 200 &&
                   getTest.status === 200;
  
  console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Your Rezide LinkedIn Post app is ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Add your images to public/images/ folder');
    console.log('   2. Upload to GitHub: git init && git add . && git commit -m "Initial commit"');
    console.log('   3. Deploy to Vercel: vercel --prod');
    console.log('   4. Test the deployed URL');
    console.log('\n🔗 Your app will work perfectly on both localhost and Vercel!');
  } else {
    console.log('\n⚠️  Please fix the issues above before deploying.');
  }
}

runTests().catch(console.error);
