const ALLOWED_MATCH_TRANSITIONS = {
    DRAFT: ['SCHEDULED', 'ABANDONED'],
    SCHEDULED: ['TOSS_DONE', 'ABANDONED'],
    TOSS_DONE: ['INNINGS_1', 'ABANDONED'],
    INNINGS_1: ['INNINGS_BREAK', 'ABANDONED'],
    INNINGS_BREAK: ['INNINGS_2', 'ABANDONED'],
    INNINGS_2: ['COMPLETED', 'TIED', 'ABANDONED'],
    COMPLETED: [],
    TIED: [],
    ABANDONED: []
};
export function canTransitionMatchStatus(current, target) {
    return ALLOWED_MATCH_TRANSITIONS[current]?.includes(target) ?? false;
}
//# sourceMappingURL=match.js.map