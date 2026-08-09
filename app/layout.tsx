import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIAGC | Churches in the Cities",
  description: "Register for the Word In Action Global Conference, 17–19 September 2026 at Gallagher Convention Centre, Midrand.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
