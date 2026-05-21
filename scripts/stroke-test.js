(async function(){
  const base = 'http://localhost:3000';
  const A = crypto ? crypto.randomUUID() : require('crypto').randomUUID();
  const B = crypto ? crypto.randomUUID() : require('crypto').randomUUID();
  const nameA = 'PlayerA-' + A.slice(0,6);
  const nameB = 'PlayerB-' + B.slice(0,6);
  console.log('Player A ID:', A);
  console.log('Player B ID:', B);
  // create room as A
  let res = await fetch(base + '/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: A, name: nameA }) });
  const create = await res.json();
  const room = create.roomId;
  console.log('room created', room, 'drawer', create.drawerId);
  // join as B
  res = await fetch(base + '/api/room/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: room, playerId: B, name: nameB }) });
  console.log('joined B');
  // A publishes a stroke begin and two move points
  const publish = async (body) => await fetch(base + '/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  await publish({ roomId: room, type: 'stroke', payload: { x: 10, y: 10, color: '#ff0000', size: 4, begin: true }, playerId: A });
  await publish({ roomId: room, type: 'stroke', payload: { x: 20, y: 20, color: '#ff0000', size: 4, begin: false }, playerId: A });
  await publish({ roomId: room, type: 'stroke', payload: { x: 30, y: 40, color: '#ff0000', size: 4, begin: false }, playerId: A });
  console.log('published strokes from A');
  // poll events from B
  res = await fetch(base + '/api/poll?roomId=' + room + '&cursor=0');
  const events = await res.json();
  console.log('events:', events);
})();
