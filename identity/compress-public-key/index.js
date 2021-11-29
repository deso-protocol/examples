const bs58check = require("bs58check");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const assert = require("assert");

// Decode public key from base58check to compressed secp256k1 public key
function compressPublicKey(publicKey){
    // Sanity check similar to Base58CheckDecodePrefix from core/lib/base58.go
    if (publicKey.length < 5){
        throw new Error('Failed to decode public key');
    }
    const decoded = bs58check.decode(publicKey);
    // Slice the prefix. First 3 bytes are always constant in DeSo public keys.
    const payload = Uint8Array.from(decoded).slice(3);

    const publicKeyEC = ec.keyFromPublic(payload, 'array');

    return publicKeyEC.getPublic(true, 'hex');
}

// Tester public keys.
const publicKeyBase58Check = "tBCKYSv2DVXFWJKjwMkwFhmtghBR2JvhBrXvMRKzj3XG2uYqEJoWCH";
const publicKeyCompressed = "03e0ec4214b6bc61ef1097658406541371e3f01a03a79c9e424f3a2dde77aac5c3";
// If compression is successful then the below equivalence passes the assertion.
assert(compressPublicKey(publicKeyBase58Check) === publicKeyCompressed);