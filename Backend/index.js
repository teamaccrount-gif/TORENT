import http from "http";
import { initSocket } from "./socket/socket.service.js";
import { startPgListener } from "./services/pgListener.service.js";
import "dotenv/config";
import express from "express";
import cors from "cors";

import filterRoutes from "./routers/filter.routes.js";
import latestRoutes from "./routers/latest.routes.js";
import tableRoutes from "./routers/table.routes.js";
import authRoutes from "./routers/auth.routes.js";
import userRoutes from "./routers/user.routes.js";

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
app.use("/api/v1/tables", tableRoutes);
app.use("/api/v1/auth",  authRoutes);
app.use("/api/v1/users", userRoutes);

initSocket(server);
startPgListener();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});