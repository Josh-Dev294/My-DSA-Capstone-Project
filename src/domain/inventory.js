import { DomainError } from "./errors.js";
import { newId, newReference } from "./ids.js";
import { Queue } from "./waitlistQueue.js";

function requireRecord(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new DomainError(`${label} must be an object.`, "VALIDATION");
  }
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new DomainError(`${label} must be a non-empty string.`, "VALIDATION");
  }

  return value.trim();
}

function requirePositiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new DomainError(`${label} must be a positive whole number.`, "VALIDATION");
  }
}

function requireStore(store) {
  requireRecord(store, "Store");
  if (
    !(store.events instanceof Map) ||
    !(store.tiers instanceof Map) ||
    !(store.bookingsByReference instanceof Map)
  ) {
    throw new DomainError("Store was not created by createStore().", "VALIDATION");
  }
}

function findTier(store, eventId, tierId) {
  const eventKey = requireText(eventId, "Event id");
  const tierKey = requireText(tierId, "Tier id");
  const event = store.events.get(eventKey);

  if (!event) {
    throw new DomainError(`Event ${eventKey} was not found.`, "NOT_FOUND");
  }

  const tier = store.tiers.get(tierKey);
  if (!tier || tier.eventId !== eventKey) {
    throw new DomainError(`Tier ${tierKey} was not found for this event.`, "NOT_FOUND");
  }

  return tier;
}

export function createStore() {
  return {
    events: new Map(),
    tiers: new Map(),
    bookingsByReference: new Map()
  };
}

export function createEvent(store, details) {
  requireStore(store);
  requireRecord(details, "Event details");

  const title = requireText(details.title, "Event title");
  const city = requireText(details.city, "Event city");
  const venue = requireText(details.venue, "Event venue");
  const date = requireText(details.date, "Event date");
  if (!Number.isFinite(Date.parse(date))) {
    throw new DomainError("Event date must be a valid date string.", "VALIDATION");
  }

  const event = {
    id: newId(),
    title,
    city,
    venue,
    date
  };

  store.events.set(event.id, event);
  return event;
}

export function addTier(store, eventId, details) {
  requireStore(store);
  requireRecord(details, "Tier details");

  const eventKey = requireText(eventId, "Event id");
  if (!store.events.has(eventKey)) {
    throw new DomainError(`Event ${eventKey} was not found.`, "NOT_FOUND");
  }

  const name = requireText(details.name, "Tier name");
  if (!Number.isSafeInteger(details.priceCents) || details.priceCents < 0) {
    throw new DomainError("Tier price must be a non-negative whole number of cents.", "VALIDATION");
  }
  requirePositiveInteger(details.capacity, "Tier capacity");

  const tier = {
    id: newId(),
    eventId: eventKey,
    name,
    priceCents: details.priceCents,
    capacity: details.capacity,
    sold: 0,
    waitlist: new Queue()
  };

  store.tiers.set(tier.id, tier);
  return tier;
}

export function bookTickets(store, details) {
  requireStore(store);
  requireRecord(details, "Booking details");

  const tier = findTier(store, details.eventId, details.tierId);
  const attendeeName = requireText(details.attendeeName, "Attendee name");
  const quantity = details.quantity;
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new DomainError("A booking must contain from 1 to 10 tickets.", "VALIDATION");
  }

  const totalCents = tier.priceCents * quantity;
  if (!Number.isSafeInteger(totalCents)) {
    throw new DomainError("Booking total exceeds the supported whole-cent amount.", "VALIDATION");
  }

  if (tier.capacity - tier.sold < quantity) {
    throw new DomainError(
      `Only ${tier.capacity - tier.sold} seat(s) remain in this tier.`,
      "SOLD_OUT"
    );
  }

  let reference = newReference();
  while (store.bookingsByReference.has(reference)) {
    reference = newReference();
  }

  const booking = {
    id: newId(),
    reference,
    eventId: tier.eventId,
    tierId: tier.id,
    attendeeName,
    quantity,
    totalCents,
    status: "confirmed"
  };

  tier.sold += quantity;
  store.bookingsByReference.set(reference, booking);
  return booking;
}

export function cancelBooking(store, reference) {
  requireStore(store);
  const bookingReference = requireText(reference, "Booking reference");
  const booking = store.bookingsByReference.get(bookingReference);

  if (!booking) {
    throw new DomainError(`Booking ${bookingReference} was not found.`, "NOT_FOUND");
  }
  if (booking.status === "cancelled") {
    throw new DomainError("Booking has already been cancelled.", "INVALID_STATE");
  }

  const tier = store.tiers.get(booking.tierId);
  if (!tier) {
    throw new DomainError("The booking's ticket tier was not found.", "NOT_FOUND");
  }

  tier.sold -= booking.quantity;
  booking.status = "cancelled";
  return booking;
}

export function findBookingByReference(store, reference) {
  requireStore(store);
  const bookingReference = requireText(reference, "Booking reference");
  const booking = store.bookingsByReference.get(bookingReference);

  if (!booking) {
    throw new DomainError(`Booking ${bookingReference} was not found.`, "NOT_FOUND");
  }

  return booking;
}

export function joinWaitlist(store, details) {
  requireStore(store);
  requireRecord(details, "Waitlist details");

  const tier = findTier(store, details.eventId, details.tierId);
  const attendeeName = requireText(details.attendeeName, "Attendee name");
  if (tier.capacity - tier.sold > 0) {
    throw new DomainError("This ticket tier still has seats available.", "NOT_SOLD_OUT");
  }

  const entry = {
    id: newId(),
    eventId: tier.eventId,
    tierId: tier.id,
    attendeeName
  };
  tier.waitlist.enqueue(entry);
  return entry;
}
