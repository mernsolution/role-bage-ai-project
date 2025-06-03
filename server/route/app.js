import express from 'express';
import authController from '../controller/AuthController.js';
const router = express.Router();

router.post('/signup', authController.userSignup);
router.post("/sign-in", authController.authLogin);
router.post("/logout", authController.logout);
router.get('/check-shop-name', authController.checkShopNameAvailability);
router.get('/check-username', authController.checkUserNameAvailability);
router.get('/shop-name', authController.getShopNames);
router.get("/check-session", authController.checkSession);

export default router;