# Instructions for Claude

This is a Telegram CRM for Web3 businesses (Tez.social) with these guidelines:

## DO NOT MODIFY:
- Authentication flow files unless specifically asked
- Database schema without clear instruction
- Any file in .cursorignore

## SAFETY RULES:
- Always verify your changes won't break existing functionality
- Don't delete code without clear understanding of its purpose
- Maintain the privacy-first architecture (no message storage)
- Follow existing code patterns and naming conventions
- Comment any complex logic you introduce

## CODING STANDARDS:
### For Privacy & Security:
- Always follow privacy-first principles
- Use environment variables for all sensitive information
- Implement proper input validation on all user inputs
- Always sanitize data before storing in database

### For Architecture:
- Maintain clear separation between API routes and business logic
- Use repository pattern for database operations
- Keep API responses consistent across endpoints
- Export types/interfaces for shared data structures

### For Performance:
- Consider pagination for data-heavy endpoints
- Optimize database queries (use indexes appropriately)
- Implement efficient caching strategies
- Be mindful of memory usage with Telegram's real-time data

### For Testing:
- Write unit tests for critical business logic
- Create integration tests for authentication flows
- Test privacy measures 

## DATABASE INDEXES:
### Users Collection:
```json
{
  "fields": { "email": 1 },
  "options": { "unique": true }
}
```

### Companies Collection:
```json
{
  "fields": { "name": 1 },
  "options": { "unique": true }
}
```

### Pipelines Collection:
```json
{
  "fields": { "companyId": 1, "name": 1 },
  "options": { "unique": true }
}
```

### Stages Collection:
```json
{
  "fields": { "pipelineId": 1, "order": 1 },
  "options": { "unique": true }
}
```

### Deals Collection:
```json
{
  "fields": { "pipelineId": 1, "stageId": 1, "telegramChatId": 1 },
  "options": { "unique": true }
}
```

### Permissions Collection:
```json
{
  "fields": { "userId": 1, "companyId": 1, "resource": 1 },
  "options": { "unique": true }
}
```

Note: These indexes ensure data integrity and query performance while maintaining the privacy-first principles of the application.