(async function(){
  const base = 'http://localhost:3000';
  const A = crypto ? crypto.randomUUID() : require('crypto').randomUUID();
  const B = crypto ? crypto.randomUUID() : require('crypto').randomUUID();
  const nameA = 'PlayerA-' + A.slice(0,6);
  const nameB = 'PlayerB-' + B.slice(0,6);
  console.log('A', A);
  console.log('B', B);
  let res = await fetch(base + '/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: A, name: nameA }) });
  const create = await res.json();
  const room = create.roomId;
  console.log('room', room, create);
  await fetch(base + '/api/room/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: room, playerId: B, name: nameB }) });
  // now rotate to next round
  res = await fetch(base + '/api/room/next', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: room }) });
  const next = await res.json();
  console.log('next response', next);
  // poll events
  res = await fetch(base + '/api/poll?roomId=' + room + '&cursor=0');
  console.log('events:', await res.json());
  // fetch state for A and B
  res = await fetch(base + '/api/room/state?roomId=' + room + '&revealTo=' + A);
  console.log('state A:', await res.json());
  res = await fetch(base + '/api/room/state?roomId=' + room + '&revealTo=' + B);
  console.log('state B:', await res.json());
})();
