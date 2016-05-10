/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

// See http://dygraphs.com/ for graphs documentation.

var gBody, gGraph, gSelID,
    gBranchSelect, gADICheckbox, gCombineBrowserCheckbox,
    gDataIssueDays, gRawData, gMinDay, gType,
    gUseADI = true, gCombineBrowser = true, gADIGraph = false,
    gCategoryGraph = false, gCategoryProcess = "browser", gCatData,
    gESData = false;

// For debugging/development, this is run on localhost.
var gDataPath = (location.hostname == "localhost") ? "../socorro/" : "../../";

var gBranches = {
  fxrel: {
    title: "Firefox release channel",
    shorttitle: "Firefox release",
    filenamebase: "Firefox-release-",
    plugins: true,
    content: false,
    sumContent: true,
    maxRate: 3,
    maxRate_office: 1.5,
    maxRate_browser: 1.5,
    maxRate_plugin: 0.2,
    maxCrashes: 2.2e6,
    maxADI: 130e6,
  },
  fxbeta: {
    title: "Firefox beta channel",
    shorttitle: "Firefox beta",
    filenamebase: "Firefox-beta-",
    plugins: true,
    content: true,
    sumContent: true,
    maxRate: 4,
    maxRate_plugin: 0.3,
    maxCrashes: 80e3,
    maxADI: 3.5e6,
  },
  fxaurora: {
    title: "Firefox Aurora / DevEdition channel",
    shorttitle: "Developer Edition",
    filenamebase: "Firefox-aurora-",
    plugins: true,
    content: true,
    sumContent: true,
    maxRate: 10,
    maxRate_plugin: 0.9,
    maxCrashes: 5e3,
    maxADI: 180e3,
  },
  fxnightly: {
    title: "Firefox Nightly channel",
    shorttitle: "Nightly",
    filenamebase: "Firefox-nightly-",
    plugins: true,
    content: true,
    sumContent: true,
    maxRate: 30,
    maxRate_plugin: 5,
    maxCrashes: 15e3,
    maxADI: 140e3,
  },
  andrel: {
    title: "Firefox for Android release channel",
    shorttitle: "Android release",
    filenamebase: "FennecAndroid-release-",
    plugins: false,
    content: false,
    sumContent: false,
    maxRate: 4,
    maxRate_office: 2.5,
    maxRate_browser: 2.5,
    maxCrashes: 100e3,
    maxADI: 8e6,
  },
  andbeta: {
    title: "Firefox for Android beta channel",
    shorttitle: "Android beta",
    filenamebase: "FennecAndroid-beta-",
    plugins: false,
    content: false,
    sumContent: false,
    maxRate: 11,
    maxRate_office: 5,
    maxRate_browser: 5,
    maxCrashes: 1e3,
    maxADI: 2e5,
  },
  andaurora: {
    title: "Firefox for Android Aurora channel",
    shorttitle: "Android Aurora",
    filenamebase: "FennecAndroid-aurora-",
    plugins: false,
    content: false,
    sumContent: false,
    maxRate: 25,
    maxCrashes: 1e3,
    maxADI: 5e3,
  },
  andnightly: {
    title: "Firefox for Android Nightly channel",
    shorttitle: "Android Nightly",
    filenamebase: "FennecAndroid-nightly-",
    plugins: false,
    content: false,
    sumContent: false,
    maxRate: 50,
    maxRate_office: 30,
    maxCrashes: 1e3,
    maxADI: 6e3,
  },
}

window.onload = function() {
  // Get data to graph.
  gBody = document.getElementsByTagName("body")[0];
  gBranchSelect = document.getElementById("branch");
  gBranchSelect.onchange = function() {
    location.href = "?" + gBranchSelect.value +
                    (gADIGraph ? "-blp" :
                      (gCategoryGraph ? "-" + gCategoryProcess.charAt(0) + "cat" : "")) +
                    (gESData ? "&source=pg" : "");
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
  gCombineBrowserCheckbox = document.getElementById("combineBrowserCheckbox");
  gCombineBrowserCheckbox.checked = gCombineBrowser;
  gCombineBrowserCheckbox.onchange = function(aCheckbox) {
    gCombineBrowser = gCombineBrowserCheckbox.checked;
    graphData(gRawData);
  }
  gESData = (getParameterByName("source") != "pg");

  // See if there is a notification and if so, display it.
  fetchFile("notification.txt", "",
    function(aData) {
      if (aData) {
        document.getElementById("notification").innerHTML = aData;
        document.getElementById("notification").classList.remove("hidden");
        window.onresize();
      }
      else {
        console.log("No notification found.");
      }
    }
  );

  if (location.search) {
    var urlAnchor = location.search.substr(1); // Cut off the ? sign.
    var urlPParts = urlAnchor.split("&");
    var urlAParts = urlPParts[0].split("-");
    if (urlAParts.length) {
      if (urlAParts.length > 1) {
        switch (urlAParts[1]) {
          case "blp":
            gADIGraph = true;
            gUseADI = false; // This turns on the usage of units like 'M' and 'k'.
            document.getElementsByTagName("h1")[0].textContent = "BLP History";
            document.title = "BLP History";
            document.getElementById("selectorsubline").hidden = true;
            break;
          case "bcat":
            gCategoryGraph = true;
            gCategoryProcess = "browser";
            document.getElementsByTagName("h1")[0].textContent += " - Categories (" + gCategoryProcess + " process)";
            document.title += " - Categories (" + gCategoryProcess + ")";
            gType = gCategoryProcess;
            break;
          case "ccat":
            gCategoryGraph = true;
            gCategoryProcess = "content";
            document.getElementsByTagName("h1")[0].textContent += " - Categories (" + gCategoryProcess + " process)";
            document.title += " - Categories (" + gCategoryProcess + ")";
            gType = gCategoryProcess;
            break;
          case "pcat":
            gCategoryGraph = true;
            gCategoryProcess = "plugin";
            document.getElementsByTagName("h1")[0].textContent += " - Categories (" + gCategoryProcess + " process)";
            document.title += " - Categories (" + gCategoryProcess + ")";
            gType = gCategoryProcess;
            break;
        }
      }
      urlAnchor = urlAParts[0];
    }
    if (urlAnchor in gBranches) {
      gSelID = urlAnchor;
      gBranchSelect.value = urlAnchor;
    }
    else if (urlAnchor == "office") {
      var branchnames = Object.keys(gBranches);
      gSelID = branchnames[Math.floor(Math.random() * branchnames.length)];
      gBranchSelect.value = gSelID;
      document.getElementsByTagName("h1")[0].textContent = "Crash Rates: Recent Year";
      document.title = "Crash Rates: Recent Year";
      document.getElementById("selectorplus").hidden = true;
      var today = new Date();
      gMinDay = (today.getUTCFullYear() - 1) + "-" +
          (today.getUTCMonth() < 9 ? "0" : "") + (today.getUTCMonth() + 1 ) + "-" +
          (today.getUTCDate() < 10 ? "0" : "") + today.getUTCDate();
      gType = "office";
    }
    else {
      location.href = "?fxrel";
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
  if (gCategoryGraph) {
    document.getElementById("combineoption").hidden = true;
    fetchFile(getFileName("categories"), "json",
      function(aData) {
        if (aData) {
          gCatData = aData;
          // Call this from here so we make sure all data is loaded.
          fetchFile(getFileName("bytype"), "json", graphData);
        }
        else {
          console.log("Error loading category counts.");
          // ERROR! We're screwed!
          document.getElementById("graphdiv").textContent = "Error loading JSON data.";
        }
      }
    );
  }
  else {
    fetchFile(getFileName("bytype"), "json", graphData);
  }
}

window.onresize = function() {
  if (!gGraph) {
    console.log("Tried resizing but found no graph.");
    return;
  }
  gGraph.resize(
    gBody.clientWidth,
    gBody.clientHeight - document.getElementById("graphdiv").offsetTop
                       - document.getElementById("footer").offsetHeight
  );
}

function graphData(aData) {
  var graphDiv = document.getElementById("graphdiv");
  gRawData = aData;
  if (aData) {
    gCombineBrowserCheckbox.disabled = gADIGraph || !gBranches[gSelID].content;
    var graphData = [], dataArray, browserCrashes;
    if (gADIGraph) {
      var crUnit = (gBranches[gSelID].maxADI > 1e6) ? "M" : "k";
      var crUnitNum = (gBranches[gSelID].maxADI > 1e6) ? 1e6 : 1e3;
      var yAxisMax = gBranches[gSelID].maxADI / crUnitNum;
    }
    else if (gUseADI) {
      var crUnit = "";
      var crUnitNum = 1;
      var yAxisMax = gBranches[gSelID].maxRate;
      if (gType && gBranches[gSelID]["maxRate_" + gType]) {
        yAxisMax = gBranches[gSelID]["maxRate_" + gType];
      }
    }
    else {
      var crUnit = (gBranches[gSelID].maxCrashes > 1e6) ? "M" : "k";
      var crUnitNum = (gBranches[gSelID].maxCrashes > 1e6) ? 1e6 : 1e3;
      var yAxisMax = gBranches[gSelID].maxCrashes / crUnitNum;
    }
    var yAxisDecimals = (yAxisMax > 20) ? 0 : ((yAxisMax > 1) ? 1 : 2);
    // Add elements in the following format: [ new Date("2009-07-12"), 100, 200 ]
    if (gCategoryGraph) {
      // Match the field name for the total - for plugins, we take only crashes, not hangs.
      var totalField = (gCategoryProcess == "plugin" ? "OOP " : "") +
                       gCategoryProcess.charAt(0).toUpperCase() + gCategoryProcess.slice(1);
      for (var day in gCatData) {
        dataArray = [ new Date(day) ];
        if (aData[day] && aData[day].crashes[totalField]) {
          dataArray.push(aData[day].crashes[totalField] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
        }
        else {
          dataArray.push(0);
        }
        if (aData[day] && gCatData[day].startup && gCatData[day].startup[gCategoryProcess]) {
          dataArray.push(gCatData[day].startup[gCategoryProcess] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
        }
        else {
          dataArray.push(0);
        }
        if (aData[day] && gCatData[day].oom && gCatData[day].oom[gCategoryProcess]) {
          dataArray.push(gCatData[day].oom[gCategoryProcess] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
        }
        else {
          dataArray.push(0);
        }
        if (aData[day] && gCatData[day]["oom:small"] && gCatData[day]["oom:small"][gCategoryProcess]) {
          dataArray.push(gCatData[day]["oom:small"][gCategoryProcess] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
        }
        else {
          dataArray.push(0);
        }
        if (aData[day] && gCatData[day]["oom:large"] && gCatData[day]["oom:large"][gCategoryProcess]) {
          dataArray.push(gCatData[day]["oom:large"][gCategoryProcess] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
        }
        else {
          dataArray.push(0);
        }
        if (aData[day] && gCatData[day]["address:pure"] && gCatData[day]["address:pure"][gCategoryProcess]) {
          dataArray.push(gCatData[day]["address:pure"][gCategoryProcess] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
        }
        else {
          dataArray.push(0);
        }
        if (aData[day] && gCatData[day]["address:file"] && gCatData[day]["address:file"][gCategoryProcess]) {
          dataArray.push(gCatData[day]["address:file"][gCategoryProcess] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
        }
        else {
          dataArray.push(0);
        }
        if (gCategoryProcess == "browser") {
          // Those do not make sense in other processes.
          if (aData[day] && gCatData[day].shutdownhang) {
            dataArray.push(gCatData[day].shutdownhang * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
          }
          else {
            dataArray.push(0);
          }
        }
       graphData.push(dataArray);
      }
    }
    else {
      for (var day in aData) {
        if (!gMinDay || day > gMinDay) {
          dataArray = [ new Date(day) ];
          if (gADIGraph) {
            dataArray.push(aData[day].adi / crUnitNum);
          }
          else {
            if (gBranches[gSelID].sumContent && gCombineBrowser) {
              browserCrashes = aData[day].crashes["Browser"];
              if (aData[day].crashes["Content"]) { browserCrashes += aData[day].crashes["Content"]; }
              dataArray.push(browserCrashes * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
            }
            else {
              dataArray.push(aData[day].crashes["Browser"] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
              if (gBranches[gSelID].content) {
                dataArray.push(aData[day].crashes["Content"] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
              }
            }
            if (gBranches[gSelID].plugins) {
              dataArray.push(aData[day].crashes["OOP Plugin"] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
              dataArray.push(aData[day].crashes["Hang Plugin"] * (gUseADI ? (100 / aData[day].adi) : 1 / crUnitNum));
            }
          }
          graphData.push(dataArray);
        }
      }
    }

    var colors = [], labels = ["date"];
    if (gCategoryGraph) {
      labels.push("total (reference)");
      colors.push("#CCCCCC");
      labels.push("startup (<60s uptime)");
      colors.push("#FF0000");
      labels.push("OOM (total)");
      colors.push("#004080");
      labels.push("OOM:small (<256K)");
      colors.push("#80CCFF");
      labels.push("OOM:large (>256K)");
      colors.push("#80FFCC");
      labels.push("pure address (@0x...)");
      colors.push("#FFCC00");
      labels.push("unsymbolized: file@0x...");
      colors.push("#FF8000");
      if (gCategoryProcess == "browser") {
        labels.push("shutdownhang (>1min)");
        colors.push("#808080");
      }
    }
    else if (gADIGraph) {
      labels.push("BLP");
      colors.push("#004080");
    }
    else {
      colors.push("#004080");
      if (gBranches[gSelID].sumContent && gCombineBrowser) {
        labels.push("browser+content crashes");
      }
      else {
        labels.push("browser crashes");
        if (gBranches[gSelID].content) {
          labels.push("content crashes");
          colors.push("#80CCFF");
        }
      }
      if (gBranches[gSelID].plugins) {
        labels.push("plugin crashes");
        labels.push("plugin hangs");
        colors.push("#FF8000");
        colors.push("#FFCC00");
      }
    }
    if (gType == "office") { document.getElementsByTagName("h1")[0].classList.add("hidden"); }
    var graphOptions = {
      title: gType == "office" ? "Crash Rates: " + gBranches[gSelID].shorttitle : gBranches[gSelID].title,
      ylabel: gADIGraph ? "BLP" : (gUseADI ? "submitted crashes / 100 ADI" : "submitted crashes"),
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
      height: gBody.clientHeight - graphDiv.offsetTop
                                 - document.getElementById("footer").offsetHeight,
    };

    gGraph = new Dygraph(graphDiv, graphData, graphOptions);
    gGraph.ready(function() {
      fetchFile(getFileName("annotations"), "json",
        function(aData) {
          if (aData) {
            for (var i = 0; i < aData.length; i++) {
              // Convert dates to Date objects so they can be displayed.
              aData[i].x = Date.parse(aData[i].x);
              // Adjust series to attach when we display non-default graphs.
              if (gCategoryGraph &&
                  (aData[i].series == "browser+content crashes" ||
                   aData[i].series == "browser crashes")) {
                aData[i].series = "total";
              }
              if (gADIGraph &&
                  (aData[i].series == "browser+content crashes" ||
                   aData[i].series == "browser crashes")) {
                aData[i].series = "BLP";
              }
              if (gBranches[gSelID].sumContent && !gCombineBrowser &&
                  (aData[i].series == "browser+content crashes")) {
                aData[i].series = "browser crashes";
              }
              if (gBranches[gSelID].sumContent && gCombineBrowser &&
                  (aData[i].series == "content crashes")) {
                aData[i].series = "browser+content crashes";
              }
            }
            if (gDataIssueDays) {
              for (var i = 0; i < gDataIssueDays.length; i++) {
                aData.push({
                  series: labels[labels.length - 1],
                  x: Date.parse(gDataIssueDays[i]),
                  shortText: "D",
                  text: "Data Issue (missing BLP/ADI or crashes)",
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
      console.log("Graph created.");
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

function getFileName(aFileType) {
  switch (aFileType) {
    case "bytype":
      return gDataPath + gBranches[gSelID].filenamebase +
                         (gESData ? "crashes-bytype.json" : "bytype.json")
    case "categories":
      return gDataPath + gBranches[gSelID].filenamebase +
                         (gESData ? "crashes-categories.json" : "counts.json")
    case "annotations":
      return gDataPath + gBranches[gSelID].filenamebase + "annotations.json"
  }
}

function getParameterByName(aName) {
  // from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  name = aName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
