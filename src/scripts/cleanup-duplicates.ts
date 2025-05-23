/**
 * Script to clean up duplicate client forms
 * 
 * Run with: npx ts-node src/scripts/cleanup-duplicates.ts
 */

import { ClientFormService } from '../forms/client-forms/client-form.service';

async function cleanupDuplicates() {
  console.log('Starting duplicate client forms cleanup...');
  
  const clientFormService = new ClientFormService();
  
  try {
    const result = await clientFormService.cleanupDuplicates();
    
    if (result.success) {
      console.log(`Cleanup successful: ${result.message}`);
      console.log(`Deleted ${result.deletedCount} duplicate forms`);
    } else {
      console.error('Cleanup failed:', result.message);
      if (result.error) {
        console.error('Error details:', result.error);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
  
  console.log('Cleanup process completed');
  process.exit(0);
}

// Run the cleanup
cleanupDuplicates(); 