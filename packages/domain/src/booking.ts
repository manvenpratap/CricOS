import { BookingStatus, HoldStatus } from '@cricket-platform/contracts';

export interface ServiceSlot {
  id: string;
  listingId: string;
  startsAt: Date;
  endsAt: Date;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  capacity: number;
  version: number;
}

export interface InventoryHold {
  id: string;
  slotId: string;
  userId?: string;
  heldUntil: Date;
  status: HoldStatus;
  createdAt: Date;
}

export interface Booking {
  id: string;
  slotId: string;
  orderId: string;
  providerId: string;
  listingId: string;
  bookedByUserId: string;
  status: BookingStatus;
  startsAt: Date;
  endsAt: Date;
  priceMinor: number;
  currency: string;
  createdAt: Date;
}

export function isHoldExpired(hold: InventoryHold, now: Date = new Date()): boolean {
  return hold.status === 'EXPIRED' || (hold.status === 'ACTIVE' && hold.heldUntil.getTime() <= now.getTime());
}
