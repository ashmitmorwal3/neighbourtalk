"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const alerts_1 = require("./routes/alerts");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB Connection
mongoose_1.default
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/neighbour-alert")
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));
// Routes
app.use("/api/alerts", alerts_1.alertRouter);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
