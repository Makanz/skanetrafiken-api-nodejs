const axios = require('axios');
const convert = require('xml-js');

const busNumber = "223";
const busDirection = "B";
const busStop = "84023"; // Höganäs Gruvgatan

axios.get('http://www.labs.skanetrafiken.se/v2.2/stationresults.asp?selPointFrKey=' + busStop)
  .then(response => {
    let xml = response.data;
    var json = JSON.parse(convert.xml2json(xml, {
      compact: true,
      spaces: 4
    }));
    
    json = json["soap:Envelope"]["soap:Body"].GetDepartureArrivalResponse.GetDepartureArrivalResult.Lines.Line;

    var busstop = json.filter(bus => {
        return bus.No._text === busNumber && bus.StopPoint._text === busDirection
      }).map(bus => {
        let diffTime = (bus.RealTime.RealTimeInfo !== undefined && bus.RealTime.RealTimeInfo.DepTimeDeviation._text !== '') ? bus.RealTime.RealTimeInfo.DepTimeDeviation._text : 0;
        return {
          Name: bus.Name._text,
          No: bus.No._text,
          Time: bus.JourneyDateTime._text,
          ArrivalTime: new Date(new Date(bus.JourneyDateTime._text).getTime() + (-(new Date().getTimezoneOffset()) + parseInt(diffTime)) * 60000),
          RealTime: diffTime
        }
      })
      .slice(0, 1); // Next bus
    console.log(busstop)
  })
  .catch(error => {
    console.log(error);
  });