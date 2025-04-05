import { Router } from "express";
import userRoutes from "./user.route";

const router = Router();

// Health check route
router.get("/hello", (req, res) => {
    res.status(200).json({ message: "OK" });
});
router.use("/api/admin", userRoutes);

export default router;
