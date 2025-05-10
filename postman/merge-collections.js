const fs = require('fs');
const path = require('path');

// Read the main collection file
const mainCollection = JSON.parse(fs.readFileSync(path.join(__dirname, 'ywc-backend-client-data.json')));

// Read the additional collection file
const additionalCollection = JSON.parse(fs.readFileSync(path.join(__dirname, 'ywc-backend-client-data-additional.json')));

// Merge the collections
additionalCollection.item.forEach(folder => {
  mainCollection.item.push(folder);
});

// Merge the variables
if (additionalCollection.variable && additionalCollection.variable.length > 0) {
  if (!mainCollection.variable) {
    mainCollection.variable = [];
  }
  
  additionalCollection.variable.forEach(variable => {
    if (!mainCollection.variable.some(v => v.key === variable.key)) {
      mainCollection.variable.push(variable);
    }
  });
}

// Write the merged collection
fs.writeFileSync(
  path.join(__dirname, 'ywc-backend-client-data-complete.json'),
  JSON.stringify(mainCollection, null, 2)
);

console.log('Collections merged successfully to ywc-backend-client-data-complete.json'); 