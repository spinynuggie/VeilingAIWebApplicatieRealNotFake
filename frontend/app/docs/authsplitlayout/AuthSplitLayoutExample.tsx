"use client";

import React from 'react';
import AuthSplitLayout from '@/components/AuthSplitLayout';

export default function AuthSplitLayoutExample() {
  return (
    <AuthSplitLayout>
      <div style={{ padding: 16 }}>
        <h4>Login kaart</h4>
        <p>Dit is een voorbeeld content in de kaart.</p>
      </div>
    </AuthSplitLayout>
  );
}
