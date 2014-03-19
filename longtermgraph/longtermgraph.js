/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

// See http://dygraphs.com/ for graphs documentation.

var gBody, gGraph;

window.onload = function() {
  // Get data to graph.
  gBody = document.getElementsByTagName("body")[0];
  var dataFile = "../../Firefox-release-bytype.json";
  // for local debugging
  //var dataFile = "../socorro/Firefox-release-bytype.json";

  fetchFile(dataFile, "json",
    function(aData) {
      graphDiv = document.getElementById("graphdiv");
      if (aData) {
        var graphData = [];
        // add elements in the following format: [ new Date("2009/07/12"), 100, 200 ]
        for (var day in aData) {
          graphData.push([
            new Date(day),
            100 * aData[day].crashes["Browser"] / aData[day].adi,
            100 * aData[day].crashes["OOP Plugin"] / aData[day].adi,
            100 * aData[day].crashes["Hang Plugin"] / aData[day].adi,
          ]);
        }

        var graphOptions = {
          title: "Firefox release channel",
          ylabel: "crashes / 100 ADI",
          valueRange: [0, 3.01],
          axes: {
            x: {
              axisLabelFormatter: function(date) {
                return date.getFullYear() + "/" + (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1 );
              },
            },
            y: {
              axisLabelFormatter: function(number) {
                return number.toFixed(1);
              },
            },
          },
          colors: ["#004080", "#FF8000", "#FFCC00"],
          legend: 'always',
          labels: ["date", "browser crashes", "plugin crashes", "plugin hangs"],
          labelsSeparateLines: true,
          width: gBody.clientWidth,
          height: gBody.clientHeight - graphDiv.offsetTop,
        };

        gGraph = new Dygraph(graphDiv, graphData, graphOptions);
      }
      else {
        // ERROR! We're screwed!
        graphDiv.textContent = "Error loading JSON data.";
      }
    }
  );
}

window.onresize = function() {
  gGraph.resize(
    gBody.clientWidth,
    gBody.clientHeight - graphDiv.offsetTop
  );
}

function fetchFile(aURL, aFormat, aCallback) {
  var XHR = new XMLHttpRequest();
  XHR.onreadystatechange = function() {
    if (XHR.readyState == 4) {/*
      gLog.appendChild(document.createElement("li"))
          .appendChild(document.createTextNode(aURL + " - " + XHR.status +
                                               " " + XHR.statusText));*/
    }
    if (XHR.readyState == 4 && XHR.status == 200) {
      // so far so good
      if (XHR.responseXML != null && aFormat == "xml" &&
          XHR.responseXML.getElementById('test').firstChild.data)
        aCallback(aXHR.responseXML.getElementById('test').firstChild.data);
      else if (XHR.responseText != null && aFormat == "json")
        aCallback(JSON.parse(XHR.responseText));
      else
        aCallback(XHR.responseText);
    } else if (XHR.readyState == 4 && XHR.status != 200) {
      // fetched the wrong page or network error...
      aCallback(null);
    }
  };
  XHR.open("GET", aURL);
  if (aFormat == "json") { XHR.setRequestHeader("Accept", "application/json"); }
  else if (aFormat == "xml") { XHR.setRequestHeader("Accept", "application/xml"); }
  try {
    XHR.send();
  }
  catch (e) {
    aCallback(null);
  }
}
