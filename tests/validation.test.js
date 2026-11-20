const {test}=require('node:test');
const assert=require('node:assert/strict');
const {positiveId,realDate,todaySingapore,validPet,csvCell}=require('../helpers/validation');
test('AC3: accept only positive integer IDs',()=>{
  for(const id of ['1','23',100])assert.ok(positiveId(id));
  for(const id of ['',undefined,'abc','0','-2','1.5','1e3','999999999999999999'])assert.equal(positiveId(id),null);
});
test('AC2/AC3: accept real ISO dates but not impossible dates',()=>{
  for(const date of ['2026-11-19','2028-02-29','2026-12-31'])assert.ok(realDate(date));
  for(const date of ['2026-02-29','2026-02-30','2026-13-10','19/11/2026','',null])assert.equal(realDate(date),false);
});
test('Server derives a local ISO date using Singapore timezone',()=>{
  assert.match(todaySingapore(),/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(realDate(todaySingapore()));
});
test('New pet validation rejects invalid names and ages',()=>{
  assert.ok(validPet({pet_name:'Mochi',species:'Dog',breed:'Maltese',age:2}));
  assert.ok(!validPet({pet_name:'',species:'Dog',breed:'Maltese',age:2}));
  assert.ok(!validPet({pet_name:'Mochi',species:'Dog',breed:'Maltese',age:999}));
});
test('Journal exports quote values and neutralise spreadsheet formulas',()=>{
  assert.equal(csvCell('hello,"world"'),'"hello,""world"""');
  assert.equal(csvCell('=1+1'),'"\'=1+1"');
  assert.equal(csvCell('+SUM(A1:A2)'),'"\'+SUM(A1:A2)"');
});
