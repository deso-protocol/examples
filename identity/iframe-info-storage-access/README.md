# Storage Access in DeSo Identity iframe

A simple Vanilla JS snippet that shows the logic of handling `info` requests in the DeSo Identity iframe.
Generally, the best practice is to only handle the storage access communication when user performs some 
action in your application. For example, let's say the first action a user preformed in your app is giving a like.
You would have previously opened the iframe context, and handled the `initialize` message. Now you want to
send a `sign` message to the iframe to sign the like transaction. However, prior to submitting the request to
the iframe, you must send an `info` request to ensure DeSo Identity iframe context has the correct storage access.
In the snippet, this means you would have called the `sendRequest()` function and had it send a `sign` message in
`then` (`Promise` success). We use the `Promise` primitive to handle asynchrony in communicating with the Identity. 
The general flow of the snippet is as follows:
1. Call `sendRequest()`
2. `sendRequest` calls `hasStorageAccess()` which sends an `info` request to iframe
3. Receive a response to the `info` request
   1. If iframe doesn't have the storage access, show the window to the user.
   2. Handle the `storageGranted` message when user clicks on the `iframe` window.
   3. Set `storageAccess` to `true`.
4. Send the desired `sign` message.