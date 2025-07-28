const fs = require('fs');


function convertToBigInt(base, value) {
  return BigInt(parseInt(value, parseInt(base)));
}


function modInverse(a, m) {
  let m0 = m, x0 = 0n, x1 = 1n;
  if (m === 1n) return 0n;

  while (a > 1n) {
    let q = a / m;
    [a, m] = [m, a % m];
    [x0, x1] = [x1 - q * x0, x0];
  }

  return x1 < 0n ? x1 + m0 : x1;
}


function reconstructSecret(shares, prime = 2n ** 521n - 1n) {
  let secret = 0n;

  for (let i = 0; i < shares.length; i++) {
    let xi = shares[i].x;
    let yi = shares[i].y;

    let num = 1n, den = 1n;

    for (let j = 0; j < shares.length; j++) {
      if (i !== j) {
        let xj = shares[j].x;
        num = (num * (-xj)) % prime;
        den = (den * (xi - xj)) % prime;
      }
    }

    let inv = modInverse(den, prime);
    let term = (yi * num * inv) % prime;
    secret = (secret + term + prime) % prime;
  }

  return secret;
}


const data = JSON.parse(fs.readFileSync('sample.json', 'utf8'));
const k = data.keys.k;


const allShares = Object.entries(data)
  .filter(([key]) => key !== "keys")
  .map(([key, { base, value }]) => ({
    x: BigInt(key),
    y: convertToBigInt(base, value)
  }));

const shares1 = allShares.slice(0, k);        
const shares2 = allShares.slice(3, 3 + k);     

const secret1 = reconstructSecret(shares1);
const secret2 = reconstructSecret(shares2);

console.log("Secret 1:", secret1.toString());
console.log("Secret 2:", secret2.toString());
