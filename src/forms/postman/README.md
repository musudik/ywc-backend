# YWC Forms API Postman Collection

This directory contains Postman collection and environment files for testing the Forms API endpoints in the YWC backend.

## Files

- `forms-api-collection.json`: Contains all API endpoints for testing different form types
- `forms-api-environment.json`: Contains environment variables for testing

## Included Form Types

The collection includes endpoints for the following form types:

1. **Immobilien (Real Estate)**
2. **Private Health Insurance**
3. **State Health Insurance**
4. **KFZ (Auto Insurance)**
5. **Loans**

## Setup Instructions

1. Import the collection and environment into Postman:
   - Open Postman
   - Click "Import" button
   - Select both `forms-api-collection.json` and `forms-api-environment.json` files
   - Click "Import"

2. Set up the environment:
   - Select the "YWC Forms API Environment" from the environment dropdown
   - Update the `baseUrl` variable if your API is running on a different port or host
   - Set the `authToken` variable with a valid JWT token after authentication
   - The form ID variables (e.g., `immobilienFormId`) will be automatically set when you create new forms

## Testing Flow

### Authentication
Before testing the API endpoints, you need to authenticate and get a valid JWT token. You can:
1. Use the authentication endpoints in your API
2. Copy the token and set it in the `authToken` environment variable

### Testing Forms API

For each form type, follow this general workflow:

1. Create a new form using the "Create X Form" request
2. The response will include the form ID - you can manually set this in the appropriate environment variable (e.g., `immobilienFormId`)
3. Use the "Get X Form by ID" request to verify the form was created
4. Update the form using the "Update X Form" request
5. Check the status or delete the form using the respective endpoints

## Available Endpoints for Each Form Type

Each form type has the following endpoints:

1. **Create Form** (POST)
2. **Get All Forms** (GET)
3. **Get Form by ID** (GET)
4. **Update Form** (PUT)
5. **Delete Form** (DELETE)
6. **Update Form Status** (PATCH)

## Form Statuses

Forms can have the following statuses:
- `No-Form`: Form has not been submitted by the client
- `Submitted`: Form has been submitted by the client
- `Pending`: Form is awaiting approval from Coach
- `Approved`: Form has been approved by Coach

## Notes

- All requests require authentication via JWT token
- The collection includes example request bodies for create and update operations
- Environment variables are used to maintain state between requests
- Make sure your API server is running before testing the endpoints 