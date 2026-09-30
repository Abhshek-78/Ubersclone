const http=require('http');

const port=process.env.PORT || 3000;

const app=require('./app');
const { initializeSocket } = require('./socket');
const connectToDb = require('./db/db');

async function startServer() {
    await connectToDb();
    const server = http.createServer(app);
    initializeSocket(server);
    server.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
});