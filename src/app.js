import express from "express";
import cors from "cors";
import apiRoutes from "../src/routes/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("Pooja Management API is running...");
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .json({ message: "Invalid JSON payload passed.", error: err.message });
  }

  res
    .status(err.status || 500)
    .json({ message: "Something went wrong!", error: err.message });
});

export default app;
