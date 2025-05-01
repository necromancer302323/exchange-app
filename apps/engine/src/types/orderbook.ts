interface Order {
    price: number;
    quantity: number;
    orderId: string;
    userId:string
}

interface Bid extends Order {
    side: 'bid';
}

interface Ask extends Order {
    side: 'ask';
}

export interface Orderbook {
    market:string,
    bids: Bid[];
    asks: Ask[];
}