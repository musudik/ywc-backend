// Test that the response code is 200 OK
pm.test("Login successful", function() {
  pm.response.to.have.status(200);
});

// Test that the response has the expected structure
pm.test("Response has token", function() {
  pm.expect(pm.response.json()).to.have.property('token');
});

// Extract the token and set it to the environment variable
if (pm.response.code === 200) {
  const responseJson = pm.response.json();
  if (responseJson.token) {
    pm.environment.set('authToken', responseJson.token);
    console.log('Authentication token has been set to: ' + responseJson.token);
  }
} 