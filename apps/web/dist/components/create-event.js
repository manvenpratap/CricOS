/**
 * apps/web/src/components/create-event.ts
 *
 * Create Event Wizard — 3-Step Progressive Disclosure
 * Derived from Archive Specifications:
 * - 01_Functional_Specification_v3 (§7.1 UX-003: Create Event)
 * - 02_Product_Blueprint_v1 (Event-first abstraction §34)
 * - 08_Sprint_Ready_P0_Backlog_v1 (CRK-001, EVT-001..005)
 *
 * Implements the core event creation flow with format selection,
 * team & official assignment, and schedule/venue configuration.
 * Outputs an EventConfig that feeds into Event Basket procurement.
 */
export const FORMAT_CATALOGUE = {
    T20: {
        format: 'T20',
        overs: 20,
        powerplayOvers: 6,
        maxBowlerOvers: 4,
        playersPerSide: 11,
        innings: 2,
        label: 'T20',
        description: '20 overs per side • Fast-paced limited overs'
    },
    ODI: {
        format: 'ODI',
        overs: 50,
        powerplayOvers: 10,
        maxBowlerOvers: 10,
        playersPerSide: 11,
        innings: 2,
        label: 'One-Day International',
        description: '50 overs per side • Classic limited overs'
    },
    TEST: {
        format: 'TEST',
        overs: 90,
        powerplayOvers: 0,
        maxBowlerOvers: 90,
        playersPerSide: 11,
        innings: 4,
        label: 'Test Match',
        description: 'Unlimited overs per innings • Multi-day match'
    },
    CUSTOM: {
        format: 'CUSTOM',
        overs: 10,
        powerplayOvers: 2,
        maxBowlerOvers: 2,
        playersPerSide: 8,
        innings: 2,
        label: 'Custom Format',
        description: 'Configure your own overs, powerplay, and squad size'
    }
};
/**
 * Returns the default official requirements for a given format.
 */
export function getDefaultOfficials(format) {
    const base = [
        { role: 'UMPIRE', count: 2, mandatory: true, label: 'On-Field Umpires' },
        { role: 'SCORER', count: 1, mandatory: true, label: 'Official Scorer' }
    ];
    if (format === 'TEST' || format === 'ODI') {
        base.push({ role: 'REFEREE', count: 1, mandatory: false, label: 'Match Referee' });
    }
    base.push({ role: 'STREAMER', count: 1, mandatory: false, label: 'Live Streamer' });
    return base;
}
/**
 * Estimates match duration in minutes based on format.
 */
export function estimateMatchDuration(format, customOvers) {
    switch (format) {
        case 'T20': return 180; // ~3 hours
        case 'ODI': return 480; // ~8 hours
        case 'TEST': return 1800; // ~30 hours (5 days × 6 hours)
        case 'CUSTOM': return Math.max(60, (customOvers ?? 10) * 2 * 4); // ~4 min per over × 2 innings
    }
}
/**
 * Generates a deterministic event ID.
 */
export function generateEventId() {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    return `EVT-${ts}-${rand}`.toUpperCase();
}
/**
 * Creates a blank EventConfig with defaults for the selected format.
 */
export function createBlankEventConfig(format, customOvers) {
    const formatSpec = { ...FORMAT_CATALOGUE[format] };
    if (format === 'CUSTOM' && customOvers !== undefined) {
        formatSpec.overs = customOvers;
        formatSpec.maxBowlerOvers = Math.ceil(customOvers / 5);
        formatSpec.powerplayOvers = Math.max(1, Math.floor(customOvers / 5));
    }
    return {
        eventId: generateEventId(),
        title: '',
        format: formatSpec,
        customOvers: format === 'CUSTOM' ? (customOvers ?? 10) : undefined,
        homeTeam: null,
        awayTeam: null,
        officials: getDefaultOfficials(format),
        venue: null,
        scheduledDate: '',
        estimatedDurationMinutes: estimateMatchDuration(format, customOvers),
        autoGenerateBasket: true,
        createdAt: new Date().toISOString(),
        status: 'DRAFT'
    };
}
/**
 * Validates the event configuration at each wizard step.
 * Returns an array of validation error messages (empty = valid).
 */
export function validateWizardStep(config, step) {
    const errors = [];
    switch (step) {
        case 1:
            if (!config.format)
                errors.push('Match format is required');
            if (config.format.format === 'CUSTOM' && (config.format.overs < 1 || config.format.overs > 100)) {
                errors.push('Custom overs must be between 1 and 100');
            }
            break;
        case 2:
            if (!config.homeTeam)
                errors.push('Home team must be assigned');
            if (!config.awayTeam)
                errors.push('Away team must be assigned');
            if (config.homeTeam && config.awayTeam && config.homeTeam.teamId === config.awayTeam.teamId) {
                errors.push('Home and Away teams must be different');
            }
            {
                const mandatoryOfficials = config.officials.filter(o => o.mandatory && o.count < 1);
                if (mandatoryOfficials.length > 0) {
                    errors.push(`Missing mandatory officials: ${mandatoryOfficials.map(o => o.label).join(', ')}`);
                }
            }
            break;
        case 3:
            if (!config.scheduledDate)
                errors.push('Match date and time is required');
            if (!config.venue)
                errors.push('Venue must be selected');
            {
                const scheduledTime = new Date(config.scheduledDate).getTime();
                if (scheduledTime <= Date.now()) {
                    errors.push('Scheduled date must be in the future');
                }
            }
            break;
    }
    return errors;
}
/**
 * Determines the current event status based on configuration completeness.
 */
export function deriveEventStatus(config) {
    const step1Valid = validateWizardStep(config, 1).length === 0;
    const step2Valid = validateWizardStep(config, 2).length === 0;
    const step3Valid = validateWizardStep(config, 3).length === 0;
    if (step1Valid && step2Valid && step3Valid)
        return 'READY';
    if (step1Valid && step2Valid)
        return 'CONFIGURED';
    return 'DRAFT';
}
/**
 * Renders the Create Event Wizard step indicator HTML.
 */
export function renderWizardStepperHtml(currentStep) {
    const steps = [
        { step: 1, label: 'Format', icon: '🏏' },
        { step: 2, label: 'Teams & Officials', icon: '👥' },
        { step: 3, label: 'Schedule & Venue', icon: '📅' }
    ];
    const stepItems = steps.map(s => {
        const stateClass = s.step === currentStep ? 'active' : s.step < currentStep ? 'completed' : 'upcoming';
        return `<div class="wizard-step ${stateClass}" data-tooltip="${s.label}: Step ${s.step} of 3">
      <span class="wizard-step-icon">${s.step < currentStep ? '✓' : s.icon}</span>
      <span class="wizard-step-label">${s.label}</span>
    </div>`;
    }).join('<div class="wizard-step-connector"></div>');
    return `<div class="wizard-stepper">${stepItems}</div>`;
}
/**
 * Renders format selection cards for Step 1.
 */
export function renderFormatSelectionHtml(selectedFormat) {
    const formats = ['T20', 'ODI', 'TEST', 'CUSTOM'];
    const cards = formats.map(f => {
        const spec = FORMAT_CATALOGUE[f];
        const selected = selectedFormat === f;
        return `<div class="format-card ${selected ? 'selected' : ''}" onclick="selectEventFormat('${f}')" data-tooltip="${spec.description}">
      <div class="format-card-label">${spec.label}</div>
      <div class="format-card-overs">${f === 'CUSTOM' ? 'Configurable' : spec.overs + ' overs'}</div>
      <div class="format-card-detail">${spec.playersPerSide}v${spec.playersPerSide} • ${spec.innings} innings</div>
    </div>`;
    }).join('');
    return `<div class="format-grid">${cards}</div>`;
}
/**
 * Generates basket requirement lines from a completed EventConfig.
 * This feeds into the existing Event Basket procurement system.
 */
export function generateBasketFromEvent(config) {
    const items = [];
    // Venue requirement
    items.push({
        category: 'VENUE',
        label: config.venue ? config.venue.venueName : 'Cricket Ground / Turf Arena',
        required: true,
        status: config.venue ? 'BOOKED' : 'PENDING'
    });
    // Official requirements
    for (const official of config.officials) {
        for (let i = 0; i < official.count; i++) {
            items.push({
                category: 'OFFICIAL',
                label: `${official.label} ${official.count > 1 ? `#${i + 1}` : ''}`.trim(),
                required: official.mandatory,
                status: 'PENDING'
            });
        }
    }
    // Match balls
    items.push({
        category: 'EQUIPMENT',
        label: 'Match Balls (SG/Kookaburra)',
        required: true,
        status: 'PENDING'
    });
    // Stumps & bails
    items.push({
        category: 'EQUIPMENT',
        label: 'Stumps & Bails (2 sets)',
        required: true,
        status: 'PENDING'
    });
    return items;
}
//# sourceMappingURL=create-event.js.map