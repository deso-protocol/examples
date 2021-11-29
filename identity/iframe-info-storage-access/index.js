// This will be a list of pending requests that we've sent to the DeSo Identity.
const req = {};
let storageAccess = false;

// Vanilla Javascript implementation of UUID v4
// https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)
// If you're using node.js, you can also use the uuid npm package
// https://www.npmjs.com/package/uuid
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// We will use this method as middleware to ensure that the Identity iframe has access to storage.
function hasStorageAccess () {
    // The promise will resolve when storage was granted, otherwise it will reject.
    return new Promise( (resolve, reject) => {
        // If storage was already granted in the past, we resolve immediately.
        if (storageAccess){
            resolve();
        } else {
            // We send an info request to the DeSo Identity window to check if we have storage access.
            const id = uuid();
            document.getElementById("identity").contentWindow.postMessage({
                id,
                service: 'identity',
                method: 'info'
            }, '*');
            // We add an object to the pending Identity requests containing context of the promise.
            req[id] = {resolve, reject};
        }
    });
}

// This function shows the general logic of sending requests to the DeSo Identity
// iframe context. It should handle requests such as sign, encrypt, JWT, etc.
function sentRequest() {
    hasStorageAccess()
        .then( () => {
            // Send your request, such as sign, encrypt, JWT, etc.
        })
        .catch( () => {
            // Inform the user that they can't use the DeSo Identity.
        })
}

// This is a general event handler for messages from the DeSo Identity. You should
// implement handler logic for all iframe responses here.
window.addEventListener('message', message => {
    // This is a check to make sure the message is coming form the DeSo Identity.
    if(message.data.service !== "identity")
        return;

    const id = message.data.id;
    const payload = message.data.payload;
    switch(message.data.method){
        // If we're receiving a message with method: "info", that means we've previously
        // sent an info request to the DeSo Identity through hasStorageAccess().
        case "info":
            if (req[id]) {
                // If browser isn't supported by the DeSo Identity we return.
                if (!payload.browserSupported){
                    req[id].reject();
                    delete req[id];
                    break;
                }
                // If the DeSo Identity doesn't have storage access, we will have to
                // display the iframe window to the user and wait for him to grant it.
                if (!payload.hasStorageAccess){
                    document.getElementById("identity").style.display = "block";
                } else {
                    // Otherwise,
                    storageAccess = true;
                    req[id].resolve();
                    delete req[id];
                }
            }
            break;
        case "storageGranted":
            // If we receive a "storageGranted" message, then the storage access flow worked.
            // This message will not contain an id, as Identity doesn't expect a response.
            // That's why we iterate over all reqs to see if there are any pending "info" promises.
            for (let id in req){
                if (req[id].method === "info"){
                    // We set storage access to true because storage was granted.
                    storageAccess = true;
                    // We can also resolve the pending promise.
                    req[id].resolve();
                    // Finally we can delete the corresponding req.
                    delete req[id];
                }
            }
            break;
        // Add other message cases, such as initialize, login, etc.
    }
});