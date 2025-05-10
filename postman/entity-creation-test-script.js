// Test that the response code is 201 Created
pm.test("Entity created successfully", function() {
  pm.response.to.have.status(201);
});

// Test that the response has an ID
pm.test("Response has ID", function() {
  pm.expect(pm.response.json()).to.have.property('id');
});

// Extract the ID and set it to the appropriate environment variable
if (pm.response.code === 201) {
  const responseJson = pm.response.json();
  
  if (responseJson.id) {
    // Determine which environment variable to set based on the request URL
    const urlPath = pm.request.url.path.join('/');
    
    if (urlPath.includes('employment')) {
      pm.environment.set('employmentId', responseJson.id);
      console.log('Employment ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('income')) {
      pm.environment.set('incomeId', responseJson.id);
      console.log('Income ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('expenses')) {
      pm.environment.set('expensesId', responseJson.id);
      console.log('Expenses ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('asset')) {
      pm.environment.set('assetId', responseJson.id);
      console.log('Asset ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('liability')) {
      pm.environment.set('liabilityId', responseJson.id);
      console.log('Liability ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('goals-wishes')) {
      pm.environment.set('goalsWishesId', responseJson.id);
      console.log('Goals and Wishes ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('risk-appetite')) {
      pm.environment.set('riskAppetiteId', responseJson.id);
      console.log('Risk Appetite ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('consent')) {
      pm.environment.set('consentId', responseJson.id);
      console.log('Consent ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('document')) {
      pm.environment.set('documentId', responseJson.id);
      console.log('Document ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('custom-form')) {
      pm.environment.set('customFormId', responseJson.id);
      console.log('Custom Form ID set to: ' + responseJson.id);
    } 
    else if (urlPath.includes('form') && !urlPath.includes('custom-form')) {
      pm.environment.set('formId', responseJson.id);
      console.log('Form ID set to: ' + responseJson.id);
    }
    else if (urlPath.includes('personal-details')) {
      pm.environment.set('personalId', responseJson.id);
      console.log('Personal ID set to: ' + responseJson.id);
    }
  }
}