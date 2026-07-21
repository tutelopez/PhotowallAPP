import { handleCloudinaryModeration } from '../controller/Webhook.controller';
import { handleBoldWebhook } from '../controller/Webhook.controller';
import { Router } from 'express';
const router = Router();

router.post('/cloudinary-moderation', handleCloudinaryModeration);
router.post('/bold', handleBoldWebhook);