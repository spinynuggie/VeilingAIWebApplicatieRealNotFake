import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProductCardExample from './ProductCardExample';

const md = `# ProductCard

Displays product information and price; can be used in 'display', 'auction' or 'create' modes.
`;

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
        <div style={{ width: 480 }}>
          <h3>Live preview</h3>
          <ProductCardExample />
        </div>
      </div>
    </div>
  );
}
