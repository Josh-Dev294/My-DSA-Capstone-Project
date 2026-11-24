import { performance } from "node:perf_hooks";

const BOOKING_COUNT = 100_000;
const LOOKUP_COUNT = 500;
const bookings = Array.from({ length: BOOKING_COUNT }, (_, index) => ({
  reference: `BOOKING-${String(index).padStart(6, "0")}`,
  attendeeName: `Attendee ${index}`
}));
const bookingsByReference = new Map(
  bookings.map((booking) => [booking.reference, booking])
);
const targetReference = bookings[bookings.length - 1].reference;

let result;
const findStart = performance.now();
for (let index = 0; index < LOOKUP_COUNT; index += 1) {
  result = bookings.find((booking) => booking.reference === targetReference);
}
const findMilliseconds = performance.now() - findStart;

const mapStart = performance.now();
for (let index = 0; index < LOOKUP_COUNT; index += 1) {
  result = bookingsByReference.get(targetReference);
}
const mapMilliseconds = performance.now() - mapStart;

if (!result) {
  throw new Error("Benchmark lookup did not find the target booking.");
}

console.log(`Bookings: ${BOOKING_COUNT.toLocaleString()}`);
console.log(`Lookups: ${LOOKUP_COUNT.toLocaleString()}`);
console.log(`Array.find: ${findMilliseconds.toFixed(3)} ms`);
console.log(`Map.get:    ${mapMilliseconds.toFixed(3)} ms`);
