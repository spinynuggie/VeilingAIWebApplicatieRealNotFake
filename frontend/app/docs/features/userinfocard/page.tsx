import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import UserInfoExample from './UserInfoExample';

const md = `# UserInfoCard

Displays user profile information in a simple card. Provide a 
\`User\` object with typical profile fields.
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
          <UserInfoExample />
        </div>
      </div>
    </div>
  );
}
