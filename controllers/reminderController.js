const model=require('../models/reminderModel');
const pets=require('../models/petModel');
const {positiveId,cleanText,realDate}=require('../helpers/validation');
const {asyncHandler}=require('../helpers/http');
const list=asyncHandler(async(req,res)=>{
  const [reminders,ownPets]=await Promise.all([model.list(req.session.user.id),pets.getPetsByOwner(req.session.user.id)]);
  res.render('reminders',{reminders,pets:ownPets});
});
const create=asyncHandler(async(req,res)=>{
  const petId=positiveId(req.body.petId),task=cleanText(req.body.task,120),dueDate=req.body.dueDate;
  if(!petId||!task||!realDate(dueDate)||!await model.create(req.session.user.id,petId,task,dueDate)){
    req.flash('error','Choose your pet, task, and valid calendar date.');
  }else req.flash('success','Care reminder added.');
  res.redirect('/reminders');
});
const toggle=asyncHandler(async(req,res)=>{
  const id=positiveId(req.params.id);
  if(!id||!await model.setDone(req.session.user.id,id,req.body.done==='1')) return res.status(404).send('Reminder not found');
  req.flash('success','Reminder updated.');res.redirect('/reminders');
});
const remove=asyncHandler(async(req,res)=>{
  const id=positiveId(req.params.id);
  if(!id||!await model.remove(req.session.user.id,id))return res.status(404).send('Reminder not found');
  req.flash('success','Reminder deleted.');res.redirect('/reminders');
});
module.exports={list,create,toggle,remove};
