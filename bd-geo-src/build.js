// Build a single nested JSON of Bangladesh administrative geography + postcodes.
// Sources:
//   - nuhil/bangladesh-geocode  (divisions, districts, upazilas, unions)
//   - saaiful/postcode-bd       (postcodes, en+bn paired)
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

// PHPMyAdmin export files: the rows live in element whose `type === "table"`.
function loadTable(file) {
  const arr = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
  const table = arr.find(x => x && x.type === 'table');
  return table.data;
}

const divisions = loadTable('divisions.json');
const districts = loadTable('districts.json');
const upazilas  = loadTable('upazilas.json');
const unions    = loadTable('unions.json');

// --- Parse postcodes from the keyed JSON via regex (preserves duplicate post
// offices that share a code, and keeps en+bn paired). Values have trailing
// spaces we trim. ---
const pcText = fs.readFileSync(path.join(DIR, 'postcodes.json'), 'utf8');
const recRe = /"[^"]*?":\{"en":\{([^}]*)\},"bn":\{([^}]*)\}\}/g;
const fieldRe = (block, name) => {
  const m = block.match(new RegExp('"' + name + '":"([^"]*)"'));
  return m ? m[1].trim() : '';
};
const postcodes = [];
let m;
while ((m = recRe.exec(pcText)) !== null) {
  const en = m[1], bn = m[2];
  postcodes.push({
    division: fieldRe(en, 'division'),
    district: fieldRe(en, 'district'),
    thana: fieldRe(en, 'thana'),
    post_office: fieldRe(en, 'suboffice'),
    postcode: fieldRe(en, 'postcode'),
    bn_division: fieldRe(bn, 'division'),
    bn_district: fieldRe(bn, 'district'),
    bn_thana: fieldRe(bn, 'thana'),
    bn_post_office: fieldRe(bn, 'suboffice'),
  });
}

// --- Build the nested administrative tree ---
const unionsByUpazila = {};
for (const u of unions) {
  (unionsByUpazila[u.upazilla_id] ||= []).push({
    id: Number(u.id), name: u.name, bn_name: u.bn_name,
  });
}
const upazilasByDistrict = {};
for (const up of upazilas) {
  (upazilasByDistrict[up.district_id] ||= []).push({
    id: Number(up.id), name: up.name, bn_name: up.bn_name,
    unions: unionsByUpazila[up.id] || [],
  });
}
const districtsByDivision = {};
for (const d of districts) {
  (districtsByDivision[d.division_id] ||= []).push({
    id: Number(d.id), name: d.name, bn_name: d.bn_name,
    lat: d.lat, lon: d.lon,
    upazilas: upazilasByDistrict[d.id] || [],
  });
}
const tree = divisions.map(dv => ({
  id: Number(dv.id), name: dv.name, bn_name: dv.bn_name,
  districts: districtsByDivision[dv.id] || [],
}));

const out = {
  meta: {
    description: 'Bangladesh administrative hierarchy (division > district > upazila > union) plus postal codes.',
    sources: [
      'https://github.com/nuhil/bangladesh-geocode',
      'https://github.com/saaiful/postcode-bd',
    ],
    note: 'Postcodes are assigned to post offices (division/district/thana level), not to unions, so they are provided as a separate list rather than nested under unions.',
    counts: {
      divisions: divisions.length,
      districts: districts.length,
      upazilas: upazilas.length,
      unions: unions.length,
      postcodes: postcodes.length,
    },
  },
  divisions: tree,
  postcodes,
};

const target = path.join(DIR, '..', 'bangladesh-geo.json');
fs.writeFileSync(target, JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote', target);
console.log(JSON.stringify(out.meta.counts, null, 2));
