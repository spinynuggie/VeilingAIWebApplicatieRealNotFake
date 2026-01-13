import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SearchBarExample from './SearchBarExample';

const md = `# SearchBar

Autocomplete search component that can operate in redirect or callback mode. In docs we provide a controlled searchControl so it renders without hitting the network.
`;

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
        <div style={{ width: 420 }}>
          <h3>Live preview</h3>
          <SearchBarExample />
        </div>
      </div>
    </div>
  );
}
