import { useState, useCallback } from 'react';
import { runSimulation, getExplain } from '../services/api';

export default function useSimulation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await runSimulation(params);
      let explainData = null;
      try {
        explainData = await getExplain(params);
      } catch (ex) {
        console.warn('Explain fetch failed', ex);
      }
      const merged = { ...data, explain: explainData };
      setResult(merged);
      return merged;
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
