import React from 'react';

export function InputPanel({ title = 'Simulation Inputs', values, onChange, onSubmit, hideSubmit = false, submitLabel = 'Run Simulation', disabled = false }) {
  const handleChange = (key) => (event) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value;
    onChange({
      ...values,
      [key]: value,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_0_50px_rgba(0,0,0,0.12)]">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <label className="mb-3 block text-sm text-muted">
        Asset
        <input
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-white outline-none"
          value={values.asset}
          onChange={handleChange('asset')}
          type="text"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-muted">
          Start Date
          <input
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-white outline-none"
            value={values.start_date}
            onChange={handleChange('start_date')}
            type="date"
          />
        </label>
        <label className="block text-sm text-muted">
          End Date
          <input
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-white outline-none"
            value={values.end_date}
            onChange={handleChange('end_date')}
            type="date"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="block text-sm text-muted">
          Long Threshold
          <input
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-white outline-none"
            value={values.threshold_long}
            onChange={handleChange('threshold_long')}
            type="number"
            step="0.01"
            min="0"
            max="1"
          />
        </label>
        <label className="block text-sm text-muted">
          Short Threshold
          <input
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-white outline-none"
            value={values.threshold_short}
            onChange={handleChange('threshold_short')}
            type="number"
            step="0.01"
            min="0"
            max="1"
          />
        </label>
        <label className="block text-sm text-muted">
          Risk / Trade
          <input
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-white outline-none"
            value={values.risk_per_trade}
            onChange={handleChange('risk_per_trade')}
            type="number"
            step="0.005"
            min="0"
            max="0.5"
          />
        </label>
      </div>

      {!hideSubmit && (
        <button
          className="mt-6 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onSubmit}
          disabled={disabled}
          type="button"
        >
          {submitLabel}
        </button>
      )}
    </div>
  );
}
