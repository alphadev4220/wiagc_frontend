import type { Metadata } from "next";
import { EVENT, VENUE_LINE } from "../lib/event";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIAGC | Churches in the Cities",
  description: `Register for the Word In Action Global Conference, ${EVENT.dates} at ${VENUE_LINE}.`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
