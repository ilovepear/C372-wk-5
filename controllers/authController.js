const users = require('../models/userModel');
const { cleanText, validPet } = require('../helpers/validation');
const { asyncHandler } = require('../helpers/http');
const signupForm = (_req, res) => res.render('signUp');
const signup = asyncHandler(async (req, res) => {
  const username = cleanText(req.body.username,50);
  const name = cleanText(req.body.name,100);
  const password = String(req.body.password || '');
  const pet = {
    pet_name: cleanText(req.body.pet_name,80), species: cleanText(req.body.species,50),
    breed: cleanText(req.body.breed,80), age: req.body.age
  };
  if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username) || name.length < 2 || password.length < 8 || !validPet(pet)) {
    req.flash('error','Enter a username (3+ letters/numbers), password (8+ characters) and valid pet details.');
    return res.redirect('/signup');
  }
  try {
    await users.createWithPet({ username, name, password }, pet, req.file?.filename || null);
    req.flash('success','Account created! Please log in.');
    return res.redirect('/login');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      req.flash('error','This username is already taken.');
      return res.redirect('/signup');
    }
    throw error;
  }
});
const loginForm = (_req,res) => res.render('login');
const login = asyncHandler(async (req,res) => {
  const username = cleanText(req.body.username,50);
  const password = String(req.body.password || '');
  const user = await users.findByUsername(username);
  if (!user || user.password !== users.hash(password)) {
    req.flash('error','Invalid username or password.');
    return res.redirect('/login');
  }
  req.session.regenerate(err => {
    if (err) return res.status(500).render('error',{title:'Session error', detail:'Try signing in again.'});
    req.session.user = {id:user.id, username:user.username, name:user.name, role:user.role};
    req.session.save(error => {
      if (error) return res.status(500).render('error',{title:'Session error', detail:'Unable to save sign-in session.'});
      return res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    });
  });
});
const logout = (req,res) => req.session.destroy(() => { res.clearCookie('petcare.sid'); res.redirect('/login'); });
const profileForm = (_req,res) => res.render('profile');
const updateProfile = asyncHandler(async (req,res) => {
  const name = cleanText(req.body.name,100);
  if (name.length < 2) { req.flash('error','Name must have at least two characters.'); return res.redirect('/profile'); }
  await users.updateName(req.session.user.id,name);
  req.session.user.name = name;
  req.flash('success','Your profile has been updated.');
  res.redirect('/profile');
});
module.exports = { signupForm,signup,loginForm,login,logout,profileForm,updateProfile };
