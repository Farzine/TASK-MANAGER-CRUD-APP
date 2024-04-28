const PORT = process.env.PORT || 3000;
const express = require("express");

const db = require("./db");
const userRouter = require("./user");
const taskRouter = require("./routes");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", userRouter);
app.use("/", taskRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
