import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = `# AuthProvider

Provides authentication context to the app via \
\`useAuth\` hook. This provider will call the backend to fetch the current user on mount, so avoid mounting it in docs unless you mock the backend.

Usage:
import { AuthProvider } from '@/components/AuthProvider';

<AuthProvider>
  <YourApp />
</AuthProvider>
`;

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </div>
    </div>
  );
}
