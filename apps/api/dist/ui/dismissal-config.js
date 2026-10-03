/**
 * CricOS Dismissal Popup Configuration & Kinetic Celebration Engine
 * Dynamically maps MCC Laws 30-39 and Law 25 dismissal modes to athletic visual banners.
 */
export function getDismissalPopupConfig(modeInput, fielder, bowler, batter) {
    const mode = String(modeInput || 'BOWLED').trim().toUpperCase().replace(/[\s-]/g, '_');
    const fName = (fielder || '').trim();
    const bName = (batter || '').trim();
    const bowlName = (bowler || '').trim();
    switch (mode) {
        case 'CAUGHT':
            return {
                title: 'CAUGHT OUT!',
                subtitle: fName ? ('TAKEN BY ' + fName.toUpperCase() + ' • IN THE AIR & GONE!') : 'SAFE HANDS IN THE FIELD • IN THE AIR & GONE!',
                icon: 'shield',
                color: '#FF3366',
                borderColor: 'rgba(255, 51, 102, 0.7)',
                shadowColor: 'rgba(255, 51, 102, 0.5)',
                particleColors: ['#FF3366', '#FF5C8A', '#FFB800', '#FFFFFF']
            };
        case 'CAUGHT_AND_BOWLED':
            return {
                title: 'CAUGHT & BOWLED!',
                subtitle: bowlName ? ('CAUGHT & BOWLED BY ' + bowlName.toUpperCase() + ' • REFLEX RETURN CATCH!') : (fName ? ('CAUGHT & BOWLED BY ' + fName.toUpperCase()) : 'CAUGHT & BOWLED • SHARP REFLEX RETURN CATCH!'),
                icon: 'shield',
                color: '#FF3366',
                borderColor: 'rgba(255, 51, 102, 0.7)',
                shadowColor: 'rgba(255, 51, 102, 0.5)',
                particleColors: ['#FF3366', '#FF5C8A', '#FFB800', '#FFFFFF']
            };
        case 'BOWLED':
            return {
                title: 'BOWLED! TIMBER!',
                subtitle: 'STUMPS SHATTERED • CLEAN THROUGH THE GATE',
                icon: 'target',
                color: '#FF3366',
                borderColor: 'rgba(255, 51, 102, 0.7)',
                shadowColor: 'rgba(255, 51, 102, 0.5)',
                particleColors: ['#FF3366', '#FF5C8A', '#FFB800', '#FFFFFF']
            };
        case 'LBW':
            return {
                title: 'LBW! TRAPPED IN FRONT!',
                subtitle: 'PLUMB IN FRONT • PITCHING IN LINE & HITTING',
                icon: 'scale',
                color: '#FF3366',
                borderColor: 'rgba(255, 51, 102, 0.7)',
                shadowColor: 'rgba(255, 51, 102, 0.5)',
                particleColors: ['#FF3366', '#FF5C8A', '#FFB800', '#FFFFFF']
            };
        case 'RUN_OUT':
            return {
                title: 'RUN OUT!',
                subtitle: fName ? ('DIRECT HIT BY ' + fName.toUpperCase() + ' • SHORT OF CREASE!') : 'RAZOR SHARP THROW • SHORT OF THE CREASE!',
                icon: 'lightning',
                color: '#FFB800',
                borderColor: 'rgba(255, 184, 0, 0.7)',
                shadowColor: 'rgba(255, 184, 0, 0.5)',
                particleColors: ['#FFB800', '#FFA000', '#FF3366', '#FFFFFF']
            };
        case 'STUMPED':
            return {
                title: 'STUMPED!',
                subtitle: fName ? ('LIGHTNING GLOVEWORK BY ' + fName.toUpperCase() + ' • OUTSIDE CREASE') : 'BEATEN IN THE FLIGHT • BAILS WHIPPED OFF!',
                icon: 'lightning',
                color: '#38BDF8',
                borderColor: 'rgba(56, 189, 248, 0.7)',
                shadowColor: 'rgba(56, 189, 248, 0.5)',
                particleColors: ['#38BDF8', '#00D2FF', '#FFFFFF', '#C084FC']
            };
        case 'HIT_WICKET':
            return {
                title: 'HIT WICKET!',
                subtitle: 'BATTER KNOCKS DOWN BAILS • LAW 35 DISMISSAL',
                icon: 'target',
                color: '#FF3366',
                borderColor: 'rgba(255, 51, 102, 0.7)',
                shadowColor: 'rgba(255, 51, 102, 0.5)',
                particleColors: ['#FF3366', '#FF5C8A', '#FFB800', '#FFFFFF']
            };
        case 'OBSTRUCTING':
            return {
                title: 'OBSTRUCTING THE FIELD!',
                subtitle: 'WILFUL INTERFERENCE • MCC LAW 37 DISMISSAL',
                icon: 'alert',
                color: '#FFB800',
                borderColor: 'rgba(255, 184, 0, 0.7)',
                shadowColor: 'rgba(255, 184, 0, 0.5)',
                particleColors: ['#FFB800', '#FFA000', '#FFFFFF']
            };
        case 'HIT_BALL_TWICE':
            return {
                title: 'HIT THE BALL TWICE!',
                subtitle: 'STRIKING BALL A SECOND TIME • MCC LAW 34',
                icon: 'alert',
                color: '#FFB800',
                borderColor: 'rgba(255, 184, 0, 0.7)',
                shadowColor: 'rgba(255, 184, 0, 0.5)',
                particleColors: ['#FFB800', '#FFA000', '#FFFFFF']
            };
        case 'HANDLED_BALL':
            return {
                title: 'HANDLED THE BALL!',
                subtitle: 'TOUCHED BALL IN PLAY • MCC LAW 37',
                icon: 'alert',
                color: '#FFB800',
                borderColor: 'rgba(255, 184, 0, 0.7)',
                shadowColor: 'rgba(255, 184, 0, 0.5)',
                particleColors: ['#FFB800', '#FFA000', '#FFFFFF']
            };
        case 'TIMED_OUT':
            return {
                title: 'TIMED OUT!',
                subtitle: 'FAILED TO ARRIVE WITHIN 3 MINUTES • LAW 40',
                icon: 'calendar',
                color: '#FFB800',
                borderColor: 'rgba(255, 184, 0, 0.7)',
                shadowColor: 'rgba(255, 184, 0, 0.5)',
                particleColors: ['#FFB800', '#FFA000', '#FFFFFF']
            };
        case 'RETIRED_OUT':
            return {
                title: 'RETIRED OUT!',
                subtitle: 'TACTICAL RETIREMENT (OUT) • LAW 25.4',
                icon: 'user',
                color: '#94A3B8',
                borderColor: 'rgba(148, 163, 184, 0.7)',
                shadowColor: 'rgba(148, 163, 184, 0.4)',
                particleColors: ['#94A3B8', '#CBD5E1', '#FFFFFF']
            };
        case 'RETIRED_HURT':
            return {
                title: 'RETIRED HURT',
                subtitle: 'BATTER RETIRES INJURED (NOT OUT) • LAW 25.4',
                icon: 'activity',
                color: '#38BDF8',
                borderColor: 'rgba(56, 189, 248, 0.7)',
                shadowColor: 'rgba(56, 189, 248, 0.5)',
                particleColors: ['#38BDF8', '#00D2FF', '#FFFFFF']
            };
        default:
            return {
                title: 'WICKET!',
                subtitle: bName ? (bName.toUpperCase() + ' DISMISSED') : 'DEPARTING BATTER DISMISSED',
                icon: 'target',
                color: '#FF3366',
                borderColor: 'rgba(255, 51, 102, 0.7)',
                shadowColor: 'rgba(255, 51, 102, 0.5)',
                particleColors: ['#FF3366', '#FF5C8A', '#FFB800', '#FFFFFF']
            };
    }
}
export function getDismissalConfigClientScript() {
    return `
    window.getDismissalPopupConfig = ${getDismissalPopupConfig.toString()};
  `;
}
//# sourceMappingURL=dismissal-config.js.map