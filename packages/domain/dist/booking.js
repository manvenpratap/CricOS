export function isHoldExpired(hold, now = new Date()) {
    return hold.status === 'EXPIRED' || (hold.status === 'ACTIVE' && hold.heldUntil.getTime() <= now.getTime());
}
//# sourceMappingURL=booking.js.map