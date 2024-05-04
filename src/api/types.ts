export interface Order {
  contract: string;
  tokenId: number;
  offerer: string;
  endTime: number;
  signature: string;
  orderHash: string;
  salt: string;
  transferred?: boolean;
  allowed?: boolean;
  fee?: {
    recipient: string;
    amount: string;
  };
  fulfillmentCriteria: {
    coin?: {
      amount: string;
    };
    token: {
      amount: string;
      identifier: number[];
    };
  };
}

export interface Activity {
  _id: string;
  etype: string;
  contract: string;
  tokenId: number;
  offerer: string;
  fulfiller: string;
  fulfillment: {
    coin?: {
      amount: string;
    };
    token: {
      amount: string;
      identifier: number[];
    };
  };
  txHash: string;
  createdAt: number;
}

export interface Collection {
  name: string;
  symbol: string;
  image: string;
  contract: string;
  totalSupply: number;
  attributeSummary: Record<string, { attribute: string; options: Record<string, string> }>;
}

export interface Token {
  contract: string;
  tokenId: number;
  image?: string;
  attributes: Record<string, string>;
}

export interface Notification {
  activityId: string;
  contract: string;
  address: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
