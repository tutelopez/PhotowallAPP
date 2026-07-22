import { v4 as uuid } from "uuid";

import PaypalService from "../service/Paypal.service";

import { PaymentModel } from "../models/Payment.model";
import { EventModel } from "../models/Event.model";

import { PLAN_PRICES_USD, PlanType } from "../models/Plan";

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

    

    const payment = await PaymentModel.create({

        orderId,

        provider: "paypal",

        providerOrderId: "",

        event: event._id,

        organizer: organizerId,

        plan,

        amount,

        currency: "USD",

        status: "pending"

    });

    event.pendingPlan = plan;

    await event.save();

    const frontendUrl = process.env.FRONTEND_URL!;

    const paypalOrder = await PaypalService.createOrder(

        orderId,

        amount,

        `${frontendUrl}/payment/success?orderId=${orderId}`,

        `${frontendUrl}/payment/cancel?orderId=${orderId}`

    );

    payment.providerOrderId = paypalOrder.id;

    await payment.save();

    return {

        orderId,

        approveUrl: PaypalService.getApproveLink(paypalOrder),

        amount,

        currency: "USD"

    };

};

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

