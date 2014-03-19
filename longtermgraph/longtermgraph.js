/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

// See http://dygraphs.com/ for graphs documentation.

var gBody, gGraph, gSelID;

var gDataPath = "../../";
// for local debugging
//gDataPath = "../socorro/";

var gBranches = {
  fxrel: {
    title: "Firefox release channel",
    datafile: "Firefox-release-bytype.json",
    plugins: true,
    sumContent: true,
    maxRate: 3,
  },
  fxbeta: {
    title: "Firefox beta channel",
    datafile: "Firefox-beta-bytype.json",
    plugins: true,
    sumContent: true,
    maxRate: 3,
  },
  andrel: {
    title: "Firefox for Android release channel",
    datafile: "FennecAndroid-release-bytype.json",
    plugins: false,
    sumContent: false,
    maxRate: 4,
  },
  andbeta: {
    title: "Firefox for Android beta channel",
    datafile: "FennecAndroid-beta-bytype.json",
    plugins: false,
    sumContent: false,
    maxRate: 11,
  },
}

window.onload = function() {
  // Get data to graph.
  gBody = document.getElementsByTagName("body")[0];
  if (location.hash) {
    var urlAnchor = location.hash.substr(1); // Cut off the # sign.
    if (urlAnchor in gBranches) {
      gSelID = urlAnchor;
    }
  }
  else {
    gSelID = "fxrel";
  }

  fetchFile(gDataPath + gBranches[gSelID].datafile, "json",
    function(aData) {
      graphDiv = document.getElementById("graphdiv");
      if (aData) {
        var graphData = [], dataArray, browserCrashes;
        // add elements in the following format: [ new Date("2009/07/12"), 100, 200 ]
        for (var day in aData) {
          dataArray = [ new Date(day) ];
          if (gBranches[gSelID].sumContent) {
            browserCrashes = 0;
            if (aData[day].crashes["Browser"]) { browserCrashes += aData[day].crashes["Browser"]; }
            if (aData[day].crashes["Content"]) { browserCrashes += aData[day].crashes["Content"]; }
            dataArray.push(100 * browserCrashes / aData[day].adi);
          }
          else {
            dataArray.push(100 * aData[day].crashes["Browser"] / aData[day].adi);
          }
          if (gBranches[gSelID].plugins) {
            dataArray.push(100 * aData[day].crashes["OOP Plugin"] / aData[day].adi);
            dataArray.push(100 * aData[day].crashes["Hang Plugin"] / aData[day].adi);
          }
          graphData.push(dataArray);
        }

        var colors = ["#004080"], labels = ["date"];
        if (gBranches[gSelID].sumContent) {
          labels.push("browser+content crashes");
        }
        else {
          labels.push("browser crashes");
        }
        if (gBranches[gSelID].plugins) {
          labels.push("plugin crashes");
          labels.push("plugin hangs");
          colors.push("#FF8000");
          colors.push("#FFCC00");
        }
        var graphOptions = {
          title: gBranches[gSelID].title,
          ylabel: "crashes / 100 ADI",
          valueRange: [0, gBranches[gSelID].maxRate + .01],
          axes: {
            x: {
              axisLabelFormatter: function(aDate) {
                return (aDate.getMonth() + 1) + "/" + aDate.getFullYear();
              },
            },
            y: {
              axisLabelFormatter: function(aNumber) {
                return aNumber.toFixed(1);
              },
            },
          },
          colors: colors,
          strokeWidth: 2,
          legend: 'always',
          labels: labels,
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
