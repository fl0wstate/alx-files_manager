## Simple File Manager on the Web!
---
- Tech Stack will include; redis, mongodb, express, nodejs.
- Making a simple file upload, and download webapp on the web.
- Main goal is to make sure one has a better understanding of caching, queing requests, and many more nodejs functionality.

---
## Synchronous Limits
- All events emitted are usually Asynchronous function, meaning you can either handle them, legacy code callback orasync await.
- Had a bit of a challenge while checking for the node-redis client connection status.
    ```javascript
    ...

    (async () => {
        // will return false immediately due to the sync nature of the function
        console.log(redisClient.isAlive());   // false

        settimeout(() => {
            // allows a time delay, making sure that the connection was made correctly
            console.log(redisClient.isAlive());   // true
        }, 2000);

        ...
    })();

    ```
- Promisify allows you to turn legacy callback methods into promise objects.
-** 
