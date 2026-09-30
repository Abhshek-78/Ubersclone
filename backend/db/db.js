const mongoose = require("mongoose");

async function connectToDb() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is required to connect to MongoDB Atlas");
    }

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
        console.log(`Connected to MongoDB Atlas: ${mongoose.connection.name}`);

        try {
            await mongoose.connection.collection("users").dropIndex("fullname.email_1");
            console.log("Dropped stale fullname.email index");
        } catch (err) {
            if (err.codeName !== "IndexNotFound" && err.code !== 27) {
                console.log("Index cleanup warning:", err.message);
            }
        }
    } catch (err) {
        console.error("MongoDB Atlas connection failed:", err.message);
        throw err;
    }
}

module.exports = connectToDb;