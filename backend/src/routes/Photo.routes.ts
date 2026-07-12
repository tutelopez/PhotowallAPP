import { Router } from 'express';
import { upload } from '../config/multer';
import { uploadPhoto, deletePhoto, getPhotosByEvent } from '../controller/Photo.controller';
import { ensureAuth } from '../middlewares/Auth.middlware';
import { UserRole } from '../models/User.model';

const router = Router();

router.post('/upload', upload.single('photo'), uploadPhoto);
router.delete('/:photoId', ensureAuth([UserRole.ORGANIZER]), deletePhoto);
router.get('/event/:eventId', getPhotosByEvent);

export default router;