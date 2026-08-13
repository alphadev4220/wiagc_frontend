import { GROUPS, MAX_PHOTO_BYTES, MAX_PHOTO_MB } from "../../../../lib/speakers";

// Shared multipart parsing for create and update.
//
// The photo arrives as a file part, so the body is form-data rather than JSON. Limits are
// enforced here rather than trusted from the browser: a <input accept="image/*"> is a hint to
// the file picker, not a constraint on what gets posted.
export type SpeakerValues = {
  group: string; name: string; country: string; role: string; bio: string; sortOrder: number;
};

export async function readSpeakerForm(request: Request): Promise<
  { values: SpeakerValues; photo: { data: Buffer; type: string } | null; clearPhoto: boolean }
  | { error: string; status: number }
> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return { error: "Expected a form submission.", status: 400 };
  }

  const text = (key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);
  const group = text("group", 20);
  const known = GROUPS.find((g) => g.value === group);
  if (!known) return { error: "Unknown speaker group.", status: 400 };

  const values: SpeakerValues = {
    group,
    name: text("name", 120),
    country: text("country", 100),
    // Falls back to the group's standard label so the office never has to think about it.
    role: text("role", 60) || known.role,
    bio: text("bio", 4000),
    sortOrder: Number.parseInt(text("sortOrder", 6), 10) || 0,
  };

  const file = form.get("photo");
  let photo: { data: Buffer; type: string } | null = null;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return { error: "The photo must be an image file.", status: 400 };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return {
        error: `That photo is ${(file.size / 1048576).toFixed(1)} MB. The limit is ${MAX_PHOTO_MB} MB.`,
        status: 413,
      };
    }
    photo = { data: Buffer.from(await file.arrayBuffer()), type: file.type };
  }
  return { values, photo, clearPhoto: String(form.get("clearPhoto") ?? "") === "1" };
}
