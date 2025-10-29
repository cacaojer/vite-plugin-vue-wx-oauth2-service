import https from "node:https"

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/*global URLSearchParams console */
const currPath = dirname(fileURLToPath(import.meta.url))

const pemKey = join(currPath, "./cert/key.pem")
const pemCert = join(currPath, "./cert/cert.pem")
const imgFavicon = join(currPath, "./img/favicon.png")
const html404 = join(currPath, "./html/404.html")
const htmlAuthorize = join(currPath, "./html/authorize.html")

const doGet = async (url, response) => {
  const pathname = url.split("?")[0]
  const params = new URLSearchParams(url.substring(url.indexOf("?")))
  return new Promise((res) => {
    switch (pathname) {
      case "/favicon.ico":
        response.setHeader("Content-Type", "image/x-icon")
        response.write(readFileSync(imgFavicon))
        break
      case "/connect/oauth2/authorize":
        response.setHeader("Content-Type", "text/html")
        response.write(readFileSync(htmlAuthorize))
        break
      case "/qy/getUser":
      case "/qy/weixin/getUser":
        response.setHeader("Content-Type", "application/json")
        response.write(JSON.stringify(getUser(params.get("alias") ?? "QC666")))
        break
      default:
        response.statusCode = 404
        response.setHeader("Content-Type", "text/html")
        response.write(readFileSync(html404))
    }
    res()
  })
}

const getUser = (alias) => {
  const user = {
    id: "test_user_01",
    // carerId: params.get("carerId") ?? "QC666",
    name: "DevUser",
    alias,
  }
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
  }
}

const createHttpServer = (port) => {
  const options = {
    key: readFileSync(pemKey),
    cert: readFileSync(pemCert),
  }

  const server = https.createServer(options, (request, response) => {
    const { method, url } = request
    // const { host } = headers
    request
      .on("error", (err) => {
        console.error(err)
      })
      .on("data", () => {
        // console.log("chunk", chunk)
      })
      .on("end", async () => {
        // body = Buffer.concat(body).toString()
        response.on("error", (err) => {
          console.error(err)
        })
        response.statusCode = 200
        response.setHeader("Access-Control-Allow-Origin", "*")

        switch (method) {
          case "OPTIONS":
            for (const [key, value] of Object.entries({
              "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "carerid, orgid",
            })) {
              response.setHeader(key, value)
            }
            break
          case "GET":
            await doGet(url, response)
            break
          case "POST":
          case "PUT":
          default:
            response.statusCode = 404
            response.setHeader("Content-Type", "text/html")
            response.write(readFileSync(html404))
        }
        response.end()
      })
  })
  server.listen(
    {
      port,
    },
    () => {
      console.info(`vite-plugin-vue-wx-oauth2-server start, port: ${port}`)
    },
  )

  server.on("error", (e) => {
    console.error(e)
  })
}

async function plugin({ port } = { port: 20200 }) {
  const obj = {
    name: "vite-plugin-vue-wx-oauth2-authorize",
    buildStart: () => {
      createHttpServer(port)
    },
    buildEnd: () => {
      console.debug("buildEnd")
    },
    closeBundle: () => {
      console.debug("closeBundle")
    },
  }
  return obj
}

export default plugin
