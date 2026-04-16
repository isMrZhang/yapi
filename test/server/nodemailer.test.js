const test = require('ava');
const nodemailer = require('nodemailer');

test('nodemailer jsonTransport works', async t => {
  const transport = nodemailer.createTransport({ jsonTransport: true });
  const info = await transport.sendMail({
    from: 'a@example.com',
    to: 'b@example.com',
    subject: 'subject',
    text: 'text'
  });
  t.truthy(info && info.message);
});

