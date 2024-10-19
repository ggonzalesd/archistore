/// <reference path="../.astro/types.d.ts" />

interface IPurchaseUnit {
  reference_id?: string;
  custom_id?: string;
  amount: {
    currency_code: 'USD';
    value: string;
  };
}

interface IPaypalCreate {
  intent: 'CAPTURE';
  purchase_units: Array<IPurchaseUnit>;
  application_context: {
    brand_name: string;
    landing_page: 'NO_PREFERENCE';
    user_action: 'PAY_NOW';
    return_url: string;
    cancel_url: string;
  };
}
declare namespace App {
  interface Locals {
    user?: {
      id: string;
      name?: string;
      photo?: string;
    };
    error?: {
      message: string;
      status: number;
      encrypted: boolean;
    };
  }
}
