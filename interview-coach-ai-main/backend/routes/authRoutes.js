import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, changeUserPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRegister, validateLogin } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/register',        validateRegister, registerUser);
router.post('/login',           validateLogin,    loginUser);
router.get('/profile',          protect,          getUserProfile);
router.put('/profile',          protect,          updateUserProfile);
router.put('/change-password',  protect,          changeUserPassword);

export default router;
