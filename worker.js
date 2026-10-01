const TRACKED_DOWNLOADS = new Set([
  "/downloads/Etalon_Brand_Guide_2025.pdf",
  "/downloads/Etalon_Logos_All_Formats.zip",
  "/downloads/Etalon_Symbol_All_Formats.zip",
  "/downloads/Etalon_Map_All_Formats.zip",
  "/downloads/Gilroy.zip"
]);

const DOWNLOAD_TYPES = {
  ".zip": "application/zip",
  ".pdf": "application/pdf"
};

function isAutomatedRequest(request) {
  const userAgent = request.headers.get("user-agent") || "";
  return /curl|wget|bot|spider|crawler|github-actions|uptime/i.test(userAgent);
}

function downloadHeaders(response, pathname) {
  const headers = new Headers(response.headers);
  const filename = pathname.split("/").pop() || "download";
  const extension = filename.includes(".") ? "." + filename.split(".").pop().toLowerCase() : "";

  headers.set("content-disposition", `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
  headers.set("accept-ranges", "bytes");
  if (DOWNLOAD_TYPES[extension]) headers.set("content-type", DOWNLOAD_TYPES[extension]);
  return headers;
}

function parseSingleRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value || "");
  if (!match) return null;

  let start;
  let end;

  if (match[1] === "") {
    const suffixLength = Number(match[2]);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Number(match[2]);
  }

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return null;
  }

  end = Math.min(end, size - 1);
  return { start, end };
}

async function serveDownload(request, env, pathname) {
  // Always fetch the complete static asset first. Chrome can retry downloads
  // with Range requests; handling the range here avoids a browser-visible 404.
  const assetHeaders = new Headers(request.headers);
  assetHeaders.delete("range");
  assetHeaders.delete("if-range");

  const assetRequest = new Request(request.url, {
    method: "GET",
    headers: assetHeaders
  });
  const assetResponse = await env.ASSETS.fetch(assetRequest);
  if (!assetResponse.ok) return assetResponse;

  const headers = downloadHeaders(assetResponse, pathname);

  if (request.method === "HEAD") {
    return new Response(null, {
      status: 200,
      headers
    });
  }

  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    const body = await assetResponse.arrayBuffer();
    const range = parseSingleRange(rangeHeader, body.byteLength);

    if (!range) {
      headers.set("content-range", `bytes */${body.byteLength}`);
      headers.set("content-length", "0");
      return new Response(null, {
        status: 416,
        headers
      });
    }

    const chunk = body.slice(range.start, range.end + 1);
    headers.set("content-range", `bytes ${range.start}-${range.end}/${body.byteLength}`);
    headers.set("content-length", String(chunk.byteLength));

    return new Response(chunk, {
      status: 206,
      headers
    });
  }

  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isDownload = TRACKED_DOWNLOADS.has(url.pathname);

    const response = isDownload && (request.method === "GET" || request.method === "HEAD")
      ? await serveDownload(request, env, url.pathname)
      : await env.ASSETS.fetch(request);

    const shouldTrack =
      request.method === "GET" &&
      response.ok &&
      isDownload &&
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
