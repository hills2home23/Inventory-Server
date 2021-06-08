const mongoose = require("mongoose");
const app = require("./index");
// mongodb+srv://hills2home:<password>@cluster0.ikfbh.mongodb.net/<dbname>?retryWrites=true&w=majority
const DB ="mongodb+srv://hills2home:hills2home@cluster0.ikfbh.mongodb.net/Inventory?retryWrites=true&w=majority";
//const DB ="mongodb://localhost:27017/h2h";

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Datbase Connected"));

const port = process.env.PORT || 7000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});