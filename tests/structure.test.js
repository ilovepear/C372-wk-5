const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');

test('Lesson 8 exact booking routes remain protected',()=>{
 const source=read('routes/serviceRoutes.js');
 assert.match(source,/router\.get\('\/services',isLoggedIn/);
 assert.match(source,/router\.post\('\/services\/book',isLoggedIn/);
 assert.match(source,/router\.get\('\/bookings',isLoggedIn/);
});
test('Booking creates two pending records in a single transaction',()=>{
 const source=read('models/serviceBookingModel.js');
 for(const required of ['beginTransaction','FOR UPDATE','service_bookings','payments','commit()','rollback()','release()'])assert.ok(source.includes(required),required);
 assert.ok(source.includes("booking_status) VALUES (?,?,?,?,'pending')"));
 assert.ok(source.includes("payment_status)\n      VALUES (?,?,'pending')"));
});
test('Users cannot register themselves with admin role',()=>{
 assert.match(read('models/userModel.js'),/VALUES \(\?, \?, \?, 'user'\)/);
 assert.ok(!read('views/signUp.ejs').includes('name="role"'));
});
test('Destructive actions use POST forms',()=>{
 for(const file of ['views/journals.ejs','views/petDetails.ejs','views/adminUsers.ejs','views/reminders.ejs']) {
   assert.match(read(file),/method="POST"/);
 }
});
test('At least eight services in database seed',()=>{
 const source=read('db.sql');
 for(const name of ['Basic Bath','Full Grooming','Nail Trimming','Health Check-up','Vaccination','Dental Cleaning','Pet Daycare','Pet Sitting'])assert.ok(source.includes(name));
});
