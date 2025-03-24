#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Store the JWT token
let jwtToken = '';
let userId = '';

// Helper function to execute curl commands
function execCurl(command) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    console.error('Error executing command:', error.message);
    
    try {
      return JSON.parse(error.stdout);
    } catch (parseError) {
      console.error('Error parsing response:', parseError.message);
      console.log('Raw output:', error.stdout);
      return { error: error.message, stdout: error.stdout };
    }
  }
}

// Function to register a user
function registerUser(email, password, name) {
  console.log(`\nRegistering user: ${email}`);
  
  const command = `curl -s -X POST -H "Content-Type: application/json" -d '{"email":"${email}","password":"${password}","name":"${name}"}' http://localhost:3001/api/auth/register`;
  
  return execCurl(command);
}

// Function to login
function login(email, password) {
  console.log(`\nLogging in as: ${email}`);
  
  const command = `curl -s -X POST -H "Content-Type: application/json" -d '{"email":"${email}","password":"${password}"}' http://localhost:3001/api/auth/login`;
  
  const response = execCurl(command);
  
  if (response.accessToken) {
    jwtToken = response.accessToken;
    userId = response.user.id;
    console.log('Login successful!');
    console.log(`User ID: ${userId}`);
  } else {
    console.error('Login failed:', response);
  }
  
  return response;
}

// Function to connect Telegram
function connectTelegram(phoneNumber) {
  console.log(`\nConnecting Telegram account with phone number: ${phoneNumber}`);
  
  const command = `curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${jwtToken}" -d '{"phoneNumber":"${phoneNumber}"}' http://localhost:3001/api/telegram/connect`;
  
  return execCurl(command);
}

// Function to verify phone code
function verifyPhoneCode(phoneCode, password = null) {
  console.log(`\nVerifying phone code: ${phoneCode}${password ? ' with 2FA password' : ''}`);
  
  let data = { phoneCode };
  if (password) {
    data.password = password;
  }
  
  const command = `curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${jwtToken}" -d '${JSON.stringify(data)}' http://localhost:3001/api/telegram/verify`;
  
  return execCurl(command);
}

// Function to get user's Telegram chats
function getUserChats() {
  console.log('\nGetting user\'s Telegram chats');
  
  const command = `curl -s -H "Authorization: Bearer ${jwtToken}" http://localhost:3001/api/telegram/chats`;
  
  return execCurl(command);
}

// Function to disconnect Telegram
function disconnectTelegram() {
  console.log('\nDisconnecting Telegram account');
  
  const command = `curl -s -X POST -H "Authorization: Bearer ${jwtToken}" http://localhost:3001/api/telegram/disconnect`;
  
  return execCurl(command);
}

// Function to check server health
function checkHealth() {
  console.log('\nChecking server health');
  
  const command = `curl -s http://localhost:3001/api/health`;
  
  return execCurl(command);
}

// Create the scripts directory if it doesn't exist
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Main function to run the test
async function runTest() {
  console.log('Telegram Integration Test');
  console.log('========================\n');
  
  // Check if server is running
  try {
    const health = checkHealth();
    console.log('Server status:', health.status);
  } catch (error) {
    console.error('Error connecting to server. Make sure the server is running.');
    process.exit(1);
  }
  
  // Ask for login or register
  rl.question('\nDo you want to (1) login or (2) register? ', (answer) => {
    if (answer === '1') {
      // Login
      rl.question('Email: ', (email) => {
        rl.question('Password: ', (password) => {
          const response = login(email, password);
          
          if (!jwtToken) {
            console.error('Login failed. Exiting.');
            rl.close();
            return;
          }
          
          testTelegramIntegration();
        });
      });
    } else if (answer === '2') {
      // Register
      rl.question('Email: ', (email) => {
        rl.question('Password: ', (password) => {
          rl.question('Name: ', (name) => {
            const response = registerUser(email, password, name);
            console.log('Registration response:', response);
            
            // Now login with the registered user
            const loginResponse = login(email, password);
            
            if (!jwtToken) {
              console.error('Login failed after registration. Exiting.');
              rl.close();
              return;
            }
            
            testTelegramIntegration();
          });
        });
      });
    } else {
      console.log('Invalid option. Exiting.');
      rl.close();
    }
  });
}

// Function to test Telegram integration
function testTelegramIntegration() {
  rl.question('\nEnter your phone number (with country code, e.g., +1234567890): ', (phoneNumber) => {
    const connectResponse = connectTelegram(phoneNumber);
    console.log('Connect response:', connectResponse);
    
    if (connectResponse.status !== 'pending') {
      console.error('Failed to connect Telegram account. Exiting.');
      rl.close();
      return;
    }
    
    rl.question('\nEnter the verification code sent to your Telegram app: ', (phoneCode) => {
      const verifyResponse = verifyPhoneCode(phoneCode);
      console.log('Verify response:', verifyResponse);
      
      // Check if 2FA is required
      if (verifyResponse.status === '2fa_required') {
        rl.question('\nEnter your Telegram 2FA password: ', (password) => {
          const twoFAResponse = verifyPhoneCode(phoneCode, password);
          console.log('2FA verify response:', twoFAResponse);
          
          if (twoFAResponse.status === 'connected') {
            proceedAfterConnection();
          } else {
            console.error('Failed to verify 2FA password. Exiting.');
            rl.close();
          }
        });
      } else if (verifyResponse.status === 'connected') {
        proceedAfterConnection();
      } else {
        console.error('Failed to verify phone code. Exiting.');
        rl.close();
      }
    });
  });
}

// Function to proceed after successful connection
function proceedAfterConnection() {
  console.log('\nTelegram account connected successfully!');
  
  rl.question('\nDo you want to (1) get your chats, (2) disconnect, or (3) exit? ', (answer) => {
    if (answer === '1') {
      // Get chats
      const chats = getUserChats();
      console.log('Your Telegram chats:');
      console.log(JSON.stringify(chats, null, 2));
      
      rl.question('\nPress Enter to continue...', () => {
        proceedAfterConnection();
      });
    } else if (answer === '2') {
      // Disconnect
      const disconnectResponse = disconnectTelegram();
      console.log('Disconnect response:', disconnectResponse);
      rl.close();
    } else {
      // Exit
      rl.close();
    }
  });
}

// Start the test
runTest();

// Handle readline close
rl.on('close', () => {
  console.log('\nTest completed. Goodbye!');
  process.exit(0);
}); 