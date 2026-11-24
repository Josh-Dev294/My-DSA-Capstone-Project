import {
  addTier,
  bookTickets,
  cancelBooking,
  createEvent,
  createStore,
  findBookingByReference,
  joinWaitlist
} from "../src/domain/inventory.js";

const store = createStore();
const event = createEvent(store, {
  title: "Summer Sounds",
  city: "Lagos",
  venue: "Freedom Park",
  date: "2027-07-18"
});
const tier = addTier(store, event.id, {
  name: "General admission",
  priceCents: 12500,
  capacity: 3
});

console.log(`${event.title} tickets are on sale (${tier.capacity} seats).`);

const adaBooking = bookTickets(store, {
  eventId: event.id,
  tierId: tier.id,
  attendeeName: "Ada",
  quantity: 2
});
console.log(`Ada books ${adaBooking.quantity} of ${tier.capacity} seats.`);

try {
  bookTickets(store, {
    eventId: event.id,
    tierId: tier.id,
    attendeeName: "Bayo",
    quantity: 2
  });
} catch (error) {
  if (error.code !== "SOLD_OUT") {
    throw error;
  }
  console.log(`Bayo is refused for asking for 2 with only 1 seat left (${error.code}).`);
}

bookTickets(store, {
  eventId: event.id,
  tierId: tier.id,
  attendeeName: "Chika",
  quantity: 1
});
console.log(`Chika books the last seat. The tier is sold out.`);
console.log(`Booking lookup by reference: ${findBookingByReference(store, adaBooking.reference).attendeeName} (${adaBooking.reference}).`);

joinWaitlist(store, { eventId: event.id, tierId: tier.id, attendeeName: "Dara" });
joinWaitlist(store, { eventId: event.id, tierId: tier.id, attendeeName: "Efe" });
console.log("Dara and Efe join the waitlist, in that order.");

cancelBooking(store, adaBooking.reference);
console.log(`Ada cancels. ${tier.capacity - tier.sold} seat(s) are now available.`);
console.log(`The next person in line is ${tier.waitlist.peek().attendeeName}.`);
