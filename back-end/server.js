const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();
const errorHandler = require('./middleware/errorMiddleware');
const{ connectDB } = require('./config/db');

const app = express();
app.use(express.json());

// Import Routes
const userRoutes = require('./routes/userRoutes');
const billingRoutes = require('./routes/billingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const breakdownRoutes = require('./routes/breakdownRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const modificationRoutes = require('./routes/modificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

app.use('/', userRoutes);
app.use('/', billingRoutes);
app.use('/', contactRoutes);
app.use('/', authRoutes);
app.use('/', servicesRoutes);
app.use('/', vehicleRoutes);
app.use('/', bookingRoutes);
app.use('/', assignmentRoutes);
app.use('/', breakdownRoutes);
app.use('/', inventoryRoutes);
app.use('/', modificationRoutes);
app.use('/', analyticsRoutes);
app.use('/', notificationRoutes);
app.use('/', settingsRoutes);

// Swagger Setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "Express API with Routes and Controller"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: [path.join(__dirname, 'routes', '*.js')],
};

const swaggerSpec = swaggerJsdoc(options);
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);
const port = process.env.PORT || 3000;

const startServer = async () => {
  const skipDb = process.env.SKIP_DB === 'true';

  try {
    if (!skipDb) {
      await connectDB();
    } else {
      console.warn('SKIP_DB=true, starting server without database connection.');
    }

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Database connection failed.');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();