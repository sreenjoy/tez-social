// Simple script to test Vercel credentials
// Run with: node test_vercel_credentials.js

const https = require('https');

// Get credentials from environment variables or command-line arguments
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.argv[2];
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID || process.argv[3];
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || process.argv[4];

// Check if we have all required credentials
if (!VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
  console.error('Missing required credentials. Please provide:');
  console.error('- VERCEL_TOKEN');
  console.error('- VERCEL_ORG_ID');
  console.error('- VERCEL_PROJECT_ID');
  console.error('\nUsage: VERCEL_TOKEN=xxx VERCEL_ORG_ID=xxx VERCEL_PROJECT_ID=xxx node test_vercel_credentials.js');
  console.error('   or: node test_vercel_credentials.js TOKEN ORG_ID PROJECT_ID');
  process.exit(1);
}

// Function to make a request to the Vercel API
function makeRequest(path, callback) {
  const options = {
    hostname: 'api.vercel.com',
    path: path,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      callback(res.statusCode, data);
    });
  });
  
  req.on('error', (error) => {
    console.error('Error making request:', error.message);
  });
  
  req.end();
}

console.log('Testing Vercel API credentials...');

// Test 1: Get team information
makeRequest(`/v2/teams?teamId=${VERCEL_ORG_ID}`, (statusCode, data) => {
  console.log('\n1. Testing organization/team access:');
  if (statusCode === 200) {
    try {
      const teamData = JSON.parse(data);
      console.log('✅ Successfully authenticated with Vercel organization');
      console.log(`   Organization name: ${teamData.teams && teamData.teams[0] ? teamData.teams[0].name : 'Unknown'}`);
    } catch (e) {
      console.log('⚠️ Got a valid response but could not parse team data');
    }
  } else {
    console.log(`❌ Failed to access organization. Status code: ${statusCode}`);
    console.log(`   Error: ${data}`);
  }
  
  // Test 2: Get project information
  makeRequest(`/v9/projects/${VERCEL_PROJECT_ID}?teamId=${VERCEL_ORG_ID}`, (statusCode, data) => {
    console.log('\n2. Testing project access:');
    if (statusCode === 200) {
      try {
        const projectData = JSON.parse(data);
        console.log('✅ Successfully accessed project information');
        console.log(`   Project name: ${projectData.name}`);
        console.log(`   Framework: ${projectData.framework}`);
        console.log(`   Production URL: ${projectData.alias?.[0] || projectData.targets?.production?.url || 'Not deployed'}`);
      } catch (e) {
        console.log('⚠️ Got a valid response but could not parse project data');
      }
    } else {
      console.log(`❌ Failed to access project. Status code: ${statusCode}`);
      console.log(`   Error: ${data}`);
    }
    
    // Test 3: Get deployment information
    makeRequest(`/v6/deployments?teamId=${VERCEL_ORG_ID}&projectId=${VERCEL_PROJECT_ID}&limit=1`, (statusCode, data) => {
      console.log('\n3. Testing deployment access:');
      if (statusCode === 200) {
        try {
          const deploymentData = JSON.parse(data);
          console.log('✅ Successfully accessed deployment information');
          if (deploymentData.deployments && deploymentData.deployments.length > 0) {
            const deployment = deploymentData.deployments[0];
            console.log(`   Latest deployment ID: ${deployment.uid}`);
            console.log(`   State: ${deployment.state}`);
            console.log(`   Created: ${new Date(deployment.created).toLocaleString()}`);
          } else {
            console.log('   No deployments found');
          }
        } catch (e) {
          console.log('⚠️ Got a valid response but could not parse deployment data');
        }
      } else {
        console.log(`❌ Failed to access deployments. Status code: ${statusCode}`);
        console.log(`   Error: ${data}`);
      }
      
      // Overall assessment
      console.log('\n📋 Summary:');
      if (statusCode === 200) {
        console.log('✅ Your Vercel credentials seem to be working correctly!');
      } else {
        console.log('❌ There seem to be issues with your Vercel credentials.');
        console.log('   Double-check the values in your GitHub secrets.');
      }
    });
  });
}); 