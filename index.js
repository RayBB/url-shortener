const express = require('express')
const app = express()
app.use(express.json())
const crypto = require('crypto')
const InMemoryDatabase = require("./database");

const PORT = process.env.PORT || 3000;
// this is the domain where the current instance is hosted
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`
const DATABASE_CLIENT = new InMemoryDatabase();

app.get('/', function (req, res) {
    return res.send('this is a url shortener')
})

app.get('/:id/stats', async function (req, res) {
    // TODO: stop doing try/catch in every route and have it encapsulated somewhere
    try {
        return res.json(await DATABASE_CLIENT.getStatsFromHash(req.params['id']));
    } catch (e) {
        return res.status(500).json({'message': e.toString()})
    }
})

app.post('/', async function (req, res) {
    /*
    Expected body:
    { "url": "https://www.google.com",
      "customName": "str" // optional but cannot be empty string
    }
     */
    // TODO: validate the url
    if (!('url' in req.body)) {
        return res.status(400).json({'message': 'url not in body'})
    }
    if ('customName' in req.body) {
        await createCustomUrl(req.body['url'], req.body['customName'])
        return res.json(await DATABASE_CLIENT.getStatsFromHash(req.body['customName']));
    }
    try {
        const hash = await createShortHash(req.body['url']);
        // return the stats page for simplicity
        return res.json(await DATABASE_CLIENT.getStatsFromHash(hash));
    } catch {
        return res.status(500).json({'message': 'unknown error'})
    }
})

async function createCustomUrl(longerUrl, customName) {
    // we would probably want to validate the custom string before doing this
    return DATABASE_CLIENT.addToDatabase(longerUrl, customName)
}

async function createShortHash(longerUrl, addTabs = 0) {
    const shortLength = 7; // arbitrarily picked based on the example url
    if (addTabs >= 10) throw 'uh oh, 10 collisions in a row, something is wrong'
    const shorter = digestMessage(longerUrl + "\t".repeat(addTabs)).slice(0, shortLength);
    // according to https://stackoverflow.com/posts/36667242/revisions tab shouldn't be in urls
    // so lets just get the hash with an additional tab when there is a collision
    try {
        await DATABASE_CLIENT.addToDatabase(longerUrl, shorter)
    } catch {
        return createShortHash(longerUrl, addTabs + 1)
    }
    return shorter;
}


/*
Algo explained here https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#examples
 */
function digestMessage(message) {
    return crypto.createHash("sha256").update(message).digest("hex");
}

async function handleAllOtherPaths(req, res) {
    const everythingAfterSlash = req.originalUrl.slice(1);
    try {
        const url = await DATABASE_CLIENT.getURLFromHash(everythingAfterSlash);
        // We should be careful here about what db client you're using.
        // If it takes any substantial time to add the view data you may not want to block on that.
        await DATABASE_CLIENT.addViewToHash(everythingAfterSlash);
        return res.redirect(301, url);
    } catch (e) {
        console.log(`failed to getUrl for "${everythingAfterSlash}"`)
        console.log(e);
        return res.status(404).json({'message': "Error no url found for hash " + everythingAfterSlash});
    }
}

app.use(handleAllOtherPaths)

app.listen(PORT, () => {
    console.log(`URL shortener listening at http://localhost:${PORT}`)
})
