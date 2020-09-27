const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,        // creates index
    useFindAndModify: false
})

// /Users/DISHA/mongodb/bin/mongod.exe --dbpath=/Users/DISHA/mongodb-data