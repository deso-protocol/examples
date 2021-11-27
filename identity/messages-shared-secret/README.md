# Handling Messages via Shared Secrets

A node.js snippet that implements message encryption/decryption using shared secrets. This snippet assumes that we already called the Identity window API under `/get-shared-secrets` endpoint to retrieve a shared secret. The code does the following steps:
1. Encrypt a test message with a shared secret.
2. (Optional) Verify that the message was encrypted properly by decrypting the ciphertext.
3. Prepare a send message transaction by calling `/api/v0/send-message-stateless`