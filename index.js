import express from 'express'
import http from 'http'
import serverConnection from './config/serverConnection.js';
import mongoDBConnect from './config/dbConnection.js';
import expressConfig from './middlewares/expressMiddlewares.js'
// import errorHandler from './middlewares/errorHandler.js'
import routes from './routes/index.js'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path'
import socketConfig from './routes/socketRoute.js';
import configKeys from './config/configKeys.js';
import BillingModel from './models/billing.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const server = http.createServer(app)

// Socket CORS config
const io = new Server(server, {
    cors: {
        origin: [
            configKeys.CLIENT_URL
        ],
        methods: ['GET', 'POST']
    }
})

app.set("socketio", io);

// Socket.io connection
socketConfig(io)

// Middleware 
expressConfig(app)

// Error Handling Middleware
// errorHandler(app)

// Routes Configurations
routes(app)


app.post('/bulk', async (req, res) => {
   try {
    await BillingModel.deleteMany({});
    res.status(200).json({ message: 'All billing records deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting records', error });
  }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// Connecting the Atlas database
mongoDBConnect()

// Starting the server
serverConnection(server)