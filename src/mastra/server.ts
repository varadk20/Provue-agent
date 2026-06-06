import express from "express";
import askRouter from "./routes/ask";

const app = express();

app.use(express.json());

app.use("/", askRouter);

const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.json({
    status: "running",
    version: "latest"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
