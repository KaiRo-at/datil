/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

// See http://dygraphs.com/ for graphs documentation.

var gBody, gGraph, gSelID, gBranchSelect, gADICheckbox, gDataIssueDays,
    gRawData, gUseADI = true;

var gDataPath = "../../";
// for local debugging
//gDataPath = "../socorro/";

var gBranches = {
  fxrel: {
    title: "Firefox release channel",
    datafile: "Firefox-release-bytype.json",
    annotationfile: "Firefox-release-annotations.json",
    plugins: true,
    sumContent: true,
    maxRate: 3,
    maxCrashes: 2.2e6,
  },
  fxbeta: {
    title: "Firefox beta channel",
    datafile: "Firefox-beta-bytype.json",
    annotationfile: "Firefox-beta-annotations.json",
    plugins: true,
    sumContent: true,
    maxRate: 3,
    maxCrashes: 80e3,
  },
  andrel: {
    title: "Firefox for Android release channel",
    datafile: "FennecAndroid-release-bytype.json",
    annotationfile: "FennecAndroid-release-annotations.json",
    plugins: false,
    sumContent: false,
    maxRate: 4,
    maxCrashes: 100e3,
  },
  andbeta: {
    title: "Firefox for Android beta channel",
    datafile: "FennecAndroid-beta-bytype.json",
    annotationfile: "FennecAndroid-beta-annotations.json",
    plugins: false,
    sumContent: false,
    maxRate: 11,
    maxCrashes: 10e3,
  },
}

window.onload = function() {
  // Get data to graph.
  gBody = document.getElementsByTagName("body")[0];
  gBranchSelect = document.getElementById("branch");
  gBranchSelect.onchange = function() {
    location.href = '?' + gBranchSelect.value;
  }
  var option;
  for (var branchID in gBranches) {
    option = document.createElement("option");
    option.value = branchID;
    option.text = gBranches[branchID].title;
    gBranchSelect.add(option);
  }
  gADICheckbox = document.getElementById("adiCheckbox");
  gADICheckbox.checked = gUseADI;
  gADICheckbox.onchange = function(aCheckbox) {
    gUseADI = gADICheckbox.checked;
    graphData(gRawData);
  }

  if (location.search) {
    var urlAnchor = location.search.substr(1); // Cut off the ? sign.
    if (urlAnchor in gBranches) {
      gSelID = urlAnchor;
      gBranchSelect.value = urlAnchor;
    }
  }
  else {
    gSelID = "fxrel";
  }
  fetchFile(gDataPath + "dataissue-days.json", "json",
    function(aData) {
      if (aData) {
        gDataIssueDays = aData;
      }
      else {
        console.log("Error loading data issue days.");
      }
    }
  );

  fetchFile(gDataPath + gBranches[gSelID].datafile, "json", graphData);
}

window.onresize = function() {
  gGraph.resize(
    gBody.clientWidth,
    gBody.clientHeight - graphDiv.offsetTop
  );
}

function graphData(aData) {
  var graphDiv = document.getElementById("graphdiv");
  gRawData = aData;
  if (aData) {
    var graphData = [], dataArray, browserCrashes;
    var crUnit = (gBranches[gSelID].maxCrashes > 1e6) ? "M" : "k";
    var crUnitNum = (gBranches[gSelID].maxCrashes > 1e6) ? 1e6 : 1e3;
    var yAxisMax = gUseADI ? gBranches[gSelID].maxRate : gBranches[gSelID].maxCrashes / crUnitNum;
    var yAxisDecimals = (yAxisMax > 20) ? 0 : 1;
    // add elements in the following format: [ new Date("2009-07-12"), 100, 200 ]
    for (var day in aData) {
      dataArray = [ new Date(day) ];
      if (gBranches[gSelID].sumContent) {
        browserCrashes = 0;
        if (aData[day].crashes["Browser"]) { browserCrashes += aData[day].crashes["Browser"]; }
        if (aData[day].crashes["Content"]) { browserCrashes += aData[day].crashes["Content"]; }
        dataArray.push(browserCrashes * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
      }
      else {
        dataArray.push(aData[day].crashes["Browser"] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
      }
      if (gBranches[gSelID].plugins) {
        dataArray.push(aData[day].crashes["OOP Plugin"] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
        dataArray.push(aData[day].crashes["Hang Plugin"] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
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
      ylabel: gUseADI ? "crashes / 100 ADI" : "crashes",
      valueRange: [0, yAxisMax + .01],
      axes: {
        x: {
          axisLabelFormatter: function(aDate) {
            return (aDate.getUTCMonth() + 1) + "/" + aDate.getUTCFullYear();
          },
          valueFormatter: function(aMilliseconds) {
            var dateValue = new Date(aMilliseconds);
            return dateValue.getUTCFullYear() + "-" +
              (dateValue.getUTCMonth() < 9 ? "0" : "") + (dateValue.getUTCMonth() + 1 ) + "-" +
              (dateValue.getUTCDate() < 10 ? "0" : "") + dateValue.getUTCDate();
          },
        },
        y: {
          axisLabelFormatter: function(aNumber) {
            return aNumber.toFixed(yAxisDecimals) + (gUseADI ? "" : crUnit);
          },
          valueFormatter: function(aNumber) {
            return aNumber.toFixed(2) + (gUseADI ? "" : crUnit);
          },
        },
      },
      colors: colors,
      strokeWidth: 2,
      legend: 'always',
      labels: labels,
      labelsSeparateLines: true,
      labelsShowZeroValues: true,
      width: gBody.clientWidth,
      height: gBody.clientHeight - graphDiv.offsetTop,
    };

    gGraph = new Dygraph(graphDiv, graphData, graphOptions);
    gGraph.ready(function() {
      fetchFile(gDataPath + gBranches[gSelID].annotationfile, "json",
        function(aData) {
          if (aData) {
            // Convert dates to Date objects so they can be displayed.
            for (var i = 0; i < aData.length; i++) {
              aData[i]["x"] = Date.parse(aData[i]["x"]);
            }
            if (gDataIssueDays) {
              for (var i = 0; i < gDataIssueDays.length; i++) {
                aData.push({
                  series: labels[labels.length - 1],
                  x: Date.parse(gDataIssueDays[i]),
                  shortText: "D",
                  text: "Data Issue (missing ADI or crashes)",
                  attachAtBottom: true,
                  cssClass: "dataissue",
                });
              }
            }
            gGraph.setAnnotations(aData);
          }
          else {
            console.log("Error loading annotation data.");
          }
        }
      );
      console.log("foo");
    });
  }
  else {
    // ERROR! We're screwed!
    graphDiv.textContent = "Error loading JSON data.";
  }
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
