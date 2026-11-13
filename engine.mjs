// Integer-price, visible-only teaching book. Incoming remainders are not rested.
export function match(orders, incoming, policy = 'price-time') {
  if (!['buy', 'sell'].includes(incoming.side) || !['price-time', 'time-only'].includes(policy)) throw Error('Invalid side or policy');
  if (!Number.isSafeInteger(incoming.limit) || incoming.limit <= 0 || !Number.isSafeInteger(incoming.qty) || incoming.qty <= 0) throw Error('Use positive integer prices and quantities');
  const ids = new Set(), seqs = new Set();
  const book = orders.map(o => {
    if (ids.has(o.id) || seqs.has(o.seq) || !o.id || !Number.isSafeInteger(o.seq) || o.seq < 1 || !Number.isSafeInteger(o.price) || o.price < 1 || !Number.isSafeInteger(o.qty) || o.qty < 1) throw Error('Invalid resting order or duplicate ID/acceptance sequence');
    ids.add(o.id); seqs.add(o.seq); return {...o};
  });
  const eligible = o => incoming.side === 'buy' ? o.price <= incoming.limit : o.price >= incoming.limit;
  const direction = incoming.side === 'buy' ? 1 : -1;
  const queue = book.filter(eligible).sort((a,b) => policy === 'price-time' ? direction * (a.price-b.price) || a.seq-b.seq : a.seq-b.seq);
  let remaining = incoming.qty;
  const fills = [];
  for (const order of queue) {
    if (!remaining) break;
    const qty = Math.min(remaining, order.qty);
    fills.push({id:order.id, price:order.price, qty, seq:order.seq});
    order.qty -= qty; remaining -= qty;
  }
  return {fills, remaining, book, queue:queue.map(o=>o.id)};
}
