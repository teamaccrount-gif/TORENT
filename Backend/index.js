import http from "http";
import { initSocket } from "./socket/socket.service.js";
import { startPgListener } from "./services/pgListener.service.js";
import "dotenv/config";
import express from "express";
import cors from "cors";

import filterRoutes from "./routers/filter.routes.js";
import latestRoutes from "./routers/latest.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.use("/api/v1/filter", filterRoutes);
app.use("/api/v1/filter", latestRoutes);

initSocket(server);
startPgListener();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});