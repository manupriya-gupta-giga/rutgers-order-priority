# Order priority lab

An interactive companion to Manupriya Gupta's Rutgers QFC workshop. All examples are synthetic.

**[Open the interactive demo](https://manupriya-gupta-giga.github.io/rutgers-order-priority/)**

## Use it during a talk

1. **Better price wins:** A arrives first at 100, B arrives second at 99. An incoming buy takes B first.
2. **Same price, earlier wins:** all prices are 100. A wins because its acceptance sequence is earliest.
3. **Sweep + partial fill:** buy 10 with a limit of 101. Predict B4@99, A5@100, C1@100. C has 2 remaining.
4. Switch to an incoming sell. Higher bids are better, so B101 precedes A100.
5. Expand the intentionally broken time-only policy. It is a counterexample, not an alternative valid implementation of this book's rules.

These are two levels of **one ordering rule**, not competing policies: compare price first; use time to break a price tie. Time here is the venue's acceptance sequence, not an unsynchronized client timestamp.

## Run locally

No dependencies, API keys, backend or market data. Download/clone the repository, then:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. The webpage is self-contained and also works by opening index.html directly. A local server is optional.

Run the matching-engine checks with Node.js 18+:

```sh
node test.mjs
```

## Small starter engine

`engine.mjs` exports `match(orders, incoming, policy)`. Resting orders have `id`, `seq`, `price`, and `qty`. The incoming order has `side`, `limit`, and `qty`. Results contain fills, unfilled incoming quantity, and the remaining resting book. Inputs are not mutated. The page embeds the same engine inline so there is no runtime module fetch. The checks use engine.mjs.

## Audience challenges

- Add cancellation by ID. Cancel only unfilled quantity. Check conservation before and after cancellation.
- Add a late-arriving event and a separate reference replay ordered by a declared event ordering key. Do not confuse event-time replay with venue queue priority.
- Generate random small books. Assert no negative quantity, no executions outside the incoming limit, and quantity conservation.
- Keep a minimal input where time-only disagrees with price-time. Why does a single equal-price example fail to catch that bug?
- Add order replacement. Declare which changes lose priority before writing tests; actual exchange rules vary.

## Declared teaching assumptions

Visible-only continuous book; integer price/quantity units; price then FIFO at a price; execution at the resting order's price. Sufficient funds/inventory assumed. No fees, hidden/display priority, auctions, self-trade prevention, order amendments or persistent incoming remainders. An unfilled incoming remainder is reported but not inserted into the book. This is a teaching example, not production exchange software.

Example primary reference: [Coinbase Derivatives order matching](https://help.coinbase.com/en/derivatives/features/order-matching). This demo declares its own simplified rules; it does not reproduce every rule of that venue or imply all venues use identical priority.
