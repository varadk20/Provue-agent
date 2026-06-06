import express from "express";
import askRouter from "./routes/ask";

const app = express();

app.use(express.json());

app.use("/", askRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});