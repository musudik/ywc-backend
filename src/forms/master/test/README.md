# Analysis Form API Testing

This directory contains Postman collection and environment files for testing the Analysis Form API endpoints.

## Files

- `analysis-form-postman-collection.json`: Contains all API endpoints for testing the Analysis Form functionality
- `analysis-form-postman-environment.json`: Contains environment variables for testing
- `analysis-form.controller.test.ts`: Contains unit tests for the AnalysisFormController

## Setup Instructions

1. Import the collection and environment into Postman:
   - Open Postman
   - Click "Import" button
   - Select both `analysis-form-postman-collection.json` and `analysis-form-postman-environment.json` files
   - Click "Import"

2. Set up the environment:
   - Select the "Analysis Form API Environment" from the environment dropdown
   - Update the `baseUrl` variable if your API is running on a different port or host
   - Set the `authToken` variable with a valid JWT token after authentication
   - The `formId` variable will be automatically set when you create a new form

## Available Endpoints

1. **Create Analysis Form**
   - Method: POST
   - URL: `{{baseUrl}}/api/forms/analysis`
   - Requires authentication
   - Creates a new analysis form with applicant and children information

2. **Get All Analysis Forms**
   - Method: GET
   - URL: `{{baseUrl}}/api/forms/analysis`
   - Requires authentication
   - Returns all analysis forms for the authenticated user

3. **Get Analysis Form by ID**
   - Method: GET
   - URL: `{{baseUrl}}/api/forms/analysis/:id`
   - Requires authentication
   - Returns a specific analysis form by ID

4. **Update Analysis Form**
   - Method: PUT
   - URL: `{{baseUrl}}/api/forms/analysis/:id`
   - Requires authentication
   - Updates an existing analysis form

5. **Delete Analysis Form**
   - Method: DELETE
   - URL: `{{baseUrl}}/api/forms/analysis/:id`
   - Requires authentication
   - Deletes an analysis form

6. **Update Form Status**
   - Method: PATCH
   - URL: `{{baseUrl}}/api/forms/analysis/:id/status`
   - Requires authentication
   - Updates the status of an analysis form

## Testing Flow

1. First, authenticate and get a valid JWT token
2. Set the token in the environment variable `authToken`
3. Create a new analysis form using the "Create Analysis Form" request
4. The response will include the form ID - this will be automatically set in the `formId` environment variable
5. Use the other endpoints to test the full CRUD functionality
6. Test the status update endpoint to verify form status changes

## Running Unit Tests

To run the unit tests:

```bash
npm test src/forms/master/test/analysis-form.controller.test.ts
```

The tests cover:
- Form creation with validation
- Form retrieval (single and all)
- Form updates
- Form deletion
- Status updates
- Error handling
- Authentication checks

## Notes

- All requests require authentication via JWT token
- The collection includes example request bodies for create and update operations
- Environment variables are used to maintain state between requests
- The test file includes comprehensive test cases for all controller methods 