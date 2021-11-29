const sha256 = require('sha256');
const EC = require('elliptic').ec;
const ec = new EC("secp256k1");
const axios = require('axios');

/*
 Backend API endpoints
 */
const api = "http://localhost:18001";
const apiAuthorize = "/api/v0/authorize-derived-key";
const apiSubmit = "/api/v0/submit-transaction";

/*
 Payload from DeSo Identity after using the /derive window API endpoint
 */

// Access signature is a certificate signed by the master public key
const accessSignature = "3045022060f9aa000a37c5304f463a3d7e9f1dacfdae4d7e53be46852fc26f01b523e67e0221009da5a9419e6f1863bdc02812691cfbe4971e81d7cdb67776781d216f1dbd8a66";
// Private key of the derived key
const derivedSeedHex = "b060626c0361670a08d203eff3540e5f6e51350ff722795d6f4a0a667d2bf2b7";
// Public key of the derived key
const derivedPublicKey = "tBCKW6Ltw84mLPrNRVos5tZ8YXpREyq8ZaftzuG9qw3jDYDD7A7aLt";
// Master public key
const publicKey = "tBCKXyutsCWVbECXqE5zqP7NyGjmXg1SHkYJgKUsNujHfVF7GsVxzU";
// When the derived key expires
const expirationBlock = 14423;

/*
 Authorize a derived key logic
 */

authorizeDerivedKey();
async function authorizeDerivedKey() {
    // Step 1. Construct an authorize transaction by sending a request to `/api/v0/authorize-derived-key`
    let payload =  {
        OwnerPublicKeyBase58Check: publicKey,
        DerivedPublicKeyBase58Check: derivedPublicKey,
        ExpirationBlock: expirationBlock,
        AccessSignature: accessSignature,
        DeleteKey: false,
        DerivedKeySignature: true,
        MinFeeRateNanosPerKB: 1000
    }
    let res = await axios.post(api + apiAuthorize, payload);
    const transactionHex = res.data.TransactionHex;

    // Step 2. Sign transaction with derived seed hex
    const signedTransaction = signTransaction(derivedSeedHex, transactionHex);

    // Step 3. Submit the transaction
    payload = {
        TransactionHex : signedTransaction
    }
    res = await axios.post(api + apiSubmit, payload)
    console.log(res);
}

/*
 Helper functions
 */

// Serialize a number into an 8-byte array. This is a copy/paste primitive, not worth
// getting into the details.
function uvarint64ToBuf (uint) {
    const result = [];

    while (uint >= 0x80) {
        result.push((uint & 0xFF) | 0x80);
        uint >>>= 7;
    }

    result.push(uint | 0);

    return new Buffer(result);
}

// Sign transaction with seed
function signTransaction (seed, txnHex) {
    const privateKey = ec.keyFromPrivate(seed);
    const transactionBytes = new Buffer(txnHex, 'hex');
    const transactionHash = new Buffer(sha256.x2(transactionBytes), 'hex');
    const signature = privateKey.sign(transactionHash);
    const signatureBytes = new Buffer(signature.toDER());
    const signatureLength = uvarint64ToBuf(signatureBytes.length);
    const signedTransactionBytes = Buffer.concat([
        transactionBytes.slice(0, -1),
        signatureLength,
        signatureBytes
    ])
    return signedTransactionBytes.toString('hex');
}