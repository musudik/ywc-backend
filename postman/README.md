# YourWealth.Coach API Postman Collection

This directory contains Postman collections for testing the YourWealth.Coach backend API.

## Files

1. Collections:
   - `ywc-backend-client-data.json` - Contains endpoints for all client data operations
   - `ywc-backend-client-data-additional.json` - Contains additional endpoints for consents, documents, forms, and custom forms
   - `ywc-backend-client-data-complete.json` - A merged version of the above collections (created using the merge script)

2. Environment:
   - `ywc-backend-environment.json` - Environment variables for testing

3. Utilities:
   - `merge-collections.js` - Script to merge collection files

4. Test Scripts:
   - `auth-test-script.js` - Test script for authentication endpoints that sets the auth token
   - `entity-creation-test-script.js` - Test script for entity creation endpoints that automatically sets entity IDs

## Merging Collections

To merge the two collection files into a single file for easier import, run:

```bash
node merge-collections.js
```

This will create a file called `ywc-backend-client-data-complete.json` that includes all endpoints.

## How to Use

1. Import the collections and environment into Postman:
   - Open Postman
   - Click on "Import" button
   - Select the collection file (either the individual JSON files or the merged `ywc-backend-client-data-complete.json` file)
   - Also import the `ywc-backend-environment.json` environment file
   - The collection and environment will be imported

2. Set the environment:
   - Select "YWC Backend - Development" from the environment dropdown in the top right corner
   - The environment comes pre-configured with the following variables:
     - `baseUrl`: The base URL of your API (default: `http://localhost:3000/api`)
     - `userEmail`: Email for authentication (default: `coach@example.com`)
     - `userPassword`: Password for authentication (default: `password123`)
     - `authToken`: Will be populated after login
     - `personalId`: ID of the personal record you want to work with
     - Various IDs for different entity types (employmentId, incomeId, etc.)
   - Update these values as needed for your environment

3. Set up test scripts (optional but recommended):
   - Copy the contents of `auth-test-script.js` to the "Tests" tab of the Login request
   - Copy the contents of `entity-creation-test-script.js` to the "Tests" tab of all create entity requests
   - These scripts will automatically set the necessary environment variables

4. Authentication:
   - Run the "Login" request in the Authentication folder
   - This will automatically set the `authToken` variable for subsequent requests

5. Testing Flow:
   - Start by creating a personal record or getting existing personal IDs
   - Set the `personalId` environment variable
   - Create entities (employment, income, etc.) associated with the personal ID
   - When creating entities, if you've added the test scripts, IDs will be automatically saved
   - Use the saved IDs for update and delete operations

## Request Structure

All endpoints follow a RESTful pattern:

- **GET** `/client-data/personal/{personalId}/{entityType}` - Get all entities of a type for a personal record
- **POST** `/client-data/{entityType}` - Create a new entity
- **PUT** `/client-data/{entityType}/{id}` - Update an entity
- **DELETE** `/client-data/{entityType}/{id}` - Delete an entity

## Headers

All authenticated requests require the following headers:

```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

## Testing Tips

1. Always authenticate first before testing other endpoints
2. Test creation operations before retrieval, update, or delete operations
3. Use the provided test scripts to automatically extract and set IDs from responses
4. Create test cases for both valid and invalid inputs
5. Use the pre-request scripts for setup and the test scripts for assertions and variable setting

## Authentication Test Script

The `auth-test-script.js` file contains a script that:
1. Verifies the response has status code 200
2. Checks that the response contains a token
3. Automatically sets the `authToken` environment variable

## Entity Creation Test Script

The `entity-creation-test-script.js` file contains a script that:
1. Verifies the response has status code 201
2. Checks that the response contains an ID
3. Automatically sets the appropriate environment variable based on the entity type:
   - `employmentId` for employment endpoints
   - `incomeId` for income endpoints
   - `expensesId` for expenses endpoints
   - And so on for other entity types

## Custom Scripts

You can also create your own custom test and pre-request scripts. Here's an example pre-request script to create dependencies:

```javascript
// Example pre-request script to create a personal record if needed
if (!pm.environment.get('personalId')) {
  // Make a request to create a personal record
  const createPersonalRequest = {
    url: pm.environment.get('baseUrl') + '/personal-details',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + pm.environment.get('authToken')
    },
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        // Personal details data
      })
    }
  };
  
  pm.sendRequest(createPersonalRequest, (err, res) => {
    if (!err) {
      pm.environment.set('personalId', res.json().id);
    }
  });
}
```
