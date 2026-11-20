const router=require('express').Router();
const controller=require('../controllers/paymentController');
const {isLoggedIn}=require('../middleware/auth');
router.get('/payments/prepare/:serviceId',isLoggedIn,controller.preparePayment);
router.post('/payments/mock/:serviceId',isLoggedIn,controller.createMockPayment);
module.exports=router;
