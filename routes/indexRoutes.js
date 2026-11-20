const router=require('express').Router();
const controller=require('../controllers/indexController');
const {isLoggedIn}=require('../middleware/auth');
router.get('/',controller.index);
router.get('/dashboard',isLoggedIn,controller.dashboard);
module.exports=router;
