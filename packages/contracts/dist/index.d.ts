export type ID = string;
export interface Money {
    amount_minor: number;
    currency: string;
}
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'READY' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
export type MatchFormat = 'T20' | 'ODI' | 'TEST' | 'CUSTOM';
export type MatchStatus = 'DRAFT' | 'SCHEDULED' | 'TOSS_DONE' | 'INNINGS_1' | 'INNINGS_BREAK' | 'INNINGS_2' | 'COMPLETED' | 'ABANDONED' | 'TIED';
export type TeamRole = 'CAPTAIN' | 'VICE_CAPTAIN' | 'PLAYER' | 'MANAGER';
export type ProviderType = 'GROUND' | 'OFFICIAL' | 'COACH' | 'SCORER' | 'OTHER';
export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
export type HoldStatus = 'ACTIVE' | 'RELEASED' | 'EXPIRED' | 'CONSUMED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'DISPUTED' | 'REFUNDED';
export type OrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'PAYMENT_FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentIntentStatus = 'REQUIRES_PAYMENT_METHOD' | 'REQUIRES_CONFIRMATION' | 'PROCESSING' | 'SUCCEEDED' | 'CANCELLED' | 'FAILED';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER_FAVOUR' | 'RESOLVED_PROVIDER_FAVOUR' | 'SPLIT_SETTLEMENT' | 'DISMISSED';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'REPLACEMENT_PROPOSED' | 'RESOLVED' | 'CLOSED';
export type TournamentFormat = 'ROUND_ROBIN' | 'KNOCKOUT' | 'GROUP_AND_KNOCKOUT';
export type TournamentStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export interface CreateEventRequest {
    type: 'MATCH';
    title: string;
    starts_at: string;
    ends_at: string;
    timezone: string;
    team_ids: [ID, ID];
    format: MatchFormat;
    ruleset_version: string;
}
export interface EventRequirement {
    id: ID;
    category: ProviderType;
    required: boolean;
    quantity: number;
    status: string;
}
export interface HoldRequest {
    slot_id: ID;
    starts_at: string;
    ends_at: string;
    user_id?: ID;
}
export interface HoldResponse {
    hold_id: ID;
    slot_id: ID;
    expires_at: string;
    status: HoldStatus;
}
export interface CheckoutItemInput {
    listing_id: ID;
    slot_id: ID;
    hold_id?: ID;
}
export interface CheckoutRequest {
    event_id?: ID;
    items: CheckoutItemInput[];
    payment_method?: string;
    currency?: string;
}
export interface CheckoutResponse {
    order_id: ID;
    status: OrderStatus;
    subtotal_minor: number;
    fee_minor: number;
    tax_minor: number;
    discount_minor: number;
    total_minor: number;
    currency: string;
    items_count: number;
}
export interface ScoreEventPayload {
    client_event_id: string;
    sequence: number;
    event_type: 'DELIVERY' | 'INNINGS_START' | 'INNINGS_END' | 'OVER_END' | 'WICKET';
    bat_runs: number;
    extra_runs: number;
    extra_type: 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'PENALTY';
    legal_ball: boolean;
    wicket?: {
        kind: 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED' | 'HIT_WICKET';
        player_out_id: ID;
        fielder_id?: ID;
    };
}
export interface ScoreStateResponse {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    legal_balls: number;
    current_innings: number;
    target?: number;
    status: MatchStatus;
}
export interface RfqRequest {
    id: ID;
    event_id?: ID;
    category: ProviderType;
    title: string;
    description: string;
    budget_minor: number;
    currency: string;
    deadline: string;
    status: 'OPEN' | 'AWARDED' | 'EXPIRED' | 'CANCELLED';
}
export interface RfqQuote {
    id: ID;
    rfq_id: ID;
    provider_id: ID;
    quote_price_minor: number;
    currency: string;
    notes?: string;
    valid_until: string;
    status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
}
export interface ProductListing {
    id: ID;
    provider_id: ID;
    title: string;
    description: string;
    category: 'BALLS' | 'KITS' | 'EQUIPMENT' | 'TROPHIES' | 'MERCHANDISE';
    price_minor: number;
    currency: string;
    stock_quantity: number;
    variants?: {
        name: string;
        options: string[];
    }[];
    status: 'ACTIVE' | 'OUT_OF_STOCK';
}
export interface ProductOrder {
    id: ID;
    order_id: ID;
    product_id: ID;
    quantity: number;
    price_minor: number;
    delivery_address?: string;
    delivery_status: 'PROCESSING' | 'DISPATCHED' | 'DELIVERED' | 'RETURNED';
}
export interface Suborder {
    id: ID;
    parent_order_id: ID;
    provider_id: ID;
    items_count: number;
    subtotal_minor: number;
    fee_minor: number;
    tax_minor: number;
    total_minor: number;
    status: BookingStatus;
}
export interface ScorerListing {
    id: ID;
    provider_id: ID;
    certification_level: 'BCCI_LEVEL_1' | 'STATE' | 'CLUB';
    scoring_software_expertise: string[];
    match_fee_minor: number;
    currency: string;
    status: 'ACTIVE' | 'INACTIVE';
}
export interface MediaListing {
    id: ID;
    provider_id: ID;
    media_type: 'STREAMER' | 'COMMENTATOR' | 'PHOTOGRAPHER' | 'VIDEOGRAPHER';
    package_title: string;
    package_price_minor: number;
    equipment_details: string[];
    status: 'ACTIVE' | 'INACTIVE';
}
export interface FixtureBoardItem {
    fixture_id: ID;
    match_id?: ID;
    tournament_id: ID;
    round: number;
    team_a: string;
    team_b: string;
    ground_id: string;
    slot_id: string;
    starts_at: string;
    status: string;
    conflicts: string[];
    readiness_percentage: number;
}
export interface BulkFixtureImportItem {
    round: number;
    team_a: string;
    team_b: string;
    date: string;
    time_slot: string;
    ground_title?: string;
}
export interface SocialActivityItem {
    id: ID;
    actor_id: ID;
    actor_name: string;
    action_type: 'MATCH_STARTED' | 'WICKET_FALL' | 'CENTURY' | 'MATCH_WON' | 'TOURNAMENT_CHAMPION';
    title: string;
    details: string;
    timestamp: string;
}
export interface FollowTarget {
    user_id: ID;
    target_id: ID;
    target_type: 'TEAM' | 'PLAYER' | 'TOURNAMENT';
}
export interface MvpScorecard {
    match_id: ID;
    player_id: ID;
    player_name: string;
    team_name: string;
    batting_impact: number;
    bowling_impact: number;
    fielding_impact: number;
    total_impact_points: number;
    is_potm: boolean;
}
export interface ProviderCheckInRequest {
    booking_id: ID;
    provider_id: ID;
    otp: string;
    timestamp: string;
    geofence_coords?: {
        lat: number;
        lng: number;
    };
}
export interface MatchSignOffRequest {
    match_id: ID;
    captain_a_signed: boolean;
    captain_b_signed: boolean;
    official_signed: boolean;
    signoff_notes?: string;
}
export interface CouponValidationRequest {
    code: string;
    basket_value_minor: number;
    currency: string;
}
export interface CouponValidationResponse {
    valid: boolean;
    code: string;
    discount_minor: number;
    final_amount_minor: number;
    message: string;
}
export interface MatchNarrative {
    match_id: ID;
    headline: string;
    summary: string;
    turning_point: {
        over: number;
        ball: number;
        description: string;
        win_prob_swing: number;
    };
    key_performers: string[];
}
export interface ProcurementRecommendation {
    category: ProviderType;
    recommended_id: ID;
    title: string;
    match_score: number;
    trust_rating: number;
    price_minor: number;
    rationale: string;
}
export interface DynamicPriceQuote {
    slot_id: ID;
    base_price_minor: number;
    demand_multiplier: number;
    surge_minor: number;
    final_price_minor: number;
    is_peak: boolean;
}
export interface SponsorshipInventoryItem {
    id: ID;
    tournament_id: ID;
    tier: 'TITLE' | 'POWERED_BY' | 'BALL_SPONSOR' | 'PLAYER_OF_MATCH';
    title: string;
    pledge_amount_minor: number;
    currency: string;
    sponsor_name?: string;
    status: 'AVAILABLE' | 'PLEDGED' | 'CONFIRMED';
}
export interface BroadcastOverlayData {
    match_id: ID;
    batting_team: string;
    bowling_team: string;
    runs: number;
    wickets: number;
    overs: string;
    target?: number;
    striker: {
        name: string;
        runs: number;
        balls: number;
    };
    non_striker: {
        name: string;
        runs: number;
        balls: number;
    };
    bowler: {
        name: string;
        overs: string;
        maidens: number;
        runs: number;
        wickets: number;
    };
    recent_deliveries: string[];
}
export interface LogisticsTrackingInfo {
    order_id: ID;
    carrier: string;
    tracking_number: string;
    estimated_delivery: string;
    status: 'DISPATCHED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
}
export interface AuctionBidRequest {
    auction_id: ID;
    team_id: ID;
    player_id: ID;
    bid_amount_minor: number;
}
export interface AuctionBidResponse {
    bid_id: ID;
    status: 'ACCEPTED' | 'OUTBID' | 'REJECTED';
    current_highest_bid_minor: number;
    highest_bidder_team_id: ID;
}
export interface WeatherInsuranceClaim {
    booking_id: ID;
    match_id: ID;
    precipitation_mm: number;
    threshold_mm: number;
    status: 'VERIFIED' | 'REJECTED' | 'SETTLED';
    payout_minor: number;
}
//# sourceMappingURL=index.d.ts.map