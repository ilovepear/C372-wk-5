function positiveId(value) {
  if (!/^[1-9]\d*$/.test(String(value ?? ''))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
function realDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00.000Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
function todaySingapore() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const get = type => parts.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function cleanText(value, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
function validPet(data) {
  const name = cleanText(data.pet_name || data.name, 80);
  const species = cleanText(data.species, 50);
  const breed = cleanText(data.breed, 80);
  const age = Number(data.age);
  return name && species && breed && Number.isInteger(age) && age >= 0 && age <= 40;
}
function csvCell(value) {
  // Prefix formula-looking cells to prevent spreadsheet formula execution.
  let text = String(value == null ? '' : value).replaceAll('"', '""');
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return `"${text}"`;
}
module.exports = { positiveId, realDate, todaySingapore, cleanText, validPet, csvCell };
