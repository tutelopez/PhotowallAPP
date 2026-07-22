import { Request } from "express";

import { PaymentModel, PaymentStatus } from "../models/Payment.model";
import { EventModel } from "../models/Event.model";
import { UserModel } from "../models/User.model";
import { PlanType } from "../models/Plan";
import { sendPlanThankYouEmail } from "./Email.service";
import PaypalService from "./Paypal.service";

/**
 * Procesa un evento de webhook de PayPal.
 *
 * Eventos manejados:
 *  - PAYMENT.CAPTURE.COMPLETED  → aprueba el pago y activa el plan
 *  - PAYMENT.CAPTURE.DENIED     → rechaza el pago, limpia pendingPlan
 *  - CHECKOUT.ORDER.CANCELLED   → cancela el pago, limpia pendingPlan
 */
export const processPaypalWebhook = async (req: Request) => {

    // 1. Verificar firma de PayPal
    const isValid = await PaypalService.verifyWebhookSignature(
        req.headers,
        req.body
    );

    if (!isValid) {
        const err: any = new Error("Firma de webhook inválida");
        err.status = 401;
        throw err;
    }

    const event = req.body;
    const eventType: string = event.event_type ?? "";

    console.log(`📩 Webhook PayPal [${eventType}]`);

    // 2. Despachar según el tipo de evento
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
        await handleCaptureCompleted(event);

    } else if (
        eventType === "PAYMENT.CAPTURE.DENIED" ||
        eventType === "CHECKOUT.ORDER.CANCELLED"
    ) {
        await handlePaymentFailed(event);

    } else {
        console.log(`ℹ️ Evento de PayPal ignorado: ${eventType}`);
    }

};

/**
 * Pago completado con éxito.
 */
async function handleCaptureCompleted(event: any) {

    const resource = event.resource ?? {};

    // El PayPal order ID está en supplementary_data
    const paypalOrderId: string =
        resource.supplementary_data?.related_ids?.order_id ?? "";

    const captureId: string = resource.id ?? "";

    if (!paypalOrderId) {
        console.warn("⚠️ Webhook CAPTURE.COMPLETED sin order_id, ignorando");
        return;
    }

    const payment = await PaymentModel.findOne({ providerOrderId: paypalOrderId });

    if (!payment) {
        console.warn(`⚠️ No se encontró el pago para el order PayPal: ${paypalOrderId}`);
        return;
    }

    if (payment.status === "approved") {
        console.log(`ℹ️ Pago ${payment.orderId} ya estaba aprobado, ignorando`);
        return;
    }

    payment.status = PaymentStatus.APPROVED;
    if (captureId) payment.providerCaptureId = captureId;
    await payment.save();

    const dbEvent = await EventModel.findById(payment.event);
    if (dbEvent) {
        dbEvent.plan = payment.plan;
        dbEvent.pendingPlan = null;
        await dbEvent.save();

        const organizer = await UserModel.findById(payment.organizer);
        if (organizer) {
            sendPlanThankYouEmail(
                { name: organizer.name, email: organizer.email },
                { name: dbEvent.name, slug: dbEvent.slug, plan: dbEvent.plan as PlanType }
            ).catch((err: any) => console.error("⚠️ Error enviando email de confirmación:", err));
        }
    }

    console.log(`✅ Pago aprobado vía webhook: orderId=${payment.orderId}, plan=${payment.plan}`);

}

/**
 * Pago fallido o cancelado.
 */
async function handlePaymentFailed(event: any) {

    const resource = event.resource ?? {};

    const paypalOrderId: string =
        resource.supplementary_data?.related_ids?.order_id ??
        resource.id ??
        "";

    if (!paypalOrderId) {
        console.warn("⚠️ Webhook de pago fallido sin order_id, ignorando");
        return;
    }

    const payment = await PaymentModel.findOne({ providerOrderId: paypalOrderId });

    if (!payment) {
        console.warn(`⚠️ No se encontró el pago para el order PayPal: ${paypalOrderId}`);
        return;
    }

    if (payment.status !== "pending") {
        return;
    }

    payment.status = PaymentStatus.REJECTED;
    await payment.save();

    await EventModel.findByIdAndUpdate(payment.event, { pendingPlan: null });

    console.log(`❌ Pago rechazado vía webhook: orderId=${payment.orderId}`);

}