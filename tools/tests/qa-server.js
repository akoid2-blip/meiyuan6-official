const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const port = Number(process.argv[2] || 8765);
const types = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml"};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  if (pathname === "/qa.html") {
    return fs.readFile(path.join(root, "index.html"), "utf8", (error, html) => {
      if (error) {
        response.writeHead(500);
        return response.end(error.message);
      }
      response.writeHead(200, {"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});
      response.end(html.replace("assets/cloud-runtime-config.js", "tools/tests/qa-cloud-runtime-config.js"));
    });
  }
  const target = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!target.startsWith(root)) {
    response.writeHead(403);
    return response.end("Forbidden");
  }
  fs.readFile(target, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      return response.end(error.message);
    }
    response.writeHead(200, {"Content-Type":types[path.extname(target)] || "application/octet-stream","Cache-Control":"no-store"});
    response.end(content);
  });
}).listen(port, "127.0.0.1");
