const pets = require('../models/petModel');
const journals = require('../models/journalModel');
const { positiveId,validPet,cleanText } = require('../helpers/validation');
const { asyncHandler } = require('../helpers/http');
const newPetForm = (_req,res) => res.render('petForm',{pet:null,formAction:'/pets'});
const createPet = asyncHandler(async(req,res)=>{
  const data = { pet_name:cleanText(req.body.pet_name,80),species:cleanText(req.body.species,50),
    breed:cleanText(req.body.breed,80),age:req.body.age };
  if (!validPet(data)) {req.flash('error','Enter valid pet details (age 0–40).');return res.redirect('/pets/new');}
  const id = await pets.createPet(req.session.user.id,data,req.file?.filename||null);
  req.flash('success','Your pet has been added.');
  res.redirect(`/pets/${id}`);
});
const petDetails = asyncHandler(async(req,res)=>{
  const id = positiveId(req.params.id);
  const pet = id && await pets.getOwnedPet(req.session.user.id,id);
  if (!pet) return res.status(404).render('error',{title:'Pet not found',detail:'This pet is not in your account.'});
  const recent = (await journals.list(req.session.user.id,{petId:id})).slice(0,5);
  const journalCount = await journals.countByPet(req.session.user.id,id);
  res.render('petDetails',{pet,recent,journalCount});
});
const editPetForm = asyncHandler(async(req,res)=>{
  const id = positiveId(req.params.id);
  const pet = id && await pets.getOwnedPet(req.session.user.id,id);
  if (!pet) return res.status(404).render('error',{title:'Pet not found',detail:'This pet is not in your account.'});
  res.render('petForm',{pet,formAction:`/pets/${pet.id}/edit`});
});
const updatePet = asyncHandler(async(req,res)=>{
  const id=positiveId(req.params.id);
  const pet=id && await pets.getOwnedPet(req.session.user.id,id);
  if (!pet) return res.status(404).render('error',{title:'Pet not found',detail:'This pet is not in your account.'});
  const data={pet_name:cleanText(req.body.pet_name,80),species:cleanText(req.body.species,50),
    breed:cleanText(req.body.breed,80),age:req.body.age};
  if (!validPet(data)){req.flash('error','Please check the pet details.');return res.redirect(`/pets/${id}/edit`);}
  await pets.updatePet(req.session.user.id,id,data,req.file?.filename||null);
  req.flash('success','Pet details saved.'); res.redirect(`/pets/${id}`);
});
const deletePet = asyncHandler(async(req,res)=>{
  const id=positiveId(req.params.id);
  if (!id || !await pets.deletePet(req.session.user.id,id)) {
    req.flash('error','Pet not found.'); return res.redirect('/journals');
  }
  req.flash('success','Pet deleted with its associated journal entries, bookings and reminders.');
  res.redirect('/journals');
});
module.exports={newPetForm,createPet,petDetails,editPetForm,updatePet,deletePet};
