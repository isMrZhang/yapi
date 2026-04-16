const test = require('ava');
const schedule = require('node-schedule');

test('node-schedule scheduleJob(Date) triggers', async t => {
  await new Promise(resolve => {
    const job = schedule.scheduleJob(new Date(Date.now() + 50), () => {
      job.cancel();
      t.pass();
      resolve();
    });
  });
});

