# Auth Controller Happy Path Test Collection

This folder contains a Postman collection and environment for testing the happy path scenarios of the YWC Auth API. The collection is designed to test each endpoint with valid inputs to verify that the authentication system works correctly in ideal conditions.

## Collection Contents

The collection includes requests for all the endpoints in the Auth Controller:

1. **Register User** - Create a new user account with valid credentials
2. **Login User** - Sign in with valid credentials and get an auth token
3. **Verify Email** - Confirm email with a valid verification token
4. **Forgot Password** - Request a password reset email
5. **Reset Password** - Change password with a valid reset token
6. **Get Current User** - Retrieve authenticated user profile
7. **Update Profile** - Update user profile information
8. **Firebase Webhook** - Process Firebase authentication events

## Setup Instructions

### Import Collection and Environment

1. Open Postman
2. Click on "Import" button
3. Select both files:
   - `auth-controller-happy-path-collection.json`
   - `auth-controller-happy-path-environment.json`
4. Confirm import

### Configure Environment

1. After importing, select the "YWC Auth API - Happy Path Testing" environment from the environment dropdown in the top right corner
2. Update any variables as needed, particularly:
   - `baseUrl` - Set to your API server address (default: http://localhost:3000)
   - `firebaseWebhookSecret` - Set to match your server's configured webhook secret

### Running Tests

This collection is organized to follow the typical user flow:

1. First run the "Register User" request to create a test account
2. Then run the "Login User" request to get an authentication token
   - This will automatically save the token to the environment variables
3. After that, you can run the authenticated requests like "Get Current User" and "Update Profile"

### Testing Tips

- The Login request automatically sets the `authToken` environment variable when successful
- All authenticated requests use this token via the `{{authToken}}` variable
- To reset your test state, clear the environment variables and start again from registration
- You can view the token value in the Postman environment quick look section

## Notes on Happy Path Testing

This collection focuses exclusively on the happy path scenarios where everything works as expected. Key characteristics of these tests include:

- All inputs are valid and well-formed
- All request headers are properly set
- The authentication flow is followed in correct sequence
- No error conditions are deliberately triggered

For error case testing, refer to the main auth-controller-postman-collection that includes both happy and error scenarios.

## Authentication Flow

The happy path collection demonstrates the complete authentication flow:

1. User registration
2. Email verification
3. Login
4. Accessing protected resources
5. Profile management
6. Password reset flow

Following these requests in sequence will validate the entire authentication system works correctly in ideal conditions. 