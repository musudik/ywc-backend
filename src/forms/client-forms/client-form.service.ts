import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export class ClientFormService {
  /**
   * Create a new client form
   */
  async create(data: {
    userId: string;
    formType: string;
    formName: string;
    formData: any;
    status?: string;
    lastEditedBy?: string;
  }) {
    // Check if a form with the same userId and formType already exists
    const existingForm = await prisma.$queryRaw`
      SELECT id FROM client_forms 
      WHERE "userId" = ${data.userId} AND "formType" = ${data.formType}
      LIMIT 1
    `;
    
    // If form exists, update it instead of creating a new one
    if (Array.isArray(existingForm) && existingForm.length > 0) {
      const formId = existingForm[0].id;
      return this.update(formId, {
        formName: data.formName,
        formData: data.formData,
        status: data.status,
        lastEditedBy: data.lastEditedBy
      });
    }
    
    // Otherwise, create a new form
    const result = await prisma.$queryRaw`
      INSERT INTO client_forms (
        id, 
        "formId", 
        "createdAt", 
        "updatedAt", 
        "userId", 
        "formType", 
        "formName", 
        "formData", 
        "status", 
        "lastEditedBy"
      ) 
      VALUES (
        gen_random_uuid(), 
        gen_random_uuid(), 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP, 
        ${data.userId}, 
        ${data.formType}, 
        ${data.formName}, 
        ${JSON.stringify(data.formData)}::jsonb, 
        ${data.status || 'Submitted'}, 
        ${data.lastEditedBy || null}
      )
      RETURNING *
    `;
    
    // Return the first row from the result
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }

  /**
   * Get a client form by ID
   */
  async getById(id: string) {
    // Check both id and formId fields
    const result = await prisma.$queryRaw`
      SELECT * FROM client_forms 
      WHERE id = ${id} OR "formId" = ${id}
      LIMIT 1
    `;
    
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }

  /**
   * Get a client form by formId specifically
   */
  async getByFormId(formId: string) {
    const result = await prisma.$queryRaw`
      SELECT * FROM client_forms 
      WHERE "formId" = ${formId}
      LIMIT 1
    `;
    
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }

  /**
   * Get all client forms for a specific user
   */
  async getByUserId(userId: string) {
    return prisma.$queryRaw`
      SELECT * FROM client_forms WHERE "userId" = ${userId}
    `;
  }

  /**
   * Get all client forms by form type
   */
  async getByFormType(formType: string) {
    return prisma.$queryRaw`
      SELECT * FROM client_forms WHERE "formType" = ${formType}
    `;
  }

  /**
   * Update a client form
   */
  async update(id: string, data: {
    formName?: string;
    formData?: any;
    status?: string;
    lastEditedBy?: string;
  }) {
    // First, get the form to determine the correct ID to use
    const form = await this.getById(id);
    if (!form) {
      return null;
    }
    
    // Use the form's actual id (not formId) for the update
    const actualId = form.id;
    
    // Build dynamic update query
    let updateFields = [];
    let params = [actualId];
    let paramCount = 2;
    
    if (data.formName) {
      updateFields.push(`"formName" = $${paramCount++}`);
      params.push(data.formName);
    }
    
    if (data.formData) {
      updateFields.push(`"formData" = $${paramCount++}::jsonb`);
      params.push(JSON.stringify(data.formData));
    }
    
    if (data.status) {
      updateFields.push(`"status" = $${paramCount++}`);
      params.push(data.status);
    }
    
    if (data.lastEditedBy) {
      updateFields.push(`"lastEditedBy" = $${paramCount++}`);
      params.push(data.lastEditedBy);
    }
    
    // Always update the updatedAt field
    updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    
    if (updateFields.length === 0) {
      return this.getById(id); // Nothing to update
    }
    
    const updateQuery = `
      UPDATE client_forms 
      SET ${updateFields.join(', ')} 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await prisma.$queryRawUnsafe(updateQuery, ...params);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }

  /**
   * Delete a client form
   */
  async delete(id: string) {
    // First, get the form to determine the correct ID to use
    const form = await this.getById(id);
    if (!form) {
      return { success: false, message: 'Form not found' };
    }
    
    // Use the form's actual id for the delete operation
    await prisma.$queryRaw`
      DELETE FROM client_forms WHERE id = ${form.id}
    `;
    return { success: true };
  }

  /**
   * Update form status
   */
  async updateStatus(id: string, status: string) {
    // First, get the form to determine the correct ID to use
    const form = await this.getById(id);
    if (!form) {
      return null;
    }
    
    // Use the form's actual id for the status update
    const result = await prisma.$queryRaw`
      UPDATE client_forms 
      SET "status" = ${status}, "updatedAt" = CURRENT_TIMESTAMP 
      WHERE id = ${form.id} 
      RETURNING *
    `;
    
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }
  
  /**
   * Clean up duplicate client forms
   * Keeps only the most recently updated form for each userId/formType combination
   */
  async cleanupDuplicates() {
    try {
      // Find duplicates (keeping the most recently updated one)
      const duplicatesQuery = `
        WITH duplicates AS (
          SELECT id, "userId", "formType", 
                ROW_NUMBER() OVER (PARTITION BY "userId", "formType" ORDER BY "updatedAt" DESC) as row_num
          FROM client_forms
        )
        SELECT id FROM duplicates WHERE row_num > 1
      `;
      
      const duplicates = await prisma.$queryRawUnsafe(duplicatesQuery);
      
      // If no duplicates, no action needed
      if (!Array.isArray(duplicates) || duplicates.length === 0) {
        return { success: true, message: 'No duplicates found', deletedCount: 0 };
      }
      
      // Extract IDs to delete
      const idsToDelete = duplicates.map((d: any) => d.id);
      
      // Delete duplicates
      const deleteQuery = `
        DELETE FROM client_forms 
        WHERE id IN (${idsToDelete.map((_, i) => `$${i + 1}`).join(',')})
        RETURNING id
      `;
      
      const deleted = await prisma.$queryRawUnsafe(deleteQuery, ...idsToDelete);
      
      return { 
        success: true, 
        message: 'Duplicates removed successfully', 
        deletedCount: Array.isArray(deleted) ? deleted.length : 0 
      };
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      return { 
        success: false, 
        message: 'Failed to clean up duplicates',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 