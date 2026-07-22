import { Request, Response } from 'express';
import * as WebhookService from '../service/Webhook.service';

export const paypalWebhook = async (
    req: Request,
    res: Response
) => {

    try {

        await WebhookService.processPaypalWebhook(req);

        res.sendStatus(200);

    } catch (error: any) {

        console.error('🔴 Error procesando webhook de PayPal:', error?.message ?? error);

        res.sendStatus(error?.status === 401 ? 401 : 500);

    }

};