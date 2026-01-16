# Security Attack Tests

This document contains various attack scenarios to test your app's security.

**IMPORTANT**: Run these tests against your own deployment only. Never test attacks on systems you don't own.

## Prerequisites

```bash
# Replace with your actual deployment URL
export API_URL="https://your-deployment.vercel.app"
```

## Test 1: Rate Limiting Attack

**Attack**: Spam the API with multiple requests to bypass limits.

```bash
# Try to submit 10 results in rapid succession (should block after 5)
for i in {1..10}; do
  echo "Request $i:"
  curl -X POST "$API_URL/api/results" \
    -H "Content-Type: application/json" \
    -d '{
      "id": "test-'$i'",
      "timestamp": "2024-01-01T00:00:00Z",
      "isp": "Test ISP",
      "planName": "100 Mbps",
      "promisedSpeed": 100,
      "monthlyPrice": 1000,
      "downloadSpeed": 50,
      "uploadSpeed": 25,
      "latency": 20,
      "jitter": 5,
      "packetLoss": 0,
      "serviceScore": 70,
      "grade": "C",
      "moneyOwed": 500,
      "deliveryRatio": 0.5
    }' \
    -w "\nHTTP Status: %{http_code}\n\n"
  sleep 0.5
done
```

**Expected Result**:
- First 5 requests: ✅ 200 OK
- Requests 6-10: ❌ 429 Too Many Requests

---

## Test 2: Fake/Invalid Data Injection

### 2a. Invalid Speed (Negative Value)

```bash
curl -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "attack-negative",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "Evil ISP",
    "planName": "100 Mbps",
    "promisedSpeed": 100,
    "monthlyPrice": 1000,
    "downloadSpeed": -999,
    "uploadSpeed": 25,
    "latency": 20,
    "jitter": 5,
    "packetLoss": 0,
    "serviceScore": 70,
    "grade": "C",
    "moneyOwed": 500,
    "deliveryRatio": 0.5
  }'
```

**Expected Result**: ❌ 400 Bad Request - "Invalid downloadSpeed"

### 2b. Unrealistic Speed (1 Million Mbps)

```bash
curl -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "attack-unrealistic",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "Evil ISP",
    "planName": "100 Mbps",
    "promisedSpeed": 100,
    "monthlyPrice": 1000,
    "downloadSpeed": 1000000,
    "uploadSpeed": 25,
    "latency": 20,
    "jitter": 5,
    "packetLoss": 0,
    "serviceScore": 70,
    "grade": "C",
    "moneyOwed": 500,
    "deliveryRatio": 0.5
  }'
```

**Expected Result**: ❌ 400 Bad Request - "Speed value unrealistic"

### 2c. Invalid Grade

```bash
curl -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "attack-grade",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "Evil ISP",
    "planName": "100 Mbps",
    "promisedSpeed": 100,
    "monthlyPrice": 1000,
    "downloadSpeed": 50,
    "uploadSpeed": 25,
    "latency": 20,
    "jitter": 5,
    "packetLoss": 0,
    "serviceScore": 70,
    "grade": "Z",
    "moneyOwed": 500,
    "deliveryRatio": 0.5
  }'
```

**Expected Result**: ❌ 400 Bad Request - "Invalid or missing grade"

### 2d. Missing Required Fields

```bash
curl -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "attack-missing"
  }'
```

**Expected Result**: ❌ 400 Bad Request - "Invalid or missing timestamp"

### 2e. Wrong Data Types (String instead of Number)

```bash
curl -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "attack-types",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "Evil ISP",
    "planName": "100 Mbps",
    "promisedSpeed": "HACKED",
    "monthlyPrice": 1000,
    "downloadSpeed": 50,
    "uploadSpeed": 25,
    "latency": 20,
    "jitter": 5,
    "packetLoss": 0,
    "serviceScore": 70,
    "grade": "C",
    "moneyOwed": 500,
    "deliveryRatio": 0.5
  }'
```

**Expected Result**: ❌ 400 Bad Request - "Invalid promisedSpeed"

---

## Test 3: Oversized Payload Attack

### 3a. Giant Upload

```bash
# Try to upload 10MB (max is 5MB)
dd if=/dev/zero bs=1M count=10 2>/dev/null | curl -X POST "$API_URL/api/speed-test/upload" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @- \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Result**: ❌ 413 Payload Too Large

### 3b. Giant Result Payload

```bash
# Create a 2MB string (max is 1MB)
HUGE_STRING=$(python3 -c "print('A' * 2000000)")

curl -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "attack-huge",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "'"$HUGE_STRING"'",
    "planName": "100 Mbps",
    "promisedSpeed": 100,
    "monthlyPrice": 1000,
    "downloadSpeed": 50,
    "uploadSpeed": 25,
    "latency": 20,
    "jitter": 5,
    "packetLoss": 0,
    "serviceScore": 70,
    "grade": "C",
    "moneyOwed": 500,
    "deliveryRatio": 0.5
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Result**: ❌ 413 Request Too Large

### 3c. Unreasonable Download Size Request

```bash
curl "$API_URL/api/speed-test/download?size=999999999" \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Result**: ✅ 200 OK but capped at 2MB (not 999MB)

---

## Test 4: Redis Key Injection Attack

**Attack**: Try to inject special characters to break Redis key structure.

```bash
curl -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "attack-redis",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "Evil:ISP:*:injection",
    "planName": "100 Mbps",
    "promisedSpeed": 100,
    "monthlyPrice": 1000,
    "downloadSpeed": 50,
    "uploadSpeed": 25,
    "latency": 20,
    "jitter": 5,
    "packetLoss": 0,
    "serviceScore": 70,
    "grade": "C",
    "moneyOwed": 500,
    "deliveryRatio": 0.5,
    "city": "leaderboard:*:Mumbai"
  }'
```

**Expected Result**:
- ✅ 200 OK (request accepted)
- BUT: colons and wildcards sanitized to underscores in Redis
- Check: leaderboard key should be `leaderboard:leaderboard___Mumbai:Evil_ISP___injection`

---

## Test 5: XSS Injection Attack

**Attack**: Try to inject JavaScript via ISP name.

```bash
curl -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "attack-xss",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "<script>alert(\"HACKED\")</script>",
    "planName": "100 Mbps<img src=x onerror=alert(1)>",
    "promisedSpeed": 100,
    "monthlyPrice": 1000,
    "downloadSpeed": 50,
    "uploadSpeed": 25,
    "latency": 20,
    "jitter": 5,
    "packetLoss": 0,
    "serviceScore": 70,
    "grade": "C",
    "moneyOwed": 500,
    "deliveryRatio": 0.5
  }'
```

**Expected Result**:
- ✅ 200 OK (request accepted)
- BUT: angle brackets `<>` removed during sanitization
- Stored as: `scriptalert("HACKED")/script`

---

## Test 6: SQL/NoSQL Injection (Not Applicable)

**Attack**: Try SQL injection patterns.

```bash
curl -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "attack-sql",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "Evil ISP\"; DROP TABLE results; --",
    "planName": "100 Mbps",
    "promisedSpeed": 100,
    "monthlyPrice": 1000,
    "downloadSpeed": 50,
    "uploadSpeed": 25,
    "latency": 20,
    "jitter": 5,
    "packetLoss": 0,
    "serviceScore": 70,
    "grade": "C",
    "moneyOwed": 500,
    "deliveryRatio": 0.5
  }'
```

**Expected Result**:
- ✅ 200 OK (request accepted)
- No SQL to inject (using Redis/KV store, not SQL database)
- String stored safely in Redis

---

## Test 7: Parameter Tampering

### 7a. Invalid Number Values

```bash
curl "$API_URL/api/speed-test/download?size=NaN"
curl "$API_URL/api/speed-test/download?size=Infinity"
curl "$API_URL/api/speed-test/download?size=-100"
```

**Expected Result**: ❌ 400 Bad Request for all

### 7b. Missing Parameters

```bash
curl "$API_URL/api/speed-test/download"
```

**Expected Result**: ✅ 200 OK (uses default 1MB)

---

## Test 8: CORS Bypass Attack

**Attack**: Try to call API from a different origin.

Create `attack.html`:
```html
<!DOCTYPE html>
<html>
<body>
<script>
fetch('YOUR_API_URL/api/results', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'cors-attack',
    timestamp: '2024-01-01T00:00:00Z',
    isp: 'Attacker ISP',
    planName: '100 Mbps',
    promisedSpeed: 100,
    monthlyPrice: 1000,
    downloadSpeed: 50,
    uploadSpeed: 25,
    latency: 20,
    jitter: 5,
    packetLoss: 0,
    serviceScore: 70,
    grade: 'C',
    moneyOwed: 500,
    deliveryRatio: 0.5
  })
})
.then(r => console.log('Success:', r))
.catch(e => console.log('Blocked:', e));
</script>
</body>
</html>
```

**Expected Result**: ❌ CORS error in browser console - Request blocked

---

## Automated Test Script

Save this as `test-security.sh`:

```bash
#!/bin/bash

API_URL="${1:-http://localhost:3000}"

echo "🔒 Security Test Suite for Pulse App"
echo "Testing: $API_URL"
echo ""

# Test 1: Rate Limiting
echo "Test 1: Rate Limiting Attack"
echo "Sending 10 rapid requests..."
SUCCESS=0
BLOCKED=0
for i in {1..10}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
    -H "Content-Type: application/json" \
    -d '{"id":"test-'$i'","timestamp":"2024-01-01T00:00:00Z","isp":"Test","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":50,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"C","moneyOwed":500,"deliveryRatio":0.5}')

  if [ "$STATUS" = "200" ]; then
    ((SUCCESS++))
  elif [ "$STATUS" = "429" ]; then
    ((BLOCKED++))
  fi
  sleep 0.5
done

if [ $BLOCKED -gt 0 ]; then
  echo "✅ PASS: Rate limiting working ($SUCCESS successful, $BLOCKED blocked)"
else
  echo "❌ FAIL: Rate limiting not working (all $SUCCESS requests succeeded)"
fi
echo ""

# Test 2: Negative Value
echo "Test 2: Negative Speed Value"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"neg","timestamp":"2024-01-01T00:00:00Z","isp":"Test","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":-999,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"C","moneyOwed":500,"deliveryRatio":0.5}')

if [ "$STATUS" = "400" ]; then
  echo "✅ PASS: Rejected negative value"
else
  echo "❌ FAIL: Accepted negative value (status: $STATUS)"
fi
echo ""

# Test 3: Invalid Grade
echo "Test 3: Invalid Grade"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"grade","timestamp":"2024-01-01T00:00:00Z","isp":"Test","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":50,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"Z","moneyOwed":500,"deliveryRatio":0.5}')

if [ "$STATUS" = "400" ]; then
  echo "✅ PASS: Rejected invalid grade"
else
  echo "❌ FAIL: Accepted invalid grade (status: $STATUS)"
fi
echo ""

# Test 4: Unrealistic Speed
echo "Test 4: Unrealistic Speed (1 Million Mbps)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"unreal","timestamp":"2024-01-01T00:00:00Z","isp":"Test","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":1000000,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"C","moneyOwed":500,"deliveryRatio":0.5}')

if [ "$STATUS" = "400" ]; then
  echo "✅ PASS: Rejected unrealistic speed"
else
  echo "❌ FAIL: Accepted unrealistic speed (status: $STATUS)"
fi
echo ""

# Test 5: Oversized Download Request
echo "Test 5: Download Size Limit"
RESPONSE_SIZE=$(curl -s "$API_URL/api/speed-test/download?size=999999999" | wc -c)
if [ $RESPONSE_SIZE -le 2097152 ]; then  # 2MB
  echo "✅ PASS: Download capped at reasonable size ($RESPONSE_SIZE bytes)"
else
  echo "❌ FAIL: Download exceeded limit ($RESPONSE_SIZE bytes)"
fi
echo ""

echo "🏁 Security tests complete!"
```

Make it executable and run:
```bash
chmod +x test-security.sh
./test-security.sh https://your-deployment.vercel.app
```

---

## Expected Summary

After running all tests:

| Test | Expected Result |
|------|----------------|
| Rate limiting | ✅ Blocks after 5 requests |
| Negative values | ✅ Rejected with 400 |
| Unrealistic values | ✅ Rejected with 400 |
| Invalid grade | ✅ Rejected with 400 |
| Missing fields | ✅ Rejected with 400 |
| Wrong types | ✅ Rejected with 400 |
| Oversized upload | ✅ Rejected with 413 |
| Oversized result | ✅ Rejected with 413 |
| Redis key injection | ✅ Sanitized |
| XSS injection | ✅ Angle brackets removed |
| Invalid parameters | ✅ Rejected with 400 |
| CORS bypass | ✅ Blocked by browser |

**Your app is secure! 🔒**
