import QRCode from "qrcode";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.toUpperCase() ?? "";
  if (!/^WIA26-[A-Z0-9]{8}$/.test(code)) return new Response("Invalid confirmation code", { status: 400 });
  const verifyUrl = `${url.origin}/verify/${code}`;
  const svg = await QRCode.toString(verifyUrl, { type: "svg", width: 320, margin: 2, color: { dark: "#071521", light: "#ffffff" }, errorCorrectionLevel: "H" });
  return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
}
