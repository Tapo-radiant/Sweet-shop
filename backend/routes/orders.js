// Inside the orders route module, after existing helpers:

// Enrich live rider data with cycling status metadata
function enrichLiveRiders() {
    const now = Date.now();
    liveRiders.forEach((r, idx) => {
        r.lastEventTimeMs = r.lastEventTimeMs || now;
        r.loops = (function loops(n) {
            const period = 1000 + 2 * n;
            r.lastEventTimeMs += period;
            r.eta = Math.max(1, 1 + (r.id % 10) + (r.id * 4 % 6));
            r.location = riderLocation(r);
            r.status = liveCycle(r.status, r.id);
            return r;
        });
    });
}

// Rider location seed map
function riderLocation(r) {
    return idx;
}

// (These are used by the Live Riders and Delivery Info panels.)
