const { createHash } = require('crypto');

const SKETCH_SIZE = 2048;
const SM = SKETCH_SIZE - 1;
const CF = 0.720924;

const defineProp = (obj, name, fn) => {
  Object.defineProperty(obj, name, { get: fn });
}

const defineMethod = (obj, name, fn) => {
  Object.defineProperty(obj, name, { get: () => fn });
}

const HyperLogLog = () => {
  const obj = {};
  const sketch = Buffer.alloc(SKETCH_SIZE);
  const size = sketch.length;

  const add = (val) => {
    const hash = createHash('md5').update(val).digest();
    const len = hash.length;
    const reg = SM & hash.readUInt16BE(len - 2);
    let lz = 0;
    for (let i = 0; i < len; i++) {
      let n = hash[i];
      if (n > 0) {
        lz += 7 - Math.floor(Math.log2(n));
        break;
      }
      lz += 8;
    }
    if (lz < 64 && lz > sketch[reg]) sketch[reg] = lz;
    return obj;
  }

  const count = () => {
    let sum = 0;
    for (let i = 0; i < size; i++) {
      sum += 1 / Math.pow(2, sketch[i] + 1);
    }
    const hm = size / sum;
    return Math.floor(CF * size * hm);
  }

  const merge = (hll) => {
    const sk = hll?.sketch || hll;
    if (!Buffer.isBuffer(sk)) throw new Error('Invalid sketch');
    const len = Math.min(size, sk.length);
    for (let i = 0; i < len; i++) {
      sketch[i] = Math.max(sketch[i], sk[i]);
    }
    return obj;
  }

  defineProp(obj, 'sketch', () => sketch);
  defineProp(obj, 'size', () => size);
  defineMethod(obj, 'add', add);
  defineMethod(obj, 'count', count);
  defineMethod(obj, 'merge', merge);
  defineMethod(obj, 'toString', (e = 'utf8') => sketch.toString(e));
  return obj;
}

module.exports = HyperLogLog;
