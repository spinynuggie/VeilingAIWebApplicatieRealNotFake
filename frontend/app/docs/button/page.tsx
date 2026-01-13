import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ButtonExample from './ButtonExample';

const md = `# Button

Simple wrapper around MUI Button used across the app. Use the \
\`children\` prop to provide the label.

## Example
Simple contained button rendered on the right.
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
          <ButtonExample />
        </div>
      </div>
    </div>
  );
}
