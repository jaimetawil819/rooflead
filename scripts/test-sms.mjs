import twilio from 'twilio';

const c = twilio('AC254d164e357f302f14abdc7e42620d3e', '206df1547fd95dc8eaee1c1a257f7f14');

const msg = await c.messages.create({
    to: '+18589223897',
    from: '+15005550006',
    body: 'Hello from RoofLead!',
  });
  
  console.log('Sent:', msg.sid);