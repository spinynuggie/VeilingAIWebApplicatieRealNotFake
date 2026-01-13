import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AuthSplitLayoutExample from './AuthSplitLayoutExample';

const md = `# AuthSplitLayout

Layout used on authentication pages — split screen with image and a card.
`;

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
        <div style={{ width: 420 }}>
          <h3>Preview</h3>
          <AuthSplitLayoutExample />
        </div>
      </div>
    </div>
  );
}
