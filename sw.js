const cache_options = {
    module_cache : "modules"
}

self.addEventListener("fetch", async (event) => {
    // I cannot devel html/js if the files are being cached!

    if (event.request.url.endsWith(".html") ||
        event.request.url.endsWith(".js") ) {
        console.log("... dont cache html: ",event.request.url)
        return
    }
    return event.respondWith( cache_first(event.request) )
});  


async function cache_first(request){
    let responseFromCache = await caches.match(request.url);
    if (!responseFromCache){      
         const module_cache = await caches.open(cache_options.module_cache)
         await module_cache.add(request.url)
         responseFromCache = await caches.match(request.url);
    }

    return responseFromCache
}