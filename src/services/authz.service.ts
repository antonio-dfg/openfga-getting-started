import { OpenFgaClient, CheckRequest, WriteRequest, TupleKey } from '@openfga/sdk';

export interface AuthzCheck {
  user: string;
  relation: string;
  object: string;
}

export class AuthzService {
  constructor(private fgaClient: OpenFgaClient) {}

  /**
   * Check if a user has permission to perform an action on a resource
   */
  async check(authzCheck: AuthzCheck): Promise<boolean> {
    const { user, relation, object } = authzCheck;
    
    try {
      const response = await this.fgaClient.check({
        user,
        relation,
        object,
      });
      
      return response.allowed || false;
    } catch (error) {
      console.error('Error checking authorization:', error);
      return false;
    }
  }

  /**
   * Write relationship tuples to OpenFGA
   */
  async writeRelationships(tuples: TupleKey[]): Promise<void> {
    try {
      await this.fgaClient.write({
        writes: tuples,
      });
    } catch (error) {
      console.error('Error writing relationships:', error);
      throw error;
    }
  }

  /**
   * Delete relationship tuples from OpenFGA
   */
  async deleteRelationships(tuples: TupleKey[]): Promise<void> {
    try {
      await this.fgaClient.write({
        deletes: tuples,
      });
    } catch (error) {
      console.error('Error deleting relationships:', error);
      throw error;
    }
  }

  /**
   * Helper method to create document ownership
   */
  async createDocumentOwnership(userId: string, documentId: string): Promise<void> {
    const tuple: TupleKey = {
      user: `user:${userId}`,
      relation: 'owner',
      object: `document:${documentId}`,
    };
    
    await this.writeRelationships([tuple]);
  }

  /**
   * Helper method to share document with user
   */
  async shareDocument(userId: string, documentId: string, permission: 'viewer' | 'editor'): Promise<void> {
    const tuple: TupleKey = {
      user: `user:${userId}`,
      relation: permission,
      object: `document:${documentId}`,
    };
    
    await this.writeRelationships([tuple]);
  }

  /**
   * Helper method to check document access
   */
  async canReadDocument(userId: string, documentId: string): Promise<boolean> {
    return this.check({
      user: `user:${userId}`,
      relation: 'can_read',
      object: `document:${documentId}`,
    });
  }

  /**
   * Helper method to check document write access
   */
  async canWriteDocument(userId: string, documentId: string): Promise<boolean> {
    return this.check({
      user: `user:${userId}`,
      relation: 'can_write',
      object: `document:${documentId}`,
    });
  }
} 