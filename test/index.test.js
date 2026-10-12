import { createHttpServer } from "../src/index.js"

const config = {
  port: 20200,
  alias: "QC2509",
}
createHttpServer(config)
