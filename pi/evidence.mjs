export function evidenceRecord({ source, claim, observedAt = new Date().toISOString(), confidence = 'unknown', limitations = [] }) {
  return Object.freeze({ source, claim, observedAt, confidence, limitations });
}

export function classifyEvidence(records = []) {
  return records.reduce((acc, record) => {
    const key = ['verified', 'probable', 'speculative', 'unknown'].includes(record.confidence) ? record.confidence : 'unknown';
    acc[key].push(record);
    return acc;
  }, { verified: [], probable: [], speculative: [], unknown: [] });
}
