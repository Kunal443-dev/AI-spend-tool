"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = 'mongodb://localhost:27017/ai-spend-audit';
    if (primaryUri && !primaryUri.includes('<db_password>')) {
        try {
            console.log(`Attempting connection to primary database...`);
            await mongoose_1.default.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
            console.log(`MongoDB Connected (Primary): ${primaryUri}`);
            return;
        }
        catch (error) {
            console.warn(`Primary MongoDB connection failed (${error.message || error}). Falling back to local database...`);
        }
    }
    else {
        console.log(`Primary MONGODB_URI is empty, invalid, or contains placeholders. Connecting to local database...`);
    }
    try {
        await mongoose_1.default.connect(fallbackUri);
        console.log(`MongoDB Connected (Local Fallback): ${fallbackUri}`);
    }
    catch (fallbackError) {
        console.error('Fallback MongoDB connection error:', fallbackError);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
