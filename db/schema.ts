import { sql } from "drizzle-orm";
import { blob, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  confirmationCode: text("confirmation_code").notNull(),
  title: text("title").notNull().default(""),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull().default(""),
  churchOrganisation: text("church_organisation").notNull().default(""),
  role: text("role").notNull().default(""),
  ticketType: text("ticket_type").notNull(),
  attendanceDays: text("attendance_days").notNull(),
  accommodation: text("accommodation").notNull(),
  roomType: text("room_type").notNull().default(""),
  checkIn: text("check_in").notNull().default(""),
  checkOut: text("check_out").notNull().default(""),
  airportTransfer: text("airport_transfer").notNull(),
  arrivalAirport: text("arrival_airport").notNull().default(""),
  arrivalFlight: text("arrival_flight").notNull().default(""),
  arrivalDateTime: text("arrival_datetime").notNull().default(""),
  departureFlight: text("departure_flight").notNull().default(""),
  departureDateTime: text("departure_datetime").notNull().default(""),
  hotelShuttle: text("hotel_shuttle").notNull(),
  mealPreference: text("meal_preference").notNull(),
  dietaryNeeds: text("dietary_needs").notNull().default(""),
  accessibilityNeeds: text("accessibility_needs").notNull().default(""),
  emergencyName: text("emergency_name").notNull().default(""),
  emergencyPhone: text("emergency_phone").notNull().default(""),
  paymentStatus: text("payment_status").notNull().default("pending"),
  emailStatus: text("email_status").notNull().default("pending"),
  notes: text("notes").notNull().default(""),
  consent: integer("consent", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("registrations_confirmation_code_unique").on(table.confirmationCode),
]);

// SPEAKERS AND HOSTS, editable from /admin.
//
// These used to be three hardcoded arrays in the registration form, so adding a guest speaker
// meant a code change, a build and a restart. The conference office needs to do it themselves.
//
// PHOTOS ARE STORED HERE AS BYTES, not as files under public/. Next snapshots public/ at build
// time and returns 404 for anything written there afterwards (verified), so an uploaded file
// would simply not be served. Keeping the bytes in SQLite also means the whole site's content is
// one file to back up, with no orphaned images. The originally shipped portraits keep their
// public/ paths -- they ARE in the build -- which is why both columns exist.
export const speakers = sqliteTable("speakers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // "key" (key guest speakers), "host" (conference hosts), "guest" (confirmed guest speakers)
  group: text("group").notNull().default("guest"),
  name: text("name").notNull(),
  country: text("country").notNull().default(""),
  role: text("role").notNull().default("Guest Speaker"),
  bio: text("bio").notNull().default(""),
  photoPath: text("photo_path").notNull().default(""),
  photoData: blob("photo_data", { mode: "buffer" }),
  photoType: text("photo_type").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
