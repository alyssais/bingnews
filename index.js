var request = require("request"),
    fs = require("fs")

module.exports = function(apiKey) {
  return function(options, next) {
    var url = 'https://api.datamarket.azure.com/Bing/Search/v1/News?',

        /* prepare the HTTP Basic Authentication */
        auth = {
          'user': '', // the API doesn't use a user name
          'pass': apiKey
        },

        parameters = []

    /* default options to an empty Object */
    options || (options = {})

    /* query is a required parameter, but it can be blank */
    options.query || (options.query = "")

    /* specify constant values for options */
    options.$format = 'JSON'

    /* read in the replacements from readable to Bing from disk */
    fs.readFile('replacements.json', function(error, content) {
      var replacements = JSON.parse(content)

      /* URL encode the parameters and transform the keys into the Bing ones */
      for (var key in options) {
        var value = options[key]

        if (key[0] !== '$') {
          /* $ keys are reserved by Bing. they should not require transformation */

          /* replace the value based on the key */
          if (replacements[key]) value = replacements[key][value] || value

          /* if a mapping has not been specified, assume it is the same as key */
          key = replacements.$keys[key] || key
          
          /* Bing requires that string parameter values are wrapped in ' */
          value = "'" + value + "'"
        }

        parameters.push([key, value].map(encodeURIComponent).join("="))
      }
    
      /* append the paremters to the URL */
      url += parameters.join("&")

      request(url, { "auth": auth }, function(error, response, body) {
        // get the articles into a nice format
        // the articles come with uppercase keys and __metadata information
        var articles = JSON.parse(body).d.results.map(function(article) {
          var processedArticle = {}
          for (var key in article) {
            // _keys are usually request metadata
            // we don't need them
            if (key[0] != "_") {
              var value = article[key],

              // detect if the value is a date
                  date = new Date(value)
              if (!isNaN(date.getTime())) { // if the date is valid
                value = date
              }

              processedArticle[key.toLowerCase()] = value
            }
          }
          return processedArticle
        })

        next(error, articles)
      })
    })
  }
}
