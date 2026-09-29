export function validateEventWindow(startsAt, endsAt) {
    if (!(startsAt.getTime() < endsAt.getTime())) {
        throw new Error('EVENT_INVALID_TIME_WINDOW: startsAt must be strictly before endsAt');
    }
}
const ALLOWED_STATUS_TRANSITIONS = {
    DRAFT: ['PUBLISHED', 'CANCELLED'],
    PUBLISHED: ['READY', 'CANCELLED'],
    READY: ['LIVE', 'CANCELLED'],
    LIVE: ['COMPLETED', 'DISPUTED', 'CANCELLED'],
    COMPLETED: ['DISPUTED'],
    CANCELLED: [],
    DISPUTED: ['COMPLETED', 'CANCELLED']
};
export function canTransitionEventStatus(current, target) {
    return ALLOWED_STATUS_TRANSITIONS[current]?.includes(target) ?? false;
}
//# sourceMappingURL=event.js.map