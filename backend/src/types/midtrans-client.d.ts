declare module "midtrans-client" {
  export interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface TransactionParam {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    item_details: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    customer_details: {
      first_name: string;
      email: string;
    };
  }

  export interface TransactionResult {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: SnapOptions);
    createTransaction(param: TransactionParam): Promise<TransactionResult>;
    transaction: {
      notification(payload: any): Promise<any>;
    };
  }

  const midtransClient: {
    Snap: typeof Snap;
  };

  export default midtransClient;
}
