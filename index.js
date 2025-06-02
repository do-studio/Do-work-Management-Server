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
app.use(express.json()); // Add this to parse JSON bodies
expressConfig(app)

// Error Handling Middleware
// errorHandler(app)

// Routes Configurations
routes(app)


app.post('/bulk', async (req, res) => {
   try {
    const items = req.body; // Expecting an array of items
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items should be an array' });
    }

    const result = await BillingModel.insertMany(items);
    res.status(201).json({ message: 'Items added successfully', data: result });
  } catch (err) {
    res.status(500).json({ message: 'Error adding items', error: err.message });
  }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// Connecting the Atlas database
mongoDBConnect()

// Starting the server
serverConnection(server)