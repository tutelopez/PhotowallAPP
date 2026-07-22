import { Request } from "express";

export const processPaypalWebhook = async (

    req: Request

) => {

    const event = req.body;

    console.log(event);

};