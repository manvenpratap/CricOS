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

// API Contracts

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
