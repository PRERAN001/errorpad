import { Router } from 'express';
import { downloadFile, listFiles, legacyUploadHandler, removeFile, uploadFile, uploadMiddleware } from '../controllers/fileController.js';

const router = Router();

router.post('/:padName/files', uploadMiddleware.single('file'), uploadFile);
router.get('/:padName/files', listFiles);
router.get('/:padName/files/:fileId/download', downloadFile);
router.delete('/:padName/files/:fileId', removeFile);

// shared middleware for legacy routes is exported separately for app-level reuse.
export { legacyUploadHandler };
export default router;
