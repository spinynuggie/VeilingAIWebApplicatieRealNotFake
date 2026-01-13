import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VeilingKlokExample from './VeilingKlokExample';

const md = `# VeilingKlok component

The \`VeilingKlok\` component shows a circular auction clock with current price, progress and simple bidding controls.

## Props (summary)

- startPrice: number — starting price of the auction
- endPrice: number — ending price of the auction
- duration: number — duration in seconds
- productName?: string — optional product name displayed above the clock
- livePrice?: number — current live price
- remainingQuantity?: number — optional remaining stock

## Example

Below is a live example of the component rendered inside the Next.js docs page.


type Note: This demo uses the real component inside a client wrapper so interactive behavior (bidding) works.
`;

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
        <div style={{ width: 420 }}>
          <h3>Live preview</h3>
          <VeilingKlokExample />
        </div>
      </div>
    </div>
  );
}
