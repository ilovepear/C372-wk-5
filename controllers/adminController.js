const users=require('../models/userModel');
const pets=require('../models/petModel');
const journals=require('../models/journalModel');
const {positiveId}=require('../helpers/validation');
const {asyncHandler}=require('../helpers/http');
const dashboard=(_req,res)=>res.render('adminDashboard');
const listUsers=asyncHandler(async(req,res)=>res.render('adminUsers',{users:await users.getAllUsers()}));
const viewUserDetails=asyncHandler(async(req,res)=>{
  const id=positiveId(req.params.id);
  if (!id) return res.status(404).send('User not found');
  const user=await users.getUserById(id);
  if (!user) return res.status(404).send('User not found');
  const [petRecords,entries]=await Promise.all([pets.getPetsByOwner(id),journals.list(id)]);
  res.render('adminUserDetails',{user,pets:petRecords,journals:entries});
});
const deleteUser=asyncHandler(async(req,res)=>{
  const id=positiveId(req.params.id);
  if (!id||id===req.session.user.id||!await users.deleteUser(id))req.flash('error','User could not be deleted.');
  else req.flash('success','Customer account deleted.');
  res.redirect('/admin/users');
});
module.exports={dashboard,listUsers,viewUserDetails,deleteUser};
