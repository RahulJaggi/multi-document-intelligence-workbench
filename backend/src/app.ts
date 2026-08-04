import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRouter from './routes/index';
import { errorHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logging Middleware
app.use(morgan('dev'));

// Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
