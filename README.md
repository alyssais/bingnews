bingnews
========

A Node library for getting news data from Bing

Usage
-----

```javascript
var bingNews = require("bingnews")("API_KEY")

bingNews({ "query": "rabbits", "category": "politics" }, function(error, articles) {
  console.log(articles)
})
```
