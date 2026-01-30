#!/bin/bash

# Diamond Bidding System - Automated Test Runner
# This script runs all API test cases automatically

echo "=========================================="
echo "  Diamond Bidding System - Test Suite"
echo "=========================================="
echo ""

PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health Check
echo "TEST 1: Backend Health Check"
RESPONSE=$(curl -s http://localhost:5000/health)
if [[ $RESPONSE == *"OK"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Backend is running"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - Backend not responding"
    ((FAILED++))
fi
echo ""

# Test 2: Admin Login
echo "TEST 2: Admin Login (Valid Credentials)"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@diamond.com","password":"admin123"}')

if [[ $LOGIN_RESPONSE == *"Login successful"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Admin login successful"
    ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - Admin login failed"
    echo "Response: $LOGIN_RESPONSE"
    ((FAILED++))
fi
echo ""

# Test 3: Invalid Login
echo "TEST 3: Login with Invalid Credentials"
INVALID_LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@email.com","password":"wrongpass"}')

if [[ $INVALID_LOGIN == *"Invalid email or password"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Invalid login rejected correctly"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - Invalid login not handled properly"
    ((FAILED++))
fi
echo ""

# Test 4: Public Endpoints - Diamonds
echo "TEST 4: Public Endpoint - Get Diamonds"
DIAMONDS=$(curl -s http://localhost:5000/api/public/diamonds)
DIAMOND_COUNT=$(echo $DIAMONDS | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)

if [ -n "$DIAMOND_COUNT" ] && [ "$DIAMOND_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Found $DIAMOND_COUNT diamonds"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - No diamonds found"
    ((FAILED++))
fi
echo ""

# Test 5: Public Endpoints - Active Bids
echo "TEST 5: Public Endpoint - Get Active Bids"
BIDS=$(curl -s http://localhost:5000/api/public/bids/active)
if [[ $BIDS == *"data"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Active bids endpoint working"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - Active bids endpoint failed"
    ((FAILED++))
fi
echo ""

# Test 6: Protected Endpoint Without Auth
echo "TEST 6: Access Protected Endpoint Without Auth"
UNAUTH=$(curl -s http://localhost:5000/api/admin/diamonds)
if [[ $UNAUTH == *"Unauthorized"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Unauthorized access blocked"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - Security issue: Unauthorized access allowed"
    ((FAILED++))
fi
echo ""

# Test 7: Admin Get Diamonds (With Auth)
echo "TEST 7: Admin Get Diamonds (With Auth)"
if [ -n "$ADMIN_TOKEN" ]; then
    ADMIN_DIAMONDS=$(curl -s http://localhost:5000/api/admin/diamonds \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    if [[ $ADMIN_DIAMONDS == *"data"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} - Admin can access diamonds"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - Admin access failed"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} - No admin token available"
fi
echo ""

# Test 8: Create Diamond
echo "TEST 8: Create Diamond"
if [ -n "$ADMIN_TOKEN" ]; then
    CREATE_DIAMOND=$(curl -s -X POST http://localhost:5000/api/admin/diamonds \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"Test Diamond '$(date +%s)'","base_price":"99999","image_url":"https://example.com/test.jpg"}')
    
    if [[ $CREATE_DIAMOND == *"Diamond created successfully"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} - Diamond created successfully"
        NEW_DIAMOND_ID=$(echo $CREATE_DIAMOND | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - Diamond creation failed"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} - No admin token available"
fi
echo ""

# Test 9: Update Diamond
echo "TEST 9: Update Diamond"
if [ -n "$ADMIN_TOKEN" ] && [ -n "$NEW_DIAMOND_ID" ]; then
    UPDATE_DIAMOND=$(curl -s -X PUT http://localhost:5000/api/admin/diamonds/$NEW_DIAMOND_ID \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"Updated Test Diamond","base_price":"150000"}')
    
    if [[ $UPDATE_DIAMOND == *"Diamond updated successfully"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} - Diamond updated successfully"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - Diamond update failed"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} - Prerequisites not met"
fi
echo ""

# Test 10: Validation - Missing Fields
echo "TEST 10: Validation - Create Diamond with Missing Fields"
if [ -n "$ADMIN_TOKEN" ]; then
    VALIDATION=$(curl -s -X POST http://localhost:5000/api/admin/diamonds \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"Test Only"}')
    
    if [[ $VALIDATION == *"required"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} - Validation working correctly"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - Validation not working"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} - No admin token available"
fi
echo ""

# Summary
echo "=========================================="
echo "           Test Results Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
TOTAL=$((PASSED + FAILED))
echo "Total: $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    exit 1
fi
