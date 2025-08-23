const ms = (v) => (v == null ? null : Number(v.toFixed(2)));

function push(arr, v) { if (v != null && !Number.isNaN(v)) arr.push(v); }

const fmtMs = (x) => (x == null ? "-" : `${x.toFixed(2)} ms`);

function summarize(samples) {
  if (!samples.length) return null;
  const a = samples.slice().sort((x, y) => x - y);
  const n = a.length, sum = a.reduce((s, v) => s + v, 0);
  const mean = sum / n;
  const q = (p) => {
    const idx = (n - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx), h = idx - lo;
    return lo === hi ? a[lo] : a[lo] + (a[hi] - a[lo]) * h;
  };
  return { count: n, min: a[0], p50: q(0.5), p90: q(0.9), p99: q(0.99), max: a[n - 1], mean };
}

function printMetrics(name, samples) {
  s = summarize(samples);
  if (!s) { console.log(`${name.padEnd(10)}: (no samples)`); return; }
  console.log(`${name.padEnd(10)}: min=${fmtMs(s.min)}  p50=${fmtMs(s.p50)}  p90=${fmtMs(s.p90)}  p99=${fmtMs(s.p99)}  max=${fmtMs(s.max)}  mean=${fmtMs(s.mean)}  n=${s.count}`);
}

// New function for beautiful metrics display
function printBeautifulMetrics(metrics) {
  console.log('\n' + '='.repeat(80));
  console.log('PERFORMANCE TEST RESULTS');
  console.log('='.repeat(80));
  
  // Summary section
  console.log('\nSUMMARY');
  console.log('─'.repeat(40));
  console.log(`Test Duration: ${metrics.duration.toFixed(2)}s`);
  console.log(`Total Requests: ${metrics.totalCount.toLocaleString()}`);
  console.log(`Successful: ${metrics.successCount.toLocaleString()} (${((metrics.successCount / metrics.totalCount) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${metrics.failureCount.toLocaleString()} (${((metrics.failureCount / metrics.totalCount) * 100).toFixed(1)}%)`);
  console.log(`Requests/sec: ${(metrics.totalCount / metrics.duration).toFixed(1)}`);
  
  // Detailed metrics table
  console.log('\nDETAILED METRICS\n');
  
  const metricNames = [
    { key: 'responseTimes', name: 'Response Time' },
    { key: 'dnsLookup', name: 'DNS Lookup' },
    { key: 'tcpConnection', name: 'TCP Connection' },
    { key: 'tlsHanshake', name: 'TLS Handshake' },
    { key: 'ttfb', name: 'Time to First Byte' }
  ];
  
  // Print table header
  console.log(`${'Metric'.padEnd(18)} │ ${'Min'.padEnd(12)} │ ${'P50'.padEnd(12)} │ ${'P90'.padEnd(12)} │ ${'P99'.padEnd(12)} │ ${'Max'.padEnd(12)} │ ${'Mean'.padEnd(12)} │ ${'Count'.padEnd(8)}`);
  
  // Print each metric
  metricNames.forEach(({ key, name }) => {
    const samples = metrics[key];
    const s = summarize(samples);
    if (s && s.count > 0) {
      const row = [
        name.padEnd(18),
        fmtMs(s.min).padEnd(12),
        fmtMs(s.p50).padEnd(12),
        fmtMs(s.p90).padEnd(12),
        fmtMs(s.p99).padEnd(12),
        fmtMs(s.max).padEnd(12),
        fmtMs(s.mean).padEnd(12),
        s.count.toString().padEnd(8)
      ];
      console.log(row.join(' │ '));
    }
  });
}

module.exports = {ms, push, printMetrics, printBeautifulMetrics}; 