BingNews
========

A Node library for getting news data from Bing

Usage
-----

```javascript
var bingNews = require("BingNews")("API_KEY")

bingNews({ "query": "rabbits", "category": "politics" }, function(error, articles) {
  console.log(articles)
})
```
