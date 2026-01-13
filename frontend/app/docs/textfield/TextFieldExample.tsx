"use client";

import React from 'react';
import { TextField } from '@/components/TextField';

export default function TextFieldExample() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <TextField label="Voorbeeld" value={""} onChange={() => {}} />
    </div>
  );
}
