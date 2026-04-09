import React from 'react';

export function RunButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center w-full rounded border border-amber px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] text-black bg-amber transition hover:bg-[#f2a63d] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? 'RUNNING...' : 'RUN SIMULATION'}
    </button>
  );
}
