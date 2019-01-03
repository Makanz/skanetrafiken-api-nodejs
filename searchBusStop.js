const axios = require('axios');
const convert = require('xml-js');

const searchQuery = "Gruvgatan";

axios.get('http://www.labs.skanetrafiken.se/v2.2/querystation.asp?inpPointfr=' + encodeURIComponent(searchQuery))
  .then(response => {
    let xml = response.data;
    var json = JSON.parse(convert.xml2json(xml, {
      compact: true,
      spaces: 4
    }));

    searchResult = json["soap:Envelope"]["soap:Body"].GetStartEndPointResponse.GetStartEndPointResult.StartPoints.Point;

    if(searchResult.length > 1) {
        searchResult = searchResult.map((busStop) => {
            return {
                Name: busStop.Name._text,
                Id: busStop.Id._text
            }
        });
        console.log(searchResult);
    } else {
        console.log({
            Name: searchResult.Name._text,
            Id: searchResult.Id._text
        });
    }
    
  })
  .catch(error => {
    console.log(error);
  });