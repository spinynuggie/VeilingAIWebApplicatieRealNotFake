import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FloraLogoExample from './FloraLogoExample';

const md = `# FloraLogo

Small helper that renders the project's SVG logo at three sizes.
`;

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
        <div style={{ width: 320 }}>
          <h3>Live preview</h3>
          <FloraLogoExample />
        </div>
      </div>
    </div>
  );
}
