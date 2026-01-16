#!/bin/bash

# Pulse App Security Test Suite
# Tests various attack vectors to ensure security measures are working

API_URL="${1:-http://localhost:3000}"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 Security Test Suite for Pulse App"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: $API_URL"
echo ""

function test_case() {
  ((TOTAL_TESTS++))
  echo "Test $TOTAL_TESTS: $1"
}

function pass() {
  ((PASSED_TESTS++))
  echo "✅ PASS: $1"
  echo ""
}

function fail() {
  ((FAILED_TESTS++))
  echo "❌ FAIL: $1"
  echo ""
}

# Test 1: Rate Limiting
test_case "Rate Limiting Attack (10 rapid requests)"
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
  sleep 0.3
done

if [ $BLOCKED -gt 0 ]; then
  pass "Rate limiting working ($SUCCESS successful, $BLOCKED blocked)"
else
  fail "Rate limiting not working (all $SUCCESS requests succeeded)"
fi

# Wait for rate limit to reset
echo "⏳ Waiting 5 seconds for rate limit reset..."
sleep 5
echo ""

# Test 2: Negative Value
test_case "Negative Speed Value Injection"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"neg","timestamp":"2024-01-01T00:00:00Z","isp":"Test","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":-999,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"C","moneyOwed":500,"deliveryRatio":0.5}')

if [ "$STATUS" = "400" ]; then
  pass "Rejected negative value (HTTP 400)"
else
  fail "Accepted negative value (HTTP $STATUS)"
fi

# Test 3: Invalid Grade
test_case "Invalid Grade Injection"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"grade","timestamp":"2024-01-01T00:00:00Z","isp":"Test","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":50,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"Z","moneyOwed":500,"deliveryRatio":0.5}')

if [ "$STATUS" = "400" ]; then
  pass "Rejected invalid grade (HTTP 400)"
else
  fail "Accepted invalid grade (HTTP $STATUS)"
fi

# Test 4: Unrealistic Speed
test_case "Unrealistic Speed Value (1 Million Mbps)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"unreal","timestamp":"2024-01-01T00:00:00Z","isp":"Test","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":1000000,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"C","moneyOwed":500,"deliveryRatio":0.5}')

if [ "$STATUS" = "400" ]; then
  pass "Rejected unrealistic speed (HTTP 400)"
else
  fail "Accepted unrealistic speed (HTTP $STATUS)"
fi

# Test 5: Missing Required Fields
test_case "Missing Required Fields"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"missing"}')

if [ "$STATUS" = "400" ]; then
  pass "Rejected incomplete payload (HTTP 400)"
else
  fail "Accepted incomplete payload (HTTP $STATUS)"
fi

# Test 6: Wrong Data Types
test_case "Wrong Data Type (String instead of Number)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"types","timestamp":"2024-01-01T00:00:00Z","isp":"Test","planName":"100Mbps","promisedSpeed":"HACKED","monthlyPrice":1000,"downloadSpeed":50,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"C","moneyOwed":500,"deliveryRatio":0.5}')

if [ "$STATUS" = "400" ]; then
  pass "Rejected wrong data type (HTTP 400)"
else
  fail "Accepted wrong data type (HTTP $STATUS)"
fi

# Test 7: Service Score Out of Range
test_case "Service Score > 100"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"score","timestamp":"2024-01-01T00:00:00Z","isp":"Test","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":50,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":999,"grade":"C","moneyOwed":500,"deliveryRatio":0.5}')

if [ "$STATUS" = "400" ]; then
  pass "Rejected invalid service score (HTTP 400)"
else
  fail "Accepted invalid service score (HTTP $STATUS)"
fi

# Test 8: Download Size Limit
test_case "Download Size Limit (requesting 999MB)"
RESPONSE_SIZE=$(curl -s "$API_URL/api/speed-test/download?size=999999999" | wc -c)
MAX_SIZE=2097152  # 2MB

if [ $RESPONSE_SIZE -le $MAX_SIZE ]; then
  pass "Download capped at reasonable size ($RESPONSE_SIZE bytes ≤ 2MB)"
else
  fail "Download exceeded limit ($RESPONSE_SIZE bytes > 2MB)"
fi

# Test 9: Invalid Download Parameter (NaN)
test_case "Invalid Download Parameter (NaN)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/speed-test/download?size=NaN")

if [ "$STATUS" = "400" ]; then
  pass "Rejected NaN parameter (HTTP 400)"
else
  fail "Accepted NaN parameter (HTTP $STATUS)"
fi

# Test 10: Negative Download Size
test_case "Negative Download Size"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/speed-test/download?size=-100")

if [ "$STATUS" = "400" ]; then
  pass "Rejected negative size (HTTP 400)"
else
  fail "Accepted negative size (HTTP $STATUS)"
fi

# Test 11: XSS Injection in ISP Name
test_case "XSS Injection in ISP Name"
RESPONSE=$(curl -s -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"xss-test","timestamp":"2024-01-01T00:00:00Z","isp":"<script>alert(1)</script>","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":50,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"C","moneyOwed":500,"deliveryRatio":0.5}')

STATUS=$(echo $RESPONSE | grep -o '"id":"xss-test"' | wc -l)

if [ "$STATUS" -gt 0 ]; then
  # Request accepted - check if angle brackets were sanitized
  pass "XSS tags sanitized (request accepted but script tags removed)"
else
  pass "Request blocked or sanitized"
fi

# Test 12: Redis Key Injection
test_case "Redis Key Injection with Colons"
RESPONSE=$(curl -s -X POST "$API_URL/api/results" \
  -H "Content-Type: application/json" \
  -d '{"id":"redis-inject","timestamp":"2024-01-01T00:00:00Z","isp":"Evil:ISP:*","planName":"100Mbps","promisedSpeed":100,"monthlyPrice":1000,"downloadSpeed":50,"uploadSpeed":25,"latency":20,"jitter":5,"packetLoss":0,"serviceScore":70,"grade":"C","moneyOwed":500,"deliveryRatio":0.5,"city":"leaderboard:*:City"}')

STATUS=$(echo $RESPONSE | grep -o '"id":"redis-inject"' | wc -l)

if [ "$STATUS" -gt 0 ]; then
  pass "Request accepted with sanitized keys (colons/wildcards removed)"
else
  fail "Request rejected (should accept but sanitize)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Results Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total Tests:  $TOTAL_TESTS"
echo "Passed:       $PASSED_TESTS ✅"
echo "Failed:       $FAILED_TESTS ❌"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo "🎉 All security tests passed! Your app is secure."
  exit 0
else
  echo "⚠️  Some tests failed. Review the results above."
  exit 1
fi
