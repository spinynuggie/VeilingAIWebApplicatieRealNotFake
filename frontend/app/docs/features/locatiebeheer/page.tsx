import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = `# LocatieBeheer features

Includes LocatieFormCard and LocatieListCard used in admin flows. These features interact with backend endpoints; docs show usage and expected props.
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
