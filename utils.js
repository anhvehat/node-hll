const fs = require('fs');
const moment = require('moment');

const fread = (fp) => {
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

const sdate = (date) => {
  let m = typeof date === 'number'
    ? moment.unix(date)
    : moment(date);
  return m.format('YYYY-MM-DD');
}

const udate = (iso) => {
  let d = new Date(iso);
  let ts = Math.floor(d.getTime() / 1000);
  ts -= d.getHours() * 3600;
  ts -= d.getMinutes() * 60 - d.getSeconds();
  return ts;
}

module.exports = {
  fread,
  sdate,
  udate
};
