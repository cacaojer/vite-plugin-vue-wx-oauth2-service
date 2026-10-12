import https from "node:https";

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/*global URLSearchParams */
const currPath = dirname(fileURLToPath(import.meta.url));

const imgFavicon = join(currPath, "./img/favicon.png");
const html404 = join(currPath, "./html/404.html");
const htmlAuthorize = join(currPath, "./html/authorize.html");

const doGet = async (url, response) => {
  const pathname = url.split("?")[0];
  const params = new URLSearchParams(url.substring(url.indexOf("?")));
  return new Promise((res) => {
    switch (pathname) {
      case "/favicon.ico":
        response.setHeader("content-type", "image/x-icon");
        response.write(readFileSync(imgFavicon));
        break;
      case "/connect/oauth2/authorize":
        response.setHeader("content-type", "text/html");
        response.write(readFileSync(htmlAuthorize));
        break;
      case "/qy/getUser":
      case "/qy/weixin/getUser":
        response.setHeader("content-type", "application/json");
        response.write(JSON.stringify(getUser(params.get("alias"))));
        break;
      default:
        response.statusCode = 404;
        response.setHeader("content-type", "text/html");
        response.write(readFileSync(html404));
    }
    res();
  });
};

const getUser = (alias) => {
  const user = {
    id: "test_user_01",
    // carerId: params.get("carerId") ?? "QC666",
    name: "DevUser",
    alias,
  };
  return {
    code: 0,
    data: {
      ...user,
      content: {
        ...user,
      },
    },
    content: {
      ...user,
    },
  };
};

const createHttpServer = (params) => {
  const { alias = "", port = 20200, cert = {} } = params;

  if (!alias) {
    throw new Error("params.alias is null");
  }

  const options = {};
  if (cert?.key && cert?.cert) {
    options.key = readFileSync(params.cert.key);
    options.cert = readFileSync(params.cert.cert);
  }

  const server = https.createServer(options, (request, response) => {
    const { method, url } = request;
    // const { host } = headers
    request
      .on("error", (err) => {
        console.error(err);
      })
      .on("data", () => {
        // console.log("chunk", chunk)
      })
      .on("end", async () => {
        // body = Buffer.concat(body).toString()
        response.on("error", (err) => {
          console.error(err);
        });
        response.statusCode = 200;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("content-type", "application/json");

        switch (method) {
          case "OPTIONS":
            for (const [key, value] of Object.entries({
              "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers":
                "carerid, orgid, access_token, content-type",
            })) {
              response.setHeader(key, value);
            }
            break;
          case "GET":
            await doGet(url, response);
            break;
          case "POST":
          case "PUT":
            response.write(JSON.stringify({ code: 0, msg: "success" }));
            break;
          default:
            response.statusCode = 404;
            response.setHeader("content-type", "text/html");
            response.write(readFileSync(html404));
        }
        response.end();
      });
  });
  server.listen(
    {
      port,
    },
    () => {
      console.info(`vite-plugin-vue-wx-oauth2-server start, port: ${port}`);
    },
  );

  server.on("error", (e) => {
    console.error(e);
  });
};

// params option { port, alias }
const plugin = async (option) => {
  console.log("params: Object");
  console.log("  alias: required ");
  console.log("  port: server port, default 20200 ");
  console.log("  cert: { key, cert }, default {} ");

  const obj = {
    name: "vite-plugin-vue-wx-oauth2-authorize",
    apply: "serve",
    buildStart: () => {
      createHttpServer(option);
    },
    buildEnd: () => {
      console.debug("buildEnd");
    },
    closeBundle: () => {
      console.debug("closeBundle");
    },
  };
  return obj;
};

export { createHttpServer, plugin as default };
