const router=require('express').Router();
const controller=require('../controllers/serviceController');
const {isLoggedIn}=require('../middleware/auth');
router.get('/services',isLoggedIn,controller.servicePage);
router.post('/services/book',isLoggedIn,controller.book);
router.get('/bookings',isLoggedIn,controller.history);
module.exports=router;
