import React from 'react';

export function InputPanel({ values, onChange, onSubmit }) {
  return (
    <div>
      <h3>Simulation Inputs</h3>
      <button onClick={onSubmit}>Run Simulation</button>
    </div>
  );
}
