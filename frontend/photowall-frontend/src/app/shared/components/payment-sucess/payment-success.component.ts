import { Component } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { PaymentService } from '../../../core/services/payments';

@Component({

selector:'app-payment-success',

templateUrl:'./payment-success.component.html',

})

export class PaymentSuccessComponent{

constructor(

private route:ActivatedRoute,

private paymentService:PaymentService

){}

payment:any;

ngOnInit(){

this.route.queryParams.subscribe(params=>{

const orderId=params['orderId'];

this.checkPayment(orderId);

});

}

checkPayment(orderId:string){

this.paymentService

.getPaymentStatus(orderId)

.subscribe({

next:(payment)=>{

this.payment=payment;

}

});

}

}
