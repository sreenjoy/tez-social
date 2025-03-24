# Telegram MTProto Integration Testing Guide

This guide will walk you through how to manually test the Telegram MTProto integration in your application. The integration uses the real Telegram API for authentication and data access.

## Prerequisites

1. A working installation of the application
2. Valid Telegram API credentials in your `.env` file:
   ```
   TELEGRAM_API_ID=26535381
   TELEGRAM_API_HASH=47012402bdde9bddb55271c1b28512e3
   ```
3. A Telegram account with access to the phone
4. Postman, curl, or any API testing tool

## Testing Steps

### 1. Start the Application

First, make sure your application is running:

```bash
npm run start:dev
```

Verify that the server is up by checking the health endpoint:

```bash
curl http://localhost:3001/api/health
```

You should see a response like:

```json
{"status":"ok","time":"2025-03-24T12:38:27.942Z"}
```

### 2. Register or Login a User

Since the Telegram endpoints require authentication, you need to first register or login a user to get a JWT token.

#### Register a new user:

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "email": "test@example.com",
  "password": "Password123!",
  "name": "Test User"
}' http://localhost:3001/api/auth/register
```

#### Login with an existing user:

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "email": "test@example.com",
  "password": "Password123!"
}' http://localhost:3001/api/auth/login
```

Save the JWT token from the response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### 3. Connect Telegram Account

To connect a Telegram account, send a request to the connect endpoint with your phone number:

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{
  "phoneNumber": "+1234567890"
}' http://localhost:3001/api/telegram/connect
```

You should receive a response indicating that a verification code was sent:

```json
{
  "status": "pending",
  "message": "Phone code sent to Telegram. Please submit the code to complete the connection."
}
```

**Important:** A verification code will be sent to your Telegram app on your phone.

### 4. Verify Phone Code

Once you receive the verification code in your Telegram app, submit it:

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{
  "phoneCode": "12345"
}' http://localhost:3001/api/telegram/verify
```

You will get one of two responses:

#### If 2FA is not enabled on your Telegram account:

```json
{
  "status": "connected",
  "message": "Telegram account successfully connected"
}
```

#### If 2FA is enabled on your Telegram account:

```json
{
  "status": "2fa_required",
  "message": "Two-factor authentication is enabled. Please provide your 2FA password."
}
```

### 5. Verify 2FA Password (if required)

If 2FA is required, submit your Telegram 2FA password:

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{
  "phoneCode": "12345",
  "password": "your_telegram_2fa_password"
}' http://localhost:3001/api/telegram/verify
```

Response upon successful 2FA verification:

```json
{
  "status": "connected",
  "message": "Telegram account successfully connected with 2FA"
}
```

### 6. Get User's Telegram Chats

After connecting, you can fetch the user's Telegram chats:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/telegram/chats
```

You should receive a list of the user's Telegram chats:

```json
[
  {
    "id": "123456789",
    "title": "Group Chat Name",
    "type": "group",
    "members": 15,
    "lastMessage": {
      "text": "Hello world",
      "date": "2025-03-24T12:00:00.000Z",
      "from": {
        "id": "987654321"
      }
    }
  },
  {
    "id": "987654321",
    "title": "John Doe",
    "type": "user",
    "lastMessage": {
      "text": "How are you?",
      "date": "2025-03-24T11:00:00.000Z"
    }
  }
]
```

### 7. Link a Chat to a Deal

To link a Telegram chat to a deal, first create a deal, then link the chat:

#### Create a deal:

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{
  "name": "Test Deal",
  "pipelineId": "your_pipeline_id",
  "stageId": "your_stage_id"
}' http://localhost:3001/api/deals
```

#### Link a chat to the deal:

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{
  "dealId": "your_deal_id",
  "chatId": "telegram_chat_id"
}' http://localhost:3001/api/telegram/chats/link
```

Response:

```json
{
  "id": "your_deal_id",
  "name": "Test Deal",
  "telegramChatId": "telegram_chat_id",
  "telegramChatInfo": {
    "linkedAt": "2025-03-24T12:30:00.000Z",
    "linkedBy": "user_id",
    "chatName": "Group Chat Name",
    "chatType": "group",
    "members": 15
  }
}
```

### 8. Disconnect Telegram Account

To disconnect the Telegram account:

```bash
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/telegram/disconnect
```

Response:

```json
{
  "status": "disconnected",
  "message": "Telegram account successfully disconnected"
}
```

## Troubleshooting

### 1. Error Logs

Check the application logs for any errors related to the Telegram integration. Look for logs that start with:

```
TelegramClientService - Failed to...
```

### 2. Session Files

Verify that session files are being created in the `telegram-sessions` directory:

```bash
ls -la telegram-sessions/
```

You should see files named like `user_id.session`.

### 3. Environment Variables

Double-check that your `.env` file contains the correct Telegram API credentials:

```
TELEGRAM_API_ID=26535381
TELEGRAM_API_HASH=47012402bdde9bddb55271c1b28512e3
```

### 4. Network Issues

If you're having trouble connecting, ensure that:
- Your server has internet access
- No firewall is blocking outgoing connections to Telegram's servers

## Common Errors and Solutions

### Invalid Phone Number Format

Error:
```
Failed to send auth code: PHONE_NUMBER_INVALID
```

Solution: Make sure the phone number is in international format with country code, e.g., "+1234567890".

### Invalid Verification Code

Error:
```
Failed to verify auth code: PHONE_CODE_INVALID
```

Solution: Double-check the verification code from your Telegram app.

### Session Expired

Error:
```
No active login session found
```

Solution: Start the authentication process again by reconnecting the Telegram account.

### API ID/Hash Invalid

Error:
```
Failed to create Telegram client: API_ID_INVALID
```

Solution: Verify your Telegram API credentials in the `.env` file. 