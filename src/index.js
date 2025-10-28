import Authorize from "./oauth2/authorize.html"
import urlCheck from "./url-check.js"

import http from "node:http"

import { readFileSync, renameSync, writeFileSync, copyFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// tls: {
// key: "./.cert/key.pem",
// cert: "./.cert/cert.pem"
// },

const get = async (url, response) => {
  const pathname = url.split("?")[0]
  const params = new URLSearchParams(url.substring(url.indexOf("?")))
  return new Promise((res) => {
    switch (pathname) {
      case "/favicon.ico": {
        response.setHeader("Content-Type", "image/x-icon")
        const file = readFileSync(join(__dirname, "./favicon.ico"))
        response.write(file)
        break
      }
      case "/connect/oauth2/authorize":
        response.setHeader("Content-Type", "text/html")
        const file = readFileSync(join(__dirname, "./oauth2/authorize.html"))
        response.write(file)
        break
      case "/qy/getUser":
      case "/qy/weixin/getUser": {
        const user = {
          id: "user-id-demo",
          // carerId: params.get("carerId") ?? "QC666",
          name: "DevUser",
          alias: params.get("alias") ?? "QC666",
        }
        const data = JSON.stringify(
          {
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
          },
          {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          },
        )
        response.setHeader("Content-Type", "application/json")
        response.write(data)
        break
      }
      default: {
        // response.setHeader("Content-Type", "image/x-icon")
        const file = readFileSync(join(__dirname, "./404.html"))
        response.setHeader("Access-Control-Allow-Origin", "*")
        response.statusCode = 200
        response.write(file)
      }
    }
    res()
  })
}

// const __dirname = fileURLToPath(new URL(".", import.meta.url))
async function plugin({ port = 20200 }) {
  const obj = {
    name: "vite-plugin-vue-wx-oauth2-authorize",
    fn: () => {
      http
        .createServer((request, response) => {
          const { headers, method, url } = request
          const { host } = headers
          request
            .on("error", (err) => {
              console.error(err)
            })
            .on("data", (chunk) => {
              console.log("chunk", chunk)
              // body.push(chunk)
            })
            .on("end", async () => {
              // body = Buffer.concat(body).toString()
              response.on("error", (err) => {
                console.error(err)
              })
              response.statusCode = 200
              switch (method) {
                case "OPTIONS":
                  for (const [key, value] of Object.entries({
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods":
                      "POST, GET, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "carerid, orgid",
                  })) {
                    response.setHeader(key, value)
                  }
                  break
                case "GET":
                  await get(url, response)
                  break
                case "POST":
                case "PUT":
                default:
                  response.setHeader("Content-Type", "application/json")
                  response.write(JSON.stringify({ code: 0 }))
              }
              response.end()
            })
        })
        .listen(
          {
            port,
          },
          (val) => {
            console.info(" http server start, port: ${port}")
          },
        )
    },
  }
  return obj
}

export default plugin
