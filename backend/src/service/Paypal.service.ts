import axios from "axios";

class PaypalService {

    private readonly clientId = process.env.PAYPAL_CLIENT_ID!;
    private readonly clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
    private readonly baseUrl = process.env.PAYPAL_BASE_URL!;

    /**
     * Obtiene el Access Token OAuth2
     */
    async getAccessToken(): Promise<string> {

        const auth = Buffer
            .from(`${this.clientId}:${this.clientSecret}`)
            .toString("base64");

        const response = await axios.post(

            `${this.baseUrl}/v1/oauth2/token`,

            "grant_type=client_credentials",

            {

                headers: {

                    Authorization: `Basic ${auth}`,

                    "Content-Type": "application/x-www-form-urlencoded"

                }

            }

        );

        return response.data.access_token;

    }

    async createOrder(

    orderId:string,

    amount:number,

    returnUrl:string,

    cancelUrl:string

){

    const token = await this.getAccessToken();

    const response = await axios.post(

        `${this.baseUrl}/v2/checkout/orders`,

        {

            intent:"CAPTURE",

            purchase_units:[

                {

                    reference_id:orderId,

                    amount:{

                        currency_code:"USD",

                        value:amount.toFixed(2)

                    }

                }

            ],

            application_context:{

                return_url:returnUrl,

                cancel_url:cancelUrl,

                user_action:"PAY_NOW",

                shipping_preference:"NO_SHIPPING"

            }

        },

        {

            headers:{

                Authorization:`Bearer ${token}`,

                "Content-Type":"application/json"

            }

        }

    );

    return response.data;

}

getApproveLink(order:any){

    return order.links.find(

        (link:any)=>link.rel==="approve"

    )?.href;

}

async verifyWebhookSignature(

    headers:any,

    body:any

){

    const token = await this.getAccessToken();

    const response = await axios.post(

        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,

        {

            transmission_id:

headers["paypal-transmission-id"],

            transmission_time:

headers["paypal-transmission-time"],

            cert_url:

headers["paypal-cert-url"],

            auth_algo:

headers["paypal-auth-algo"],

            transmission_sig:

headers["paypal-transmission-sig"],

            webhook_id:

process.env.PAYPAL_WEBHOOK_ID,

            webhook_event:body

        },

        {

            headers:{

                Authorization:`Bearer ${token}`

            }

        }

    );

    return response.data.verification_status==="SUCCESS";

}

}

export default new PaypalService();