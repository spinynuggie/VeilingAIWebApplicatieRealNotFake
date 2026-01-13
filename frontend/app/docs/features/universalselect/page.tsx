import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = `# UniversalSelect

Utility Autocomplete used for selecting locations or specifications. This feature performs network requests when opened, so docs show usage only.

Usage example:
import UniversalSelect from '@/features/UniversalSelect';

<UniversalSelect mode="location" onSelect={(ids,names) => {}} />
`;

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </div>
    </div>
  );
}
