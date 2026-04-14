import { Router } from 'express';
import { createPad, getPad, getPadMeta, getPadText, savePad, verifyPad } from '../controllers/padController.js';

const router = Router();

router.get('/:padName/meta', getPadMeta);
router.post('/:padName/create', createPad);
router.post('/:padName/verify', verifyPad);
router.get('/:padName', getPad);
router.post('/:padName', savePad);
router.get('/:padName/text', getPadText);

export default router;
