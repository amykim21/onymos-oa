class Order {
    constructor(orderType, tickerSymbol, quantity, price) {
        this.orderType = orderType;
        this.tickerSymbol = tickerSymbol;
        this.quantity = quantity;
        this.price = price;
        this.next = null;
    }
}

class OrderBook {
    constructor() {
        this.buyHead = { value: null };
        this.sellHead = { value: null };
    }

    compareAndSwap(headRef, expected, newValue) {
        if (headRef.value === expected) {
            headRef.value = newValue;
            return true;
        }
        return false;
    }

    insertSorted(headRef, newOrder, compareFunction) {
        let prev = null;
        let current = headRef.value;

        while (current && compareFunction(newOrder, current) >= 0) {
            prev = current;
            current = current.next;
        }

        newOrder.next = current;

        if (prev) {
            prev.next = newOrder;
        } else {
            while (!this.compareAndSwap(headRef, current, newOrder)) {
                current = headRef.value;
                newOrder.next = current;
            }
        }
    }

    addOrder(type, ticker, quantity, price) {
        const newOrder = new Order(type, ticker, quantity, price);

        if (type === "Buy") {
            this.insertSorted(this.buyHead, newOrder, (a, b) => b.price - a.price);
        } else {
            this.insertSorted(this.sellHead, newOrder, (a, b) => a.price - b.price);
        }

        this.matchOrders();
    }

    matchOrders() {
        let buy = this.buyHead.value;
        let sell = this.sellHead.value;

        while (buy && sell && buy.price >= sell.price) {
            let matchedQuantity = Math.min(buy.quantity, sell.quantity);

            buy.quantity -= matchedQuantity;
            sell.quantity -= matchedQuantity;

            if (buy.quantity === 0) this.buyHead.value = buy.next;
            if (sell.quantity === 0) this.sellHead.value = sell.next;

            buy = this.buyHead.value;
            sell = this.sellHead.value;
        }
    }
}

const orderBook = new OrderBook();
const tickerSymbols = [...Array(1024).keys()]

function getRandomOrder() {
    const orderType = (Math.random() >= 0.5)? "Buy" : "Sell"
    const tickerSymbol = tickerSymbols[Math.floor(Math.random() * tickerSymbols.length)]
    const quantity = Math.floor(Math.random() * 100)
    const price = Math.floor(Math.random() * 1000)
    return new Order(orderType, tickerSymbol, quantity, price)
}

function test() {
    const numberOfOrders = 10
    for(let i = 0; i < numberOfOrders; i++) {
        const order = getRandomOrder()
        console.log(`${order.orderType} Order: ${order.quantity} shares of ${order.tickerSymbol} at $${order.price}`)
        orderBook.addOrder(order.orderType, order.tickerSymbol, order.quantity, order.price)
    }
    
}

test()