# Authorize a Derived Key

A simple node.js snippet that prepares and submits an AuthorizeDerivedKey transaction. This snippet assumes that we already called the Identity window API under `/derive` endpoint to retrieve a derived key. The code does the following steps:
1. Call `/authorize-derived-key` Backend API endpoint to prepare an AuthorizeDerivedKey transaction.
2. Sign the AuthorizeDerivedKey transaction using derived key seed.
3. Submit the signed transaction with `/submit-transaction`.