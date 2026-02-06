import crypto from "crypto";
import bigInt from "big-integer";

const S_BYTE_SIZE = 32;

// Helper to reverse a Buffer or Uint8Array
function reverse(buf: Buffer): Buffer {
  const b = Buffer.from(buf);
  return b.reverse();
}

// SHA1 hash of username:password (both uppercase)
export function hashUP(username: string, password: string): string {
  const input = `${username.toUpperCase()}:${password.toUpperCase()}`;
  const sha = crypto.createHash("sha1");
  sha.update(Buffer.from(input));
  return sha.digest("hex").toUpperCase();
}

export class SRP {
  N: bigInt.BigInteger;
  g: bigInt.BigInteger;
  s: Buffer; // salt as bytes
  v: bigInt.BigInteger; // verifier

  constructor() {
    this.N = bigInt(
      "894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7",
      16,
    );
    this.g = bigInt(7);
    this.s = Buffer.alloc(0);
    this.v = bigInt.zero;
  }

  // Generate random salt
  generateSalt() {
    this.s = crypto.randomBytes(S_BYTE_SIZE);
  }

  // Compute verifier given hashed "I" (username:password SHA1)
  computeVerifier(rIHex: string) {
    const rIBuf = Buffer.from(rIHex, "hex");
    const sha = crypto.createHash("sha1");
    sha.update(reverse(this.s));
    sha.update(rIBuf);
    const x = bigInt.fromArray([...reverse(sha.digest())], 256); // little-endian
    this.v = this.g.modPow(x, this.N);
  }

  // Returns salt as uppercase hex
  getSalt(): string {
    return this.s.toString("hex").toUpperCase();
  }

  // Returns verifier as uppercase hex (32 bytes)
  getVerifier(): string {
    // pad to 32 bytes if necessary
    let buf = Buffer.from(this.v.toArray(256).value);
    if (buf.length < S_BYTE_SIZE) {
      const pad = Buffer.alloc(S_BYTE_SIZE - buf.length, 0);
      buf = Buffer.concat([pad, buf]);
    }
    return buf.toString("hex").toUpperCase();
  }

  // Set salt from hex string
  setSalt(sHex: string) {
    this.s = Buffer.from(sHex, "hex");
  }

  // Set verifier from hex string
  setVerifier(vHex: string) {
    this.v = bigInt.fromArray(Array.from(Buffer.from(vHex, "hex")), 256);
  }

  // Check if verifier matches
  proofVerifier(vHex: string): boolean {
    const otherV = bigInt.fromArray(Array.from(Buffer.from(vHex, "hex")), 256);
    return this.v.equals(otherV);
  }
}
