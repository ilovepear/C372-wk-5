const router=require('express').Router();
const controller=require('../controllers/adminController');
const {isAdmin}=require('../middleware/auth');
router.get('/admin/dashboard',isAdmin,controller.dashboard);
router.get('/admin/users',isAdmin,controller.listUsers);
router.get('/admin/users/:id',isAdmin,controller.viewUserDetails);
router.post('/admin/users/delete/:id',isAdmin,controller.deleteUser);
module.exports=router;
