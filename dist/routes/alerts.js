"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertRouter = void 0;
const express_1 = __importDefault(require("express"));
const Alert_1 = require("../models/Alert");
const router = express_1.default.Router();
// Get all alerts
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alerts = yield Alert_1.Alert.find().sort({ createdAt: -1 });
        res.json(alerts);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}));
// Create new alert
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alert = new Alert_1.Alert(req.body);
        yield alert.save();
        res.status(201).json(alert);
    }
    catch (error) {
        res.status(400).json({ message: "Invalid data" });
    }
}));
// Delete alert
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Alert_1.Alert.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Alert deleted" });
    }
    catch (error) {
        res.status(404).json({ message: "Alert not found" });
    }
}));
exports.alertRouter = router;
