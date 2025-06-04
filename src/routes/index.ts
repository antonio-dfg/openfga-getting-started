import { Express, Request, Response } from 'express';
import path from 'path';
import { AuthzService } from '../services/authz.service';

export function setupRoutes(app: Express, authzService: AuthzService) {
  
  // Serve the main UI page
  app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
  });
  
  // Check authorization endpoint
  app.post('/api/check', async (req: Request, res: Response) => {
    try {
      const { user, relation, object } = req.body;
      
      if (!user || !relation || !object) {
        return res.status(400).json({ 
          error: 'Missing required fields: user, relation, object' 
        });
      }

      const allowed = await authzService.check({ user, relation, object });
      res.json({ allowed });
    } catch (error) {
      console.error('Error in check endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create document ownership
  app.post('/api/documents/:documentId/owner', async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      await authzService.createDocumentOwnership(userId, documentId);
      res.json({ success: true, message: 'Document ownership created' });
    } catch (error) {
      console.error('Error creating document ownership:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Share document with user
  app.post('/api/documents/:documentId/share', async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;
      const { userId, permission } = req.body;
      
      if (!userId || !permission) {
        return res.status(400).json({ error: 'Missing userId or permission' });
      }

      if (!['viewer', 'editor'].includes(permission)) {
        return res.status(400).json({ error: 'Permission must be viewer or editor' });
      }

      await authzService.shareDocument(userId, documentId, permission);
      res.json({ success: true, message: 'Document shared successfully' });
    } catch (error) {
      console.error('Error sharing document:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Check document read access
  app.get('/api/documents/:documentId/can-read/:userId', async (req: Request, res: Response) => {
    try {
      const { documentId, userId } = req.params;
      
      const canRead = await authzService.canReadDocument(userId, documentId);
      res.json({ canRead });
    } catch (error) {
      console.error('Error checking document read access:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Check document write access
  app.get('/api/documents/:documentId/can-write/:userId', async (req: Request, res: Response) => {
    try {
      const { documentId, userId } = req.params;
      
      const canWrite = await authzService.canWriteDocument(userId, documentId);
      res.json({ canWrite });
    } catch (error) {
      console.error('Error checking document write access:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Example data setup endpoint
  app.post('/api/setup-example-data', async (req: Request, res: Response) => {
    try {
      // Create some example relationships
      await authzService.createDocumentOwnership('alice', 'doc1');
      await authzService.shareDocument('bob', 'doc1', 'editor');
      await authzService.shareDocument('charlie', 'doc1', 'viewer');
      
      await authzService.createDocumentOwnership('bob', 'doc2');
      await authzService.shareDocument('alice', 'doc2', 'viewer');

      res.json({ 
        success: true, 
        message: 'Example data created',
        examples: [
          'alice owns doc1, bob is editor, charlie is viewer',
          'bob owns doc2, alice is viewer'
        ]
      });
    } catch (error) {
      console.error('Error setting up example data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
} 