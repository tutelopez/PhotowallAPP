import { Request, Response } from 'express';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary';
import { PhotoModel } from '../models/Photo.model';
import { PaymentModel } from '../models/Payment.model';
import { EventModel } from '../models/Event.model';
import { UserModel } from '../models/User.model';
import { sendPlanThankYouEmail } from '../service/Email.service';
import { PlanType } from '../models/Plan';
import { io } from '../app';
import * as WebhookService from "../service/Webhook.service";



export const paypalWebhook = async (
    req: Request,
    res: Response
) => {

    try {

        await WebhookService.processPaypalWebhook(req);

        res.sendStatus(200);

    } catch (error) {

        console.error(error);

        res.sendStatus(500);

    }

};