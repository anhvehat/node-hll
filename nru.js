const HyperLogLog = require('./hll');
const { fread, sdate, udate } = require('./utils');

const logs = fread('./data/log_login.json');
const items = {};
const total = HyperLogLog();

for (let { user_id, timestamp } of logs) {
  let date = udate(timestamp);
  if (!items[date]) {
    let hll = HyperLogLog();
    items[date] = { date, hll };
  }
  items[date].hll.add(user_id);
}
Object.values(items).forEach(it => total.merge(it.hll));
const stats = Object.values(items).map(item => ({
  date: sdate(item.date),
  nru: item.hll.count()
}));
console.log('Total NRU: ' + total.count());
console.log('Daily NRU:');
console.dir(stats);
