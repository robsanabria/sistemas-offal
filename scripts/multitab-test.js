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
  console.log('Create response:', create);
  const room = create.roomId;
  console.log('roomId:', room, 'drawerId:', create.drawerId, 'word:', create.word);
  // join as B
  res = await fetch(base + '/api/room/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: room, playerId: B, name: nameB }) });
  const join = await res.json();
  console.log('Join response:', join.ok ? 'ok' : join);
  // state for B
  res = await fetch(base + '/api/room/state?roomId=' + room + '&revealTo=' + B);
  const stateB = await res.json();
  console.log('State for B:', stateB);
  // B sends wrong guess
  console.log("B sends wrong guess 'pepino'");
  res = await fetch(base + '/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: room, type: 'guess', payload: 'pepino', playerId: B }) });
  console.log('Publish wrong guess response status:', res.status);
  // state after wrong guess
  res = await fetch(base + '/api/room/state?roomId=' + room + '&revealTo=' + B);
  console.log('State after wrong guess:', await res.json());
  // B sends correct guess using creator's word
  console.log('B sends correct guess using creator word');
  const word = create.word;
  res = await fetch(base + '/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: room, type: 'guess', payload: word, playerId: B }) });
  console.log('Publish correct guess status:', res.status);
  // state after correct guess
  res = await fetch(base + '/api/room/state?roomId=' + room + '&revealTo=' + B);
  console.log('State after correct guess:', await res.json());
  // poll events
  res = await fetch(base + '/api/poll?roomId=' + room + '&cursor=0');
  console.log('Events from poll:', await res.json());
})();
