## Perftest 

Perftest is a CLI tool used to load test a given endpoint. This is an experimental project. 

A few things to note: 

1. Currently only GET requests are supported. 
2. The following metrics are reported: 
    - Total Requests Executed. 
    - Successful Request Count. 
    - Failed Request Count. 
    - Response Time. 
    - DNS Lookup
    - TCP Connection
    - TLS Hanshake
    - TTFB

### Usage

The CLI accepts the following arguments:

| Argument | Description | Default | Required |
|----------|-------------|---------|----------|
| `--endpoint` | Target URL to load test | - | Yes |
| `--duration` | Test duration in seconds | 11 | No |
| `--concurrency` | Number of concurrent workers | 100 | No |
| `--connection-reuse` | Keep connections alive for reuse | true | No |

Sample usage: 
```bash
# Basic usage
perftest --endpoint https://httpbin.org/get

# With custom duration and concurrency
perftest --endpoint https://httpbin.org/get --duration 30 --concurrency 50

# With connection reuse disabled
perftest --endpoint https://httpbin.org/get --duration 60 --concurrency 100 --connection-reuse false
```

Sample output: 
```
➜  perftest git:(main) ✗ perftest --endpoint https://httpbin.org/get
Duration not specified. Falling back to default value of 11s.
Concurrency not specified. Falling back to default value of 100.

================================================================================
PERFORMANCE TEST RESULTS
================================================================================

SUMMARY
────────────────────────────────────────
Test Duration: 12.87s
Total Requests: 2,271
Successful: 2,265 (99.7%)
Failed: 6 (0.3%)
Requests/sec: 176.5

DETAILED METRICS

Metric             │ Min          │ P50          │ P90          │ P99          │ Max          │ Mean         │ Count
Response Time      │ 201.32 ms    │ 230.15 ms    │ 990.19 ms    │ 3206.40 ms   │ 4462.20 ms   │ 497.12 ms    │ 2271
DNS Lookup         │ 52.87 ms     │ 71.03 ms     │ 77.17 ms     │ 77.78 ms     │ 77.83 ms     │ 68.91 ms     │ 100
TCP Connection     │ 214.59 ms    │ 1439.93 ms   │ 1496.89 ms   │ 1516.83 ms   │ 1522.37 ms   │ 1379.60 ms   │ 100
TLS Handshake      │ 545.11 ms    │ 1014.21 ms   │ 1399.13 ms   │ 1429.17 ms   │ 1439.52 ms   │ 1076.58 ms   │ 100
Time to First Byte │ 211.69 ms    │ 230.36 ms    │ 749.34 ms    │ 1417.54 ms   │ 1541.59 ms   │ 395.83 ms    │ 100
```

### Setup

#### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

#### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/shraddhaag/perftest.git
   cd perftest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify installation:
   ```bash
   node bin/index.js --endpoint https://httpbin.org/get --duration 5 --concurrency 5
   ```

4. Make CLI globally available: 
    ```bash
    npm link
    ```
    After linking, you can use `perftest` command directly:
    ```bash
    perftest --endpoint https://httpbin.org/get 
    ``` 

