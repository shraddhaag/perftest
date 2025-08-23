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

The CLI accepts 3 arguments: 

1. `endpoint` - required, the GET endpoint to get performance metrics for. 
2. `duration` - interval for which the CLI will performnce test the given endppint. Default value: 11s. 
3. `concurrency` - number of requests to issue concurrently. Default value: 100. 

Sample usage: 
```
perftest --endpoint <URL> --duration <DURATION> --concurrency <NUM_OF_WORK>
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
Test Duration: 12.52s
Total Requests: 1,941
Successful: 1,940 (99.9%)
Failed: 1 (0.1%)
Requests/sec: 155.1

DETAILED METRICS

Metric             │ Min          │ P50          │ P90          │ P99          │ Max          │ Mean         │ Count
Response Time      │ 0.04 ms      │ 0.46 ms      │ 14.24 ms     │ 400.93 ms    │ 4617.63 ms   │ 19.91 ms     │ 1941
DNS Lookup         │ 3234.05 ms   │ 3234.05 ms   │ 3234.05 ms   │ 3234.05 ms   │ 3234.05 ms   │ 3234.05 ms   │ 1
TCP Connection     │ 1007.52 ms   │ 1007.52 ms   │ 1007.52 ms   │ 1007.52 ms   │ 1007.52 ms   │ 1007.52 ms   │ 1
TLS Handshake      │ 255.82 ms    │ 255.82 ms    │ 255.82 ms    │ 255.82 ms    │ 255.82 ms    │ 255.82 ms    │ 1
Time to First Byte │ 0.20 ms      │ 1.33 ms      │ 6.03 ms      │ 102.79 ms    │ 119.66 ms    │ 9.28 ms      │ 16
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

