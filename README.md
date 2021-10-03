A url shortener

# Getting started

`npm install` - install dependencies

`node index.js` - start the server

In a new terminal run: `curl -d '{"url":"https://example.com"}' -H 'Content-Type: application/json' http://localhost:3000`

Response: 
```JSON
{
  "target_url":"https://yahoo.com",
  "id":"cf0d7b5",
  "created":"2021-10-03T19:26:15.415Z",
  "domain":"yahoo.com",
  "stats":
  {
    "total_visits":0,
    "visits_by_day":{}
  }
}
```
Now you can visit http://localhost:3000/cf0d7b5 and be redirected to example.com.

You can also visit http://localhost:3000/cf0d7b5/stats to see the stats for that url.

# Development

Automatic restarting on code change:

`npx nodemon index.js`

Automatically test when code changes:
`npx nodemon test.js`

I recommend running these in separate terminals for easy development.

## Load Testing

I recommend using [hey](https://github.com/rakyll/hey) for some basic load testing.

On my machine a single instance can handle about 6k requests per second.

On heroku we can handle about 600 requests per second.

# Design

I started trying https://github.com/swagger-api/swagger-node but got errors following the setup guide.
That paired with the fact that it has not been updated in a while made me decide to abandon it and stick with basics.

We use an in memory DB. This means each time your app closes all your data will be lost.
This can always be changed to a real document database (or relational if you desire).


# Deployment

You can follow the [heroku guide](https://devcenter.heroku.com/articles/deploying-nodejs).

But if you already have heroku setup on your machine it's as simple as:

`heroku create` - only the first time

`git push heroku main` - whenever you want to deploy

A demo instance is available at https://aqueous-river-19144.herokuapp.com
