import { Schema, model, Types } from "mongoose";
import { PlanType } from "./Plan";

export enum PaymentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}

export enum PaymentProvider {
    PAYPAL = "paypal"
}

const PaymentSchema = new Schema(
{
    orderId:{
        type:String,
        required:true,
        unique:true,
        index:true
    },

    provider:{
        type:String,
        enum:Object.values(PaymentProvider),
        default:PaymentProvider.PAYPAL
    },

    providerOrderId:{
        type:String,
        required:true,
        unique:true,
        index:true
    },

    providerCaptureId:{
        type:String,
        default:null
    },

    event:{
        type:Types.ObjectId,
        ref:"Event",
        required:true
    },

    organizer:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },

    plan:{
        type:String,
        enum:Object.values(PlanType),
        required:true
    },

    amount:{
        type:Number,
        required:true
    },

    currency:{
        type:String,
        default:"USD"
    },

    status:{
        type:String,
        enum:Object.values(PaymentStatus),
        default:PaymentStatus.PENDING
    }

},
{
    timestamps:true
});

export const PaymentModel=model("Payment",PaymentSchema);