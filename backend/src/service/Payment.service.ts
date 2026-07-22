import { v4 as uuid } from "uuid";

import PaypalService from "./Paypal.service";

import { PaymentModel, PaymentStatus } from "../models/Payment.model";
import { EventModel } from "../models/Event.model";

import { PLAN_PRICES_USD, PlanType } from "../models/Plan";

/**
 * Crea una orden de PayPal y registra el pago pendiente en la base de datos.
 *
 * Orden de operaciones (importante):
 * 1. Validaciones previas
 * 2. Crear la orden en PayPal → obtener el ID real de PayPal
 * 3. Crear el registro de Payment con el providerOrderId real (evita el unique-index bug)
 * 4. Marcar el plan pendiente en el evento
 */
export const createPaypalOrder = async (
    eventId: string,
    organizerId: string,
    plan: PlanType
) => {

    if (plan === PlanType.FREE || !Object.values(PlanType).includes(plan)) {
        const err: any = new Error("Plan inválido");
        err.status = 400;
        throw err;
    }

    const event = await EventModel.findOne({
        _id: eventId,
        organizer: organizerId
    });

    if (!event) {
        const err: any = new Error("Evento no encontrado");
        err.status = 404;
        throw err;
    }

    const existingPayment = await PaymentModel.findOne({
        event: event._id,
        organizer: organizerId,
        status: "pending"
    });

    if (existingPayment) {
        const err: any = new Error(
            "Ya existe un pago pendiente para este evento. Finalízalo o cancélalo antes de crear uno nuevo."
        );
        err.status = 409;
        throw err;
    }

    const amount = PLAN_PRICES_USD[plan];
    const orderId = uuid();

    const frontendUrl = process.env.FRONTEND_URL!;

    // 1. Crear la orden en PayPal PRIMERO para obtener el ID real
    const paypalOrder = await PaypalService.createOrder(
        orderId,
        amount,
        `${frontendUrl}/events/${eventId}/payment-result?orderId=${orderId}`,
        `${frontendUrl}/events/${eventId}/payment-result?orderId=${orderId}&cancelled=true`
    );

    // 2. Registrar el pago con el providerOrderId real de PayPal
    await PaymentModel.create({
        orderId,
        provider: "paypal",
        providerOrderId: paypalOrder.id,
        event: event._id,
        organizer: organizerId,
        plan,
        amount,
        currency: "USD",
        status: "pending"
    });

    // 3. Marcar el plan pendiente en el evento
    event.pendingPlan = plan;
    await event.save();

    return {
        orderId,
        approveUrl: PaypalService.getApproveLink(paypalOrder),
        amount,
        currency: "USD"
    };

};

/**
 * Captura el pago de una orden previamente aprobada por el usuario en PayPal.
 * Llamar después de que PayPal redirija al usuario de vuelta a nuestra app.
 */
export const capturePaypalOrder = async (
    orderId: string,
    organizerId: string
) => {

    const payment = await PaymentModel.findOne({ orderId, organizer: organizerId });

    if (!payment) {
        const err: any = new Error("Orden no encontrada");
        err.status = 404;
        throw err;
    }

    if (payment.status === "approved") {
        return payment;
    }

    if (payment.status !== "pending") {
        const err: any = new Error("La orden no está en estado pendiente");
        err.status = 400;
        throw err;
    }

    // Llamar a PayPal para capturar el pago
    const capture = await PaypalService.captureOrder(payment.providerOrderId);

    const captureStatus = capture?.status;
    const captureId = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    if (captureStatus === "COMPLETED") {
        payment.status = PaymentStatus.APPROVED;
        if (captureId) payment.providerCaptureId = captureId;
        await payment.save();

        await EventModel.findByIdAndUpdate(payment.event, {
            plan: payment.plan,
            pendingPlan: null
        });
    } else {
        payment.status = PaymentStatus.REJECTED;
        await payment.save();

        await EventModel.findByIdAndUpdate(payment.event, { pendingPlan: null });
    }

    return payment;

};

/**
 * Consulta el estado de un pago por su orderId interno.
 */
export const getPaymentStatus = async (
    orderId: string,
    organizerId: string
) => {

    const payment = await PaymentModel.findOne({
        orderId,
        organizer: organizerId
    });

    if (!payment) {
        const err: any = new Error("Orden no encontrada");
        err.status = 404;
        throw err;
    }

    return payment;

};
