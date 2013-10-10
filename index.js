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

      request(url, { 'auth': auth }, function(response, error, body) {
        var articles = JSON.parse(body).d.results
        next(error, articles)
      })
    })
  }
}
