// Build a nested village (mouza) file from the BBS land-records dataset:
//   Division > District > Upazila(revenue circle) > Village/Mouza (with JL number)
// Source: muktadirhossain/geo-loaction-bangladesh (scraped from the BD land portal)
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

const arr = JSON.parse(fs.readFileSync(path.join(DIR, 'bbs_mouzas.json'), 'utf8'));

// Canonicalise the 8 divisions (fix trailing spaces, typos, stray English / mis-levelled names)
const DIV = {
  'ঢাকা':        { bn: 'ঢাকা',        en: 'Dhaka' },
  'চট্টগ্রাম':    { bn: 'চট্টগ্রাম',    en: 'Chattogram' },
  'chittagong':  { bn: 'চট্টগ্রাম',    en: 'Chattogram' },
  'রাজশাহী':      { bn: 'রাজশাহী',      en: 'Rajshahi' },
  'খুলনা':        { bn: 'খুলনা',        en: 'Khulna' },
  'বরিশাল':       { bn: 'বরিশাল',       en: 'Barishal' },
  'সিলেট':        { bn: 'সিলেট',        en: 'Sylhet' },
  'মৌলভীবাজার':   { bn: 'সিলেট',        en: 'Sylhet' },   // mis-levelled district -> Sylhet div
  'রংপুর':        { bn: 'রংপুর',        en: 'Rangpur' },
  'রংপূর':        { bn: 'রংপুর',        en: 'Rangpur' },
  'ময়মনসিংহ':    { bn: 'ময়মনসিংহ',    en: 'Mymensingh' },
};
const t = s => (s == null ? '' : String(s).normalize('NFC').trim());

// Merge clear district spelling variants found in the source data.
const DISTRICT_ALIAS = {
  'টাংগাইল': 'টাঙ্গাইল',   // Tangail (ং -> ঙ)
  'যশোহর': 'যশোর',         // Jessore
  'Rangamati': 'রাঙ্গামাটি', // stray English
};
const canonDist = raw => { const v = t(raw); return DISTRICT_ALIAS[v] || v; };
const canonDiv = raw => {
  const k = t(raw).toLowerCase();
  const hit = DIV[t(raw)] || DIV[k];
  return hit || { bn: t(raw), en: '' };
};

// Group: division -> district -> upazila -> [villages]
const root = new Map();
for (const m of arr) {
  const dv = canonDiv(m.DIVISION_NAME);
  const dist = canonDist(m.DISTRICT_NAME);
  const up = t(m.UPAZILA_NAME);

  if (!root.has(dv.bn)) root.set(dv.bn, { name_bn: dv.bn, name_en: dv.en, _d: new Map() });
  const D = root.get(dv.bn);
  if (!D._d.has(dist)) D._d.set(dist, { name_bn: dist, _u: new Map() });
  const DD = D._d.get(dist);
  if (!DD._u.has(up)) DD._u.set(up, { name_bn: up, villages: [] });
  DD._u.get(up).villages.push({
    mouza_id: m.MOUZA_ID,
    name_bn: t(m.MOUZA_NAME),
    jl_number: t(m.JL_NUMBER),
    survey: t(m.MUTATION_SURVEY_NAME_EN) || t(m.SURVEY_NAME_EN) || null,
  });
}

let nDist = 0, nUp = 0, nVil = 0;
const divisions = [...root.values()]
  .sort((a, b) => a.name_en.localeCompare(b.name_en))
  .map(D => {
    const districts = [...D._d.values()].map(DD => {
      const upazilas = [...DD._u.values()].map(U => {
        nVil += U.villages.length;
        U.villages.sort((a, b) => (Number(a.jl_number) || 0) - (Number(b.jl_number) || 0));
        return U;
      });
      nUp += upazilas.length;
      return { name_bn: DD.name_bn, upazilas };
    });
    nDist += districts.length;
    return { name_bn: D.name_bn, name_en: D.name_en, districts };
  });

const out = {
  meta: {
    description: 'Bangladesh village/mouza directory (Division > District > Upazila > Village) with official JL numbers, from land-records (BBS) data.',
    source: 'https://github.com/muktadirhossain/geo-loaction-bangladesh (scraped from the Bangladesh land portal; data current to early 2025)',
    note: 'This is the LAND/REVENUE hierarchy. "Village" = mouza (cadastral unit) identified by its JL number. Names are Bangla-only; English names are not available for districts/upazilas/villages in the source. This hierarchy attaches villages at the upazila level and does NOT pass through unions, so it cannot be merged 1:1 with the local-government union tree in bangladesh-geo.json.',
    counts: { divisions: divisions.length, districts: nDist, upazilas: nUp, villages: nVil },
  },
  divisions,
};

const target = path.join(DIR, '..', 'bangladesh-villages.json');
fs.writeFileSync(target, JSON.stringify(out), 'utf8'); // compact: 60k records
console.log('Wrote', target, (fs.statSync(target).size / 1024 / 1024).toFixed(1) + ' MB');
console.log(JSON.stringify(out.meta.counts, null, 2));
