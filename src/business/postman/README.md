# YourWealth.Coach API Postman Collection

This directory contains Postman collection and environment files for testing the YourWealth.Coach API endpoints.

## Files

- `ywc-backend-api-collection.json`: Contains all API endpoints organized by controller
- `ywc-backend-environment.json`: Contains environment variables for the collection

## How to Use

1. Import the collection and environment into Postman:
   - Open Postman
   - Click on "Import" button
   - Select both `ywc-backend-api-collection.json` and `ywc-backend-environment.json` files

2. Set up the environment:
   - Select the "YourWealth.Coach Backend Environment" from the environment dropdown
   - Ensure the `baseUrl` is set correctly (default: http://localhost:3000/api)

3. Authentication:
   - First, use the "Register" request to create a new user
   - Then, use the "Login" request to get an authentication token
   - The login request automatically sets the `token` environment variable

4. Using the API:
   - All authenticated endpoints will use the token automatically
   - Many requests have test scripts that automatically set environment variables
   - For example, creating personal details will set the `personalId` variable

## Request Flow

The collection is organized to follow a typical user flow:

1. Authentication (register/login)
2. Create personal details
3. Add employment, income, and other client data
4. Check profile completion status

## Environment Variables

The collection uses the following environment variables:

- `baseUrl`: The base URL for the API
- `token`: Authentication token (set automatically after login)
- `userId`: The ID of the current user
- `personalId`: The ID of the personal details record
- Various IDs for different data types (employmentId, incomeId, etc.)

## Notes

- Make sure the backend server is running before using the collection
- The collection includes test scripts that automatically set environment variables
- You can modify the request bodies to test different scenarios 