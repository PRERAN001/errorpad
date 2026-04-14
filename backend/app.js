import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { connectDatabase } from './config/db.js';
import padRoutes from './routes/padRoutes.js';
import fileRoutes, { legacyUploadHandler } from './routes/fileRoutes.js';
import { legacyListFiles, legacyUpload } from './controllers/fileController.js';
import { getPad, getPadText, savePad } from './controllers/padController.js';
import { getSupabaseStorageStatus } from './services/supabaseStorageService.js';
import { registerSocketHandlers } from './services/socketService.js';

export const createAppServer = async () => {
  await connectDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json());

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'DELETE'],
    },
  });

  registerSocketHandlers(io);

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get('/health/storage', (_req, res) => {
    const status = getSupabaseStorageStatus();
    res.status(status.configured ? 200 : 503).json(status);
  });

  app.use(['/api/pads', '/pad'], padRoutes);
  app.use(['/api/pads', '/pad'], fileRoutes);

  app.post('/upload', legacyUploadHandler, legacyUpload);
  app.get('/files/:folderId', legacyListFiles);

  app.post('/v1/:userquery', savePad);
  app.get('/v1/:userquery', getPadText);
  app.get('/:userquery', getPad);

  return { app, httpServer, io };
};
