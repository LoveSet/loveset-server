const https = require("https");
const { bingSearchKey } = require("../config/config");

const SUBSCRIPTION_KEY = bingSearchKey;

function bing(query) {
  return new Promise((resolve, reject) => {
    https.get(
      {
        hostname: "api.bing.microsoft.com",
        path: "/v7.0/search?q=" + encodeURIComponent(query),
        headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY },
      },
      (res) => {
        let body = "";
        res.on("data", (part) => (body += part));
        res.on("end", () => {
          for (var header in res.headers) {
            if (
              header.startsWith("bingapis-") ||
              header.startsWith("x-msedge-")
            ) {
              console.log(header + ": " + res.headers[header]);
            }
          }
          resolve(JSON.parse(body));
        });
        res.on("error", (e) => {
          console.log("Error: " + e.message);
          reject(e);
        });
      }
    );
  });
}

// const query =
//   "https://screenrant.com/originals-seasons-ranked-rotten-tomatoes/";
// bingWebSearch(query);

module.exports = bing;
