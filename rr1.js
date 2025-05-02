const HyperLogLog = require('./hll');
const { fread, sdate, udate } = require('./utils');

const logs = fread('./data/log_open_app.json');
const items = {};

for (let { user_id, timestamp } of logs) {
  let date = udate(timestamp);
  if (!items[date]) {
    let hll = HyperLogLog();
    items[date] = { date, hll };
  }
  items[date].hll.add(user_id);
}
const stats = Object.values(items).map(item => {
  const { date, hll } = item;
  const users = hll.count();
  let rate = 0;
  let ytd = date - 86400;
  let hll1 = items[ytd]?.hll;
  if (hll1) {
    let u1 = hll1.count();
    let u2 = HyperLogLog().merge(hll).merge(hll1).count();
    rate = (users + u1 - u2) / u1;
  }
  return {
    date: sdate(date),
    users,
    rr1: (Math.round(rate * 10000) / 100) + '%'
  };
});
console.log('Daily return rate:');
console.dir(stats);
