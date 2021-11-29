# Compress a Base58Check public key

A simple node.js snippet that parses a base58check DeSo public key, such as:
```
tBCKYSv2DVXFWJKjwMkwFhmtghBR2JvhBrXvMRKzj3XG2uYqEJoWCH
```
To a compressed, 33 byte, format like this:
```
03e0ec4214b6bc61ef1097658406541371e3f01a03a79c9e424f3a2dde77aac5c3
```
This useful when handling derived keys, where you have to append the
33-byte derived public key in transaction ExtraData, e.g. via 
`/api/v0/append-extra-data` Backend API endpoint. Check out the
[Identity docs](https://docs.deso.org) for more details.