import { Router } from 'express';
import * as WebhookController from "../controller/Webhook.controller";


const router = Router();


router.post(
    "/paypal",
    WebhookController.paypalWebhook
);