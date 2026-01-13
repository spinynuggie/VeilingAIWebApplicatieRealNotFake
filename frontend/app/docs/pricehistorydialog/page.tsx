import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = `# PriceHistoryDialog

Dialog component that fetches and shows price history. For docs we do not open it automatically to avoid backend requests; see usage below.

Usage example:
import { PriceHistoryDialog } from '@/components/PriceHistoryDialog';

<PriceHistoryDialog open={true} onClose={() => {}} productId={123} verkoperId={45} productNaam="Bloem" />
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
