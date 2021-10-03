/*
It's a pain to setup a db and deploy an app with a real DB on free instances.
We'll use an in memory db instead.
Very fast and get a clean database on each app start
 */

module.exports = class InMemoryDatabase {
    db = {}
    // these are just async because real db calls should be async
    async getURLFromHash(hash){
        if (hash in this.db) return this.db[hash].target_url;
        throw 'hash not found in database'
    }
    async addToDatabase(url, hash){
        if (hash in this.db && this.db[hash] !== url) throw 'hash already in database'
        const entry = {
            "target_url": url,
            'id': hash,
            // This date will include a timezone and be in the TZ of the server
            "created": new Date(),
            "domain": (new URL(url)).hostname, // This includes subdomains. It also makes the domain lowercase
            "stats": {
                // choosing to track total visits here instead of summing up day visits just for simplicity and speed
                "total_visits": 0,
                "visits_by_day": { }
            }
        }
        this.db[hash] = entry;
    }
    async getStatsFromHash(hash){
        if (hash in this.db) return this.db[hash];
        throw 'hash not found in database'
    }
    async addViewToHash(hash){
        // Here we are using UTC date for simplicity.
        // this is in YYYY-MM-DD format
        const date = (new Date()).toISOString().split('T')[0];
        const entry = await this.getStatsFromHash(hash);
        entry.stats.total_visits += 1;
        entry.stats.visits_by_day[date] = entry.stats.visits_by_day[date] ? entry.stats.visits_by_day[date] + 1 : 1;
    }
}