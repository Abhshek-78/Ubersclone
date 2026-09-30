const http=require('http');

const port = process.env.PORT;

const app=require('./app');
const { initializeSocket } = require('./socket');
const connectToDb = require('./db/db');

const requiredEnvironment = ['MONGODB_URI', 'JWT_SECRET', 'MAPBOX_API', 'PORT', 'CLIENT_ORIGIN'];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
if (missingEnvironment.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
}

async function startServer() {
    await connectToDb();
    const server = http.createServer(app);
    initializeSocket(server);
    server.listen(port, () => {
        const address = server.address();
        const boundPort = typeof address === 'object' && address ? address.port : port;
        console.log(`Server listening on port ${boundPort}`);
    });
}

startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
});