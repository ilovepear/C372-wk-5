const router=require('express').Router();
const controller=require('../controllers/reminderController');
const {isLoggedIn}=require('../middleware/auth');
router.get('/reminders',isLoggedIn,controller.list);
router.post('/reminders',isLoggedIn,controller.create);
router.post('/reminders/:id/toggle',isLoggedIn,controller.toggle);
router.post('/reminders/:id/delete',isLoggedIn,controller.remove);
module.exports=router;
