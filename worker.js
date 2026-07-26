const TRACKED_DOWNLOADS = new Set([
  "/downloads/Etalon_Brand_Guide_2025.pdf",
  "/downloads/Etalon_Logos_All_Formats.zip",
  "/downloads/Etalon_Symbol_All_Formats.zip",
  "/downloads/Etalon_Map_All_Formats.zip",
  "/downloads/Gilroy.zip"
]);

function isAutomatedRequest(request) {
  const userAgent = request.headers.get("user-agent") || "";
  return /curl|wget|bot|spider|crawler|github-actions|uptime/i.test(userAgent);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    const shouldTrack =
      request.method === "GET" &&
      response.ok &&
      TRACKED_DOWNLOADS.has(url.pathname) &&
      !request.headers.has("range") &&
      !isAutomatedRequest(request);

    if (shouldTrack) {
      console.log({
        event: "brand_download",
        file: url.pathname.split("/").pop() || url.pathname,
        country: request.cf?.country || "XX",
        bytes: Number(response.headers.get("content-length") || 0)
      });
    }

    return response;
  }
};
