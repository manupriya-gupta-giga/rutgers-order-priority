import assert from 'node:assert/strict';
import {match} from './engine.mjs';
const orders=[{id:'A',seq:1,price:100,qty:5},{id:'B',seq:2,price:99,qty:4},{id:'C',seq:3,price:100,qty:3}];
const buy={side:'buy',limit:101,qty:10};
const r=match(orders,buy);
assert.deepEqual(r.fills.map(f=>[f.id,f.qty,f.price]),[['B',4,99],['A',5,100],['C',1,100]]);
assert.equal(r.book.find(o=>o.id==='C').qty,2);
assert.equal(orders[0].qty,5,'input not mutated');
assert.equal(match(orders,{...buy,limit:98}).fills.length,0);
assert.equal(match(orders,{...buy,limit:99}).remaining,6);
assert.deepEqual(match(orders.map(o=>({...o,price:100})),buy).fills.map(f=>f.id),['A','B','C']);
assert.equal(match(orders,buy,'time-only').fills[0].id,'A');
const bids=orders.map(o=>({...o,price:o.id==='B'?101:100}));
assert.equal(match(bids,{side:'sell',limit:99,qty:2}).fills[0].id,'B');
assert.equal(match(bids,{side:'sell',limit:102,qty:2}).fills.length,0);
assert.equal(match(orders,{...buy,qty:20}).remaining,8);
assert.throws(()=>match(orders,{...buy,qty:-1}));
assert.throws(()=>match(orders,{...buy,qty:1.5}));
assert.throws(()=>match([orders[0],orders[0]],buy));
for(let qty=1;qty<=20;qty++)for(let limit=98;limit<=102;limit++){
 const x=match(orders,{...buy,qty,limit});
 assert.equal(x.fills.reduce((s,f)=>s+f.qty,0)+x.remaining,qty);
 assert(x.book.every(o=>o.qty>=0));
 for(const o of orders)assert.equal(x.book.find(b=>b.id===o.id).qty+x.fills.filter(f=>f.id===o.id).reduce((s,f)=>s+f.qty,0),o.qty);
 assert(x.fills.every(f=>f.price<=limit));
}
console.log('Passed: price priority, FIFO ties, both sides, partial fills, limits, validation, conservation (100 input combinations).');
