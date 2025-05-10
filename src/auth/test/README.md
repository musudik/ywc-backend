# Auth Controller Testing

This directory contains tests for the authentication controller of the YWC backend.

## Unit Tests

The `controllers/auth-controller.test.ts` file contains comprehensive unit tests for the AuthController class, covering all methods and various scenarios including:

- User registration
- User login
- Email verification
- Password reset
- User profile management
- Firebase webhook handling

To run the unit tests:

```bash
npm run test:auth
```

## Postman Collection

For manual testing and API exploration, a Postman collection is provided:

### Files

- `auth-controller-postman-collection.json`: The Postman collection with all auth endpoints
- `auth-controller-postman-environment.json`: Environment variables for the collection

### Setup Instructions

1. Import both files into Postman:
   - Open Postman
   - Click on "Import" in the top left corner
   - Select both JSON files to import

2. Select the "YWC Auth API - Local" environment from the environment dropdown in the top right corner

3. Configure the environment variables if needed:
   - `baseUrl`: The base URL of your API (default: http://localhost:3000)
   - `firebaseWebhookSecret`: Secret for Firebase webhook authentication

### Using the Collection

The collection includes requests for all auth endpoints:

1. **Register User**: Create a new user account
   - Automatically sends verification email

2. **Login User**: Authenticate a user
   - Automatically saves the auth token to the environment variables

3. **Verify Email**: Confirm a user's email address
   - Requires the verification code from the email

4. **Forgot Password**: Request a password reset email

5. **Get Current User**: Retrieve the authenticated user's profile
   - Uses the saved auth token

6. **Update Profile**: Modify the user's profile information
   - Uses the saved auth token

7. **Firebase Webhook**: Test Firebase auth webhook events

### Test Scripts

The collection includes test scripts that:
- Automatically extract and store the auth token after login
- Validate response formats

## Integration with CI/CD

For automated API testing in CI/CD pipelines, you can use Newman (Postman's command-line tool):

```bash
# Install Newman
npm install -g newman

# Run the collection
newman run src/auth/test/auth-controller-postman-collection.json -e src/auth/test/auth-controller-postman-environment.json
``` 