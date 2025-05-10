import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get port from environment or use default
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`YourWealth.Coach API server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  // Exit with failure
  process.exit(1);
}); 