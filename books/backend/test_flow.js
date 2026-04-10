const fetch = require('node-fetch');
(async () => {
  const res = await fetch('http://localhost:1234/api/sets?orderBy=-releaseDate&pageSize=250');
  const data = await res.json();
  const allSets = data.data;
  console.log('allSets.length:', allSets.length);
  const s = allSets[0];
  console.log('first:', s.id, s.name);
  console.log('logo:', s.images && s.images.logo ? s.images.logo.substring(0, 80) : 'NO LOGO');
})().catch(e => console.error(e.message));
