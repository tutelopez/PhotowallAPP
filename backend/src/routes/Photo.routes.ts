import { Router } from 'express';
import { upload } from '../config/multer';
import { uploadPhoto, deletePhoto, getPhotosByEvent } from '../controller/Photo.controller';

const router = Router();

router.post('/upload', upload.single('photo'), uploadPhoto);
router.delete('/:photoId', deletePhoto);
router.get('/event/:eventId', getPhotosByEvent);

export default router;
