const crypto = require('crypto');

class ObjectCipher {
  constructor(algo, secretKey) {
    this.algo = algo;
    this.secretKey = makeHash(secretKey);

    this.iv = crypto.randomBytes(16);
  }

  encrypt(obj) {
    let strObj = JSON.stringify(obj);
    strObj = Buffer.from(strObj).toString('base64');

    const cipher = crypto.createCipheriv(this.algo, this.secretKey, this.iv);
    let enc = cipher.update(strObj, 'base64', 'hex');
    enc += cipher.final('hex');

    return enc;
  }

  decrypt(enc) {
    const decipher = crypto.createDecipheriv(this.algo, this.secretKey, this.iv);
    let strObj = decipher.update(enc, 'hex', 'base64');
    strObj += decipher.final('base64');
    strObj = Buffer.from(strObj, 'base64').toString('ascii');

    let obj = JSON.parse(strObj);
    return obj;
  }
}

function makeHash(str) {
  return crypto.createHash('sha256').update(String(str)).digest('base64').substr(0, 32);
}

exports.ObjectCipher = ObjectCipher;
exports.makeHash = makeHash;