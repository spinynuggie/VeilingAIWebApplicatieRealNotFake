import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VeilingDisplayExample from './VeilingDisplayExample';

const md = `# VeilingDisplay

Component that renders a horizontal list of auctions (veiling cards). Clicking a card navigates to the auction.
`;

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
        <div style={{ width: 420 }}>
          <h3>Live preview</h3>
          <VeilingDisplayExample />
        </div>
      </div>
    </div>
  );
}
