const axios = require('axios');
const convert = require('xml-js');

let stationFrom = {
    name: 'Höganäs Gruvgatan',
    id: 84023
}
let stationTo = {
    name: 'Helsingborg Sundstorget',
    id: 83348
}

async function apiResultsPage(from, to) {
    let result = {};    
    let date = new Date(new Date().setMinutes( new Date().getMinutes() - 10 ));
    date = date.toISOString().substr(0, 16).replace('T', '%20');

    await axios.get('http://www.labs.skanetrafiken.se/v2.2/resultspage.asp?cmdaction=next&selPointFr='+from.name+'|'+from.id+'|0&selPointTo='+to.name+'|'+to.id+'|0&LastStart=' + date)
        .then(response => {
        let xml = response.data;
        var json = JSON.parse(convert.xml2json(xml, {
            compact: true,
            spaces: 4
        }));

        searchResult = json["soap:Envelope"]["soap:Body"].GetJourneyResponse.GetJourneyResult.Journeys.Journey;

        let route = searchResult[0].RouteLinks.RouteLink[0];

        let diffTime = (route.RealTime.RealTimeInfo !== undefined && route.RealTime.RealTimeInfo.DepTimeDeviation._text !== '') ? route.RealTime.RealTimeInfo.DepTimeDeviation._text : 0;

        let time = new Date(new Date(route.DepDateTime._text).getTime() + (-(new Date().getTimezoneOffset()) + parseInt(diffTime)) * 60000);
        
        result = {
            name: route.Line.Name._text,
            departure: time.toLocaleTimeString().substring(0,5),
            delayed: (diffTime > 0)
        }

        })
        .catch(error => {
            console.log(error);
        });
        
    return result;
}

async function getNextDeparture(from, to) {
    let transport = await apiResultsPage(from, to);
    console.log(transport);
}

getNextDeparture(stationFrom, stationTo);