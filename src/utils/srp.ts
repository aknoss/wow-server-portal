import crypto from "crypto";
import bigInt from "big-integer";

const S_BYTE_SIZE = 32;

// Helper to reverse a Buffer
function reverse(buf: Buffer): Buffer {
  return Buffer.from(buf).reverse();
}

// SHA1 hash of UPPER(username:password)
function hashUP(username: string, password: string): string {
  const input = `${username.toUpperCase()}:${password.toUpperCase()}`;
  return crypto.createHash("sha1").update(input).digest("hex").toUpperCase();
}

// Generate SRP salt and verifier for a username/password
export function generateSRP(
  username: string,
  password: string,
): { salt: string; verifier: string } {
  // 1. Salt
  const salt = crypto.randomBytes(S_BYTE_SIZE);

  // 2. Compute x
  const upHash = hashUP(username, password); // hex string
  const upBuf = Buffer.from(upHash, "hex");

  const sha = crypto.createHash("sha1");
  sha.update(reverse(salt));
  sha.update(upBuf);
  const x = bigInt.fromArray([...reverse(sha.digest())], 256);

  // 3. Compute verifier v = g^x mod N
  const N = bigInt(
    "894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7",
    16,
  );
  const g = bigInt(7);
  const v = g.modPow(x, N);

  // 4. Convert verifier to 32-byte uppercase hex
  let vBuf = Buffer.from(v.toArray(256).value);
  if (vBuf.length < S_BYTE_SIZE) {
    const pad = Buffer.alloc(S_BYTE_SIZE - vBuf.length, 0);
    vBuf = Buffer.concat([pad, vBuf]);
  }

  return {
    salt: salt.toString("hex").toUpperCase(),
    verifier: vBuf.toString("hex").toUpperCase(),
  };
}
