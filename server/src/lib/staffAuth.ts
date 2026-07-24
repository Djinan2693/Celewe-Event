// Shared staff PIN check used by scan/admin endpoints.

export function isStaffPinValid(pin: unknown): boolean {
  const expected = process.env.STAFF_PIN?.trim();
  if (!expected) {
    return false;
  }
  return typeof pin === "string" && pin.trim() === expected;
}
