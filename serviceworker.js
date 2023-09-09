const CACHE_NAME = "ConchbrainClub-v1.3";

const PRE_CACHED_RESOURCES = [
    "/",
    "favicon.ico",
    "SiteMap.txt",

    "images/notfound.png",
    "images/pic1.png",
    "images/pic2.png",
    "images/pic3.png",
    "images/pic4.png",
    "images/pic5.png",
    "images/pic6.png",

    "images/cloudshell/alpine.png",
    "images/cloudshell/archlinux.png",
    "images/cloudshell/centos.png",
    "images/cloudshell/debian.png",
    "images/cloudshell/fedora.png",
    "images/cloudshell/kali.png",
    "images/cloudshell/opensuse.png",
    "images/cloudshell/rockylinux.png",
    "images/cloudshell/ubuntu.png",

    "view/cloudshell.html",
    "view/conch.html",
    "view/corsproxy.html",
    "view/favourites.html",
    "view/home.html",
    "view/intro.html",
    "view/kvstorage.html",
    "view/notfound.html",
    "view/proxyservice.html",
    
    "css/index.css",
    "css/notfound.css",
    "css/home.css",
    "css/intro.css",
    "css/conch.css",
    "css/favourites.css",
    "css/cloudshell.css",
    "css/proxyservice.css",

    "js/index.js",
    "js/intro.js",
    "js/favourites.js",
    "js/conch.js",
    "js/cloudshell.js",
    "js/cloudshell_worker.js",
    "js/proxyservice.js",

    "https://fastly.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css",
    "https://fastly.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
    "https://fastly.jsdelivr.net/gh/CodeByZach/pace/themes/blue/pace-theme-barber-shop.css",

    "https://fastly.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js",
    "https://fastly.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js",
    "https://fastly.jsdelivr.net/gh/CodeByZach/pace/pace.min.js"
];

self.addEventListener("install", event => {
    async function preCacheResources() {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(PRE_CACHED_RESOURCES);
    }

    event.waitUntil(preCacheResources());
});

self.addEventListener("fetch", event => {
    async function returnCachedResource() {

        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request.url);

        if (cachedResponse) {
            return cachedResponse;
        }
        else {
            const fetchResponse = await fetch(event.request);

            if(PRE_CACHED_RESOURCES.includes(event.request.url)) {
                cache.put(event.request.url, fetchResponse.clone());
            }

            return fetchResponse;
        }
    }

    event.respondWith(returnCachedResource());
});

self.addEventListener("activate", event => {
    async function deleteOldCaches() {
        
        const names = await caches.keys();
        await Promise.all(names.map(name => {
            if (name !== CACHE_NAME) {
                return caches.delete(name);
            }
        }));
    }

    event.waitUntil(deleteOldCaches());
});