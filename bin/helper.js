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

module.exports = {ms, push, printMetrics}; 