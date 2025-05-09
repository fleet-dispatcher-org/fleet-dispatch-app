const express = require("express")
const env = require("dotenv").config()
const app = express()
const mongoose = require("mongoose")
const PORT = process.env.PORT || 3000

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })

// const db = mongoose.connection
// db.on("error", console.error.bind(console, "connection error:"))
// db.once("open", function () {
//     console.log("Connected successfully")
// })

app.get("/", (req, res) => {
    res.render("index")
});

app.listen(PORT, () => {
    console.log(`Vertex API Demo listening at http://localhost:${PORT}`); 
});