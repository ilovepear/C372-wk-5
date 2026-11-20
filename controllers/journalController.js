const pets = require('../models/petModel');
const journals = require('../models/journalModel');
const { positiveId,realDate,cleanText,csvCell } = require('../helpers/validation');
const { asyncHandler } = require('../helpers/http');
function readFilters(query) {
  return { petId:positiveId(query.petId), q:cleanText(query.q,120), activity:cleanText(query.activity,80),
    from:realDate(query.from)?query.from:null, to:realDate(query.to)?query.to:null,
    sort:query.sort==='oldest'?'oldest':'newest' };
}
const listJournals = asyncHandler(async(req,res)=>{
  const myPets=await pets.getPetsByOwner(req.session.user.id);
  const filters=readFilters(req.query);
  // A supplied but unowned petId should never produce another user's entries.
  if (filters.petId && !myPets.some(p=>p.id===filters.petId)) filters.petId=-1;
  const rows=await journals.list(req.session.user.id,filters);
  const selectedPet= myPets.find(p=>p.id===filters.petId) || null;
  res.render('journals',{pets:myPets,journals:rows,filters,pet:selectedPet});
});
const newJournalForm=asyncHandler(async(req,res)=>{
  const myPets=await pets.getPetsByOwner(req.session.user.id);
  res.render('journalForm',{journal:null,pets:myPets,selectedPetId:positiveId(req.query.petId),formAction:'/journals/new'});
});
function entryInputs(req) {
  return { petId:positiveId(req.body.pet_id),activity:cleanText(req.body.activity,120),
    notes:cleanText(req.body.notes,3000),date:req.body.entry_date };
}
const createJournal=asyncHandler(async(req,res)=>{
  const data=entryInputs(req);
  if (!data.petId||!data.activity||!realDate(data.date)){
    req.flash('error','Select your pet and enter an activity and valid date.'); return res.redirect('/journals/new');
  }
  if (!await pets.getOwnedPet(req.session.user.id,data.petId)) return res.status(403).render('error',{title:'Access denied',detail:'You can only add entries for your own pets.'});
  await journals.create(data.petId,data.activity,data.notes,data.date);
  req.flash('success','Journal entry added.'); res.redirect(`/journals?petId=${data.petId}`);
});
const editJournalForm=asyncHandler(async(req,res)=>{
  const id=positiveId(req.params.id);
  const journal=id && await journals.getOwned(id,req.session.user.id);
  if (!journal) return res.status(404).render('error',{title:'Entry not found',detail:'You can only edit your own entries.'});
  const myPets=await pets.getPetsByOwner(req.session.user.id);
  res.render('journalForm',{journal,pets:myPets,selectedPetId:journal.pet_id,formAction:`/journals/edit/${id}`});
});
const updateJournal=asyncHandler(async(req,res)=>{
  const id=positiveId(req.params.id), data=entryInputs(req);
  if (!id||!await journals.getOwned(id,req.session.user.id)) return res.status(404).render('error',{title:'Entry not found',detail:'Entry not found.'});
  if (!data.petId||!data.activity||!realDate(data.date)||!await pets.getOwnedPet(req.session.user.id,data.petId)) {
    req.flash('error','Choose an owned pet, activity and valid date.'); return res.redirect(`/journals/edit/${id}`);
  }
  await journals.update(id,req.session.user.id,data.petId,data.activity,data.notes,data.date);
  req.flash('success','Journal entry updated.');res.redirect(`/journals?petId=${data.petId}`);
});
const deleteJournal=asyncHandler(async(req,res)=>{
  const id=positiveId(req.params.id);
  const record=id && await journals.getOwned(id,req.session.user.id);
  if (!record) return res.status(404).render('error',{title:'Entry not found',detail:'You cannot delete this entry.'});
  await journals.remove(id,req.session.user.id);
  req.flash('success','Journal entry deleted.');res.redirect(`/journals?petId=${record.pet_id}`);
});
const exportCsv=asyncHandler(async(req,res)=>{
  const filters=readFilters(req.query), owned=await pets.getPetsByOwner(req.session.user.id);
  if (filters.petId && !owned.some(p=>p.id===filters.petId)) return res.status(403).send('Pet not accessible');
  const rows=await journals.list(req.session.user.id,filters);
  const lines=[['Date','Pet','Activity','Notes'],...rows.map(j=>[j.entry_date,j.pet_name,j.activity,j.notes])];
  const csv='\uFEFF'+lines.map(line=>line.map(csvCell).join(',')).join('\r\n');
  res.set('Content-Type','text/csv; charset=utf-8');
  res.set('Content-Disposition','attachment; filename="petcare-journals.csv"');
  res.send(csv);
});
module.exports={listJournals,newJournalForm,createJournal,editJournalForm,updateJournal,deleteJournal,exportCsv};
