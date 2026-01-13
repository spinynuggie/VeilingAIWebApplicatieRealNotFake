import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = `# CreateVeilingButton

Icon button used to navigate to the create auction flow. This component depends on internal hooks and navigation, so we only show usage here.

Usage example (TSX):

import { CreateVeilingButton } from '@/components/Buttons/CreateVeilingButton';

<CreateVeilingButton />
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
