import { cookies } from "next/headers";
import Cover from "./cover";
import RegistrationForm from "./registration-form";
import { PREVIEW_COOKIE, registrationOpen } from "../lib/gate";

// The form itself is a client component (four steps of local state) and cannot decide whether it
// is covered: an env check inside it would ship to the browser and be trivially edited away.
// This server component owns the decision and the form stays untouched underneath.
//
// The cover lives here rather than in layout.tsx on purpose -- /verify/[code] must keep working
// for delegates who already hold a confirmation code, and a layout-level cover would hide it too.
export default async function Home() {
  const preview = (await cookies()).get(PREVIEW_COOKIE)?.value === "on";
  const covered = !registrationOpen() && !preview;
  return (
    <>
      <RegistrationForm />
      {covered && <Cover />}
    </>
  );
}
