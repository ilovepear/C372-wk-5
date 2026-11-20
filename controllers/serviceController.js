const pets = require('../models/petModel');
const services = require('../models/serviceModel');
const bookings = require('../models/serviceBookingModel');
const { positiveId,realDate,todaySingapore } = require('../helpers/validation');
const { asyncHandler } = require('../helpers/http');
const servicePage=asyncHandler(async(req,res)=>{
  let ownPets,activeServices;
  try { [ownPets,activeServices]=await Promise.all([pets.getPetsByOwner(req.session.user.id),services.active()]); }
  catch(error){console.error(error);return res.status(500).send('Unable to load available services.');}
  const preselect=positiveId(req.query.petId);
  res.render('services',{pets:ownPets,services:activeServices,
    selectedPetId:ownPets.some(p=>p.id===preselect)?preselect:null});
});
const book=asyncHandler(async(req,res)=>{
  const petId=positiveId(req.body.petId),serviceId=positiveId(req.body.serviceId),bookingDate=req.body.bookingDate;
  if (!petId||!serviceId||!realDate(bookingDate)||bookingDate<todaySingapore()){
    req.flash('error','Choose a pet, service, and valid booking date.'); return res.redirect('/services');
  }
  try {
    const result=await bookings.create(req.session.user.id,petId,serviceId,bookingDate);
    if (result.unavailable){req.flash('error','That pet or service is unavailable for booking.');return res.redirect('/services');}
    req.flash('success','Booking created. Payment is pending; no payment has been processed.');
    return res.redirect('/bookings');
  } catch(error){
    console.error('Unable to create booking:',error);
    req.flash('error','Unable to create the booking. Please try again.');return res.redirect('/services');
  }
});
const history=asyncHandler(async(req,res)=>{
  try{res.render('bookings',{bookings:await bookings.history(req.session.user.id)});}
  catch(error){console.error(error);res.status(500).send('Unable to load booking history.');}
});
module.exports={servicePage,book,history};
