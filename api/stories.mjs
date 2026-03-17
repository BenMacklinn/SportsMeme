import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { getStoriesPayload } = require("../server.js");

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "1";

    try {
      const payload = await getStoriesPayload(forceRefresh);
      return Response.json(payload, {
        status: 200,
        headers: {
          "Cache-Control": forceRefresh
            ? "no-store"
            : "s-maxage=300, stale-while-revalidate=600",
        },
      });
    } catch (error) {
      return Response.json(
        {
          error: "Unable to fetch live feeds",
          details: error instanceof Error ? error.message : String(error),
        },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }
  },
};
