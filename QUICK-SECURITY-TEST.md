# Quick Security Test

Run these commands to verify your security is working.

**Replace `YOUR_URL` with your Vercel deployment URL.**

## 1. Test Rate Limiting ⏱️

This should block you after 5 attempts:

```bash
URL="YOUR_URL"

for i in {1..7}; do
  echo "Request $i:"
  curl -X POST "$URL/api/results" \
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
    }'
  echo ""
  sleep 1
done
```

**Expected:**
- Requests 1-5: Should succeed
- Requests 6-7: `{"error":"Too many requests..."}`

---

## 2. Test Fake Data Rejection 🚫

Try to submit negative speed:

```bash
curl -X POST "$URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "hack-attempt",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "Hacker ISP",
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

**Expected:** `{"error":"Invalid downloadSpeed"}`

---

## 3. Test Size Limits 📏

Try to request 1GB download:

```bash
curl "$URL/api/speed-test/download?size=1000000000"
```

**Expected:** Returns data but capped at 2MB (not 1GB)

Check the response size:
```bash
curl -s "$URL/api/speed-test/download?size=999999999" | wc -c
```

**Expected:** `2097152` (exactly 2MB)

---

## 4. Test XSS Protection 🛡️

Try to inject JavaScript:

```bash
curl -X POST "$URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "xss-test",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "<script>alert(\"HACKED\")</script>",
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

**Expected:** Accepts the data but `<script>` tags are sanitized

---

## 5. Test Invalid Data Types 🔢

Try to send string instead of number:

```bash
curl -X POST "$URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "type-test",
    "timestamp": "2024-01-01T00:00:00Z",
    "isp": "Test ISP",
    "planName": "100 Mbps",
    "promisedSpeed": "SUPER FAST",
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

**Expected:** `{"error":"Invalid promisedSpeed"}`

---

## Full Automated Test

Run the complete test suite:

```bash
./test-security.sh YOUR_DEPLOYMENT_URL
```

Or if you haven't deployed yet, test locally:

```bash
npm run dev
# In another terminal:
./test-security.sh http://localhost:3000
```

---

## What Success Looks Like ✅

When all security is working:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Security Test Suite for Pulse App
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1: Rate Limiting Attack
✅ PASS: Rate limiting working (5 successful, 5 blocked)

Test 2: Negative Speed Value
✅ PASS: Rejected negative value (HTTP 400)

Test 3: Invalid Grade
✅ PASS: Rejected invalid grade (HTTP 400)

Test 4: Unrealistic Speed
✅ PASS: Rejected unrealistic speed (HTTP 400)

Test 5: Missing Required Fields
✅ PASS: Rejected incomplete payload (HTTP 400)

Test 6: Wrong Data Types
✅ PASS: Rejected wrong data type (HTTP 400)

Test 7: Service Score Out of Range
✅ PASS: Rejected invalid service score (HTTP 400)

Test 8: Download Size Limit
✅ PASS: Download capped at reasonable size (2097152 bytes ≤ 2MB)

Test 9: Invalid Download Parameter
✅ PASS: Rejected NaN parameter (HTTP 400)

Test 10: Negative Download Size
✅ PASS: Rejected negative size (HTTP 400)

Test 11: XSS Injection
✅ PASS: XSS tags sanitized

Test 12: Redis Key Injection
✅ PASS: Request accepted with sanitized keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Results Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests:  12
Passed:       12 ✅
Failed:       0 ❌

🎉 All security tests passed! Your app is secure.
```

---

## Common Attack Scenarios Blocked 🚫

Your app now blocks:

1. ❌ **Spam/DoS** - Rate limited to 5 req/min
2. ❌ **Fake data** - Validates all fields
3. ❌ **Type confusion** - Strict type checking
4. ❌ **Buffer overflow** - Size limits enforced
5. ❌ **XSS** - Script tags sanitized
6. ❌ **Key injection** - Special chars removed
7. ❌ **CORS bypass** - Same-origin only
8. ❌ **Parameter tampering** - Validated & capped

**Your app is production-ready! 🚀**
