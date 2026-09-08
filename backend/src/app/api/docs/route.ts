/*
  Swagger UI for the API, served at GET /api/docs. Loads the spec from
  /api/openapi.json and Swagger UI assets from a CDN (no build-time deps).
*/
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MKSM Backend API — Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css" />
  <style>body{margin:0}.topbar{display:none}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/api/openapi.json",
      dom_id: "#swagger-ui",
      deepLinking: true,
      persistAuthorization: true,
      tryItOutEnabled: true,
    });
  </script>
</body>
</html>`;

export function GET() {
  return new Response(HTML, {
    headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
