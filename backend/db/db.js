const mongoose = require("mongoose");

async function connectToDb() {
    try {
        await mongoose.connect(process.env.DBCONNECT);
        console.log("Connected to DB");

        try {
            await mongoose.connection.collection("users").dropIndex("fullname.email_1");
            console.log("Dropped stale fullname.email index");
        } catch (err) {
            if (err.codeName !== "IndexNotFound" && err.code !== 27) {
                console.log("Index cleanup warning:", err.message);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectToDb;