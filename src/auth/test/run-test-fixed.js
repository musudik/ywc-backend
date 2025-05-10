const { execSync } = require('child_process');

try {
  console.log('Running fixed auth controller tests...');
  execSync('npx jest src/auth/test/controllers-fixed/auth-controller.test.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running fixed tests:', error.message);
  process.exit(1);
} 