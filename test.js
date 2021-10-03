const axios = require('axios')

async function main() {
    // getting the homepage should return some text
    await axios.get("http://localhost:3000/").then(r => {
        console.log("GET", r.data)
    })

    // not providing "url" in the post JSON should failed
    await axios.post('http://localhost:3000/', {'urll': "google.com"})
        .then(r => {
            console.log('BAD', "POST DID NOT FAIL", r.data)
        })
        .catch(error => {
            console.log("GOOD", "post failed successfully", error.response.data)
        })

    // posting with a url should work
    await axios.post('http://localhost:3000/', {
        'url': "https://google.com"
    }).then(r => {
        console.log("GOOD", "test passed", r.data)
    }).catch(error => {
        console.log("BAD", "post didn't work when it hsould", error.response.data)
    })

    // getting that new short url should work
    // TODO: stop hard coding this url and use the previous response
    await axios.get('http://localhost:3000/05046f2').then(r => {
        console.log("GOOD", "get redirect success", r.status)
    }).catch(error => {
        console.log("BAD", "get redirect failed", error.status)
    })

    // adding one with a bad domain for load testing
    await axios.post('http://localhost:3000/', {
        'url': "https://google.comm"
    }).then(r => {
        console.log("GOOD", "test passed", r.data)
    }).catch(error => {
        console.log("BAD", "post didn't work when it should", error.response.data)
    })

    // adding a custom name
    await axios.post('http://localhost:3000/', {
        'url': "https://fish.com",
        'customName': "fishingTime"
    }).then(r => {
        console.log("GOOD", "test passed", r.data)
    }).catch(error => {
        console.log("BAD", "post didn't work when it should", error.response.data)
    })

}

// we set timeout 100ms to give index.js a chance to start
setTimeout(main, 100);