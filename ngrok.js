const ngrok = require('ngrok');

(async function() {

  const url = await ngrok.connect({
    proto: 'http', // http|tcp|tls, defaults to http
    addr: "35.154.41.84:8080", // port or network address, defaults to 80
  });
  console.log(url);
})();