const connectToMongo = require("./db");
const express = require('express')
const cors = require('cors')
const dotenv = require("dotenv")
dotenv.config()

connectToMongo();

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
  console.log(`Inotebook-Backend listening on port ${port}`)
})