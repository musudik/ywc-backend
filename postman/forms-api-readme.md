# YWC Forms API - Postman Collection

This folder contains Postman collection and environment files for testing the Your Wealth Coach (YWC) Forms API.

## Files

- `ywc-backend-forms.json`: Postman collection containing API endpoints for all form types
- `ywc-forms-environment.json`: Environment variables for the collection

## Setting Up

1. Import both files into Postman:
   - Open Postman
   - Click on "Import" button in the top left
   - Select both JSON files or drag and drop them
   - Click "Import" to complete the process

2. Select the environment:
   - After importing, select "YWC Forms API Environment" from the environment dropdown in the top right

3. Update environment variables:
   - Click on the "eye" icon next to the environment dropdown
   - Set the `baseUrl` to your API server address (default is http://localhost:3000)
   - Update other variables as needed

## Authentication

Before using the Forms API endpoints, you need to authenticate:

1. Use the Authentication API to get a JWT token (not included in this collection)
2. Copy the token value
3. Update the `authToken` variable in the environment

## Using the Collection

The collection is organized by form types:

- **Immobilien Forms**: Real estate forms
- **Private Health Insurance Forms**: Private health insurance forms
- **State Health Insurance Forms**: State health insurance forms
- **KFZ Insurance Forms**: Auto insurance forms
- **Loans Forms**: Loan application forms

Each form type includes endpoints for:

- Creating a new form
- Getting all forms
- Getting a form by ID
- Updating a form
- Deleting a form
- Updating form status

## Form IDs

When you create a new form, set the corresponding ID environment variable:

1. Send a POST request to create a form
2. In the response, find the `formId` value
3. Set the corresponding environment variable (e.g., `immobilienFormId`)
4. Now you can use the GET, PUT, DELETE, and PATCH endpoints that require an ID

## Example Workflow

1. Authenticate and set the `authToken`
2. Create a new form using the POST endpoint
3. Set the form ID in the environment variables
4. Test other endpoints (GET, PUT, DELETE, PATCH)

## Notes

- All requests require authentication via JWT token
- Each form type has its own data structure and validation rules
- The form status can be one of: "No-Form", "Submitted", "Pending", "Approved" 