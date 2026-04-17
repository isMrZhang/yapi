const test = require('ava');
const schedule = require('node-schedule');

test('node-schedule scheduleJob(Date) triggers', async t => {
  t.timeout(5000);

  await new Promise((resolve, reject) => {
    const failTimer = setTimeout(() => {
      reject(new Error('scheduleJob did not trigger in time'));
    }, 3000);

    const job = schedule.scheduleJob(new Date(Date.now() + 1000), () => {
      clearTimeout(failTimer);
      job.cancel();
      t.pass();
      resolve();
    });

    if (!job) {
      clearTimeout(failTimer);
      reject(new Error('scheduleJob returned null/undefined'));
    }
  });
});
