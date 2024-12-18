const CACHE_NAME = "Conchbrain-Version"

const PRE_CACHED_RESOURCES = [
    "/",
    "favicon.ico",
    "favicon_color.ico",
    "SiteMap.txt",

    "image/notfound.png",
    "image/pic1.png",
    "image/pic2.png",
    "image/pic3.png",
    "image/pic4.png",
    "image/pic5.png",
    "image/pic6.png",

    "view/cloudshell.html",
    "view/corsproxy.html",
    "view/dockerproxy.html",
    "view/home.html",
    "view/intro.html",
    "view/kv.html",
    "view/mixstore.html",
    "view/notfound.html",
    "view/tmail.html",
    "view/toss.html",
    "view/webproxy.html",

    "css/cloudshell.css",
    "css/home.css",
    "css/index.css",
    "css/intro.css",
    "css/notfound.css",
    "css/webproxy.css",

    "js/index.js",
    "js/intro.js",
    "js/tmail.js",
    "js/toss.js",
    "js/webproxy.js",

    "https://fastly.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css",
    "https://fastly.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
    "https://fastly.jsdelivr.net/gh/CodeByZach/pace/themes/blue/pace-theme-barber-shop.css",

    "https://fastly.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js",
    "https://fastly.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js",
    "https://fastly.jsdelivr.net/gh/CodeByZach/pace/pace.min.js"
]

self.addEventListener("install", event => {
    async function preCacheResources() {
        const cache = await caches.open(CACHE_NAME)
        cache.addAll(PRE_CACHED_RESOURCES)
    }

    event.waitUntil(preCacheResources())
})

self.addEventListener("fetch", event => {
    async function returnCachedResource() {

        const cache = await caches.open(CACHE_NAME)
        const cachedResponse = await cache.match(event.request.url)

        if (cachedResponse) {
            return cachedResponse
        }
        else {
            const fetchResponse = await fetch(event.request)

            if (PRE_CACHED_RESOURCES.includes(event.request.url)) {
                cache.put(event.request.url, fetchResponse.clone())
            }

            return fetchResponse
        }
    }

    event.respondWith(returnCachedResource())
})

self.addEventListener("activate", event => {
    async function deleteOldCaches() {

        const names = await caches.keys()
        await Promise.all(names.map(name => {
            if (name !== CACHE_NAME) {
                return caches.delete(name)
            }
        }))
    }

    event.waitUntil(deleteOldCaches())
})

self.addEventListener('message', event => {
    if (event.data == 'SKIP_WAITING') {
        self.skipWaiting()
    }
})
