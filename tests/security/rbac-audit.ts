/**
 * RBAC & Security Audit Script
 * Run with: npx tsx tests/security/rbac-audit.ts
 */

import { transitionStatusSchema } from "../../lib/validations/task";
import { reviewRequestSchema } from "../../lib/validations/request";
import { createUserSchema } from "../../lib/validations/auth";

console.log("🔒 Running RBAC & Security Validation Audit...");

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

// Test 1: Status Transition requires mandatory reason >= 5 characters
const emptyReasonCheck = transitionStatusSchema.safeParse({
  taskId: "c7b8e1a0-1234-4567-89ab-cdef01234567",
  newStatus: "IN_PROGRESS",
  reason: "",
});
assert("Rejects status change with empty reason", !emptyReasonCheck.success);

const shortReasonCheck = transitionStatusSchema.safeParse({
  taskId: "c7b8e1a0-1234-4567-89ab-cdef01234567",
  newStatus: "IN_PROGRESS",
  reason: "Done",
});
assert("Rejects status change with reason < 5 characters", !shortReasonCheck.success);

const validReasonCheck = transitionStatusSchema.safeParse({
  taskId: "c7b8e1a0-1234-4567-89ab-cdef01234567",
  newStatus: "IN_PROGRESS",
  reason: "Started working on bug reproduction",
});
assert("Accepts status change with valid mandatory explanation", validReasonCheck.success);

// Test 2: Request Review validation
const emptyRemarksReview = reviewRequestSchema.safeParse({
  requestId: "c7b8e1a0-1234-4567-89ab-cdef01234567",
  status: "APPROVED",
  remarks: "",
});
assert("Rejects request approval without reviewer remarks", !emptyRemarksReview.success);

// Test 3: User Creation validation
const invalidUsername = createUserSchema.safeParse({
  username: "invalid username with spaces",
  fullName: "Test User",
  role: "DEVELOPER",
  temporaryPassword: "Password@123",
});
assert("Rejects username with invalid characters/spaces", !invalidUsername.success);

const shortPassword = createUserSchema.safeParse({
  username: "valid_user",
  fullName: "Test User",
  role: "DEVELOPER",
  temporaryPassword: "123",
});
assert("Rejects temporary password < 8 characters", !shortPassword.success);

console.log(`\nAudit completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
