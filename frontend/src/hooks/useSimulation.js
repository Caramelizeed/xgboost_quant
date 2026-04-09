import { useState, useCallback } from 'react';
import { runSimulation } from '../services/api';

export default function useSimulation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await runSimulation(params);
      setResult(data);
      return data;
    } catch (e) {
      setError(e.message || 'Unable to run simulation');
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, run };
}
