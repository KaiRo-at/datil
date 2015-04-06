/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var gDebug, gLog;
var gAnalysisPath = "../../";
var gBzAPIPath = "https://bugzilla.mozilla.org/bzapi/";
var gBzBasePath = "https://bugzilla.mozilla.org/";
var gSocorroPath = "https://crash-stats.mozilla.com/";

// Should select / figure out from https://crash-stats.mozilla.com/api/ProductsVersions/ or https://crash-stats.mozilla.com/api/CurrentVersions/
var gProduct = "Firefox", gVersion = "38.0b1", gProcess = "browser", gLimit = 10; //300;
var gDate, gDuration = 7;
var gScores = {}, gSocorroAPIToken;


window.onload = function() {
  gDebug = document.getElementById("debug");
  gLog = document.getElementById("debugLog");
  gSocorroAPIToken = getParameterByName("token");

  var ver = getParameterByName("version");
  if (ver.match(/^(\d+\.)+[\dab]+/)) {
    gVersion = ver;
  }
  var limit = getParameterByName("limit");
  if (limit.match(/^(\d+)+/) && (limit >= 3) && (limit <= 1000)) {
    gLimit = limit;
  }

  //if (!gSocorroAPIToken) {
  //  $err = displayMessage("ERROR - you need an API token. Please ");
  //  $link = $err.appendChild(document.createElement("a"));
  //  $link.setAttribute("href", "https://crash-stats.mozilla.com/api/tokens/");
  //  $link.textContent = "create one via Socorro";
  //  $err.appendChild(document.createTextNode(" and hand it over with the ?token=... parameter!"));
  //}
  //else {
    fetchFile(gSocorroPath + "api/CrontabberState/", "json",
      function(aData) {
        if (aData) {
          var matviewTime = new Date(aData.state["signatures-matview"].last_success);
          matviewTime.setDate(matviewTime.getDate() - 1); // subtract one day
          gDate = makeDate(matviewTime);
          document.getElementById("repDate").textContent = gDate;
          document.getElementById("repDuration").textContent = gDuration;
          document.getElementById("repProd").textContent = gProduct;
          document.getElementById("repVer").textContent = gVersion;
          document.getElementById("repPType").textContent = gProcess;

          processData();
        }
        else {
          gDate = null;
          displayMessage("ERROR - couldn't find crobtabber state!");
        }
      }
    );
  //}
}

function processData() {
  var tblBody = document.getElementById("scoreTBody");
  fetchFile(gSocorroPath + "api/TCBS/?product=" + gProduct + "&version=" + gVersion +
            "&crash_type=" + gProcess + "&date_range_type=" + gDuration +
            "&end_date=" + gDate + "&limit=" + gLimit, "json",
    function(aData) {
      if (aData) {
        var resultCount = aData.crashes.length;
        displayMessage("Processing " + resultCount + " results…");
        for (var i = 0; i <= resultCount - 1; i++) {
          gScores[aData.crashes[i].signature] = aData.crashes[i];
          calcScore(aData.crashes[i].signature, function(aSignature) {
            if (aSignature == aData.crashes[resultCount-1].signature) {
              // last item, so all done with calculating
              buildDataTable();
            }
          });
        }
      }
      else {
        displayMessage("ERROR - couldn't find TCBS data!");
      }
    }
  );
}

function buildDataTable() {
  var msgRow = document.getElementById("message_row");
  if (msgRow) {
    msgRow.parentNode.removeChild(msgRow);
  }
  // Header
  var trow = document.getElementById("scoreTHeader")
                     .appendChild(document.createElement("tr"));
  var cell = trow.appendChild(document.createElement("th"));
  cell.textContent = "#";
  cell.setAttribute("title", "Rank");
  var cell = trow.appendChild(document.createElement("th"));
  cell.textContent = "Signature";
  var cell = trow.appendChild(document.createElement("th"));
  cell.textContent = "Count";
  var cell = trow.appendChild(document.createElement("th"));
  cell.textContent = "Score";
  // Body
  var tblBody = document.getElementById("scoreTBody");
  var sigSorted = Object.keys(gScores).sort(
    function (a, b) { return gScores[b].score - gScores[a].score; }
  );
  for (var i = 0; i <= sigSorted.length - 1; i++) {
    signature = sigSorted[i];
    var trow = tblBody.appendChild(document.createElement("tr"));
    trow.setAttribute("id", "sdata_" + encodeURIComponent(signature));
    var cell = trow.appendChild(document.createElement("td"));
    cell.textContent = i + 1;
    cell.classList.add("rank");
    var cell = trow.appendChild(document.createElement("td"));
    cell.classList.add("sig");
    var link = cell.appendChild(document.createElement("a"));
    link.setAttribute("href",
        gSocorroPath + "report/list?product=" + gProduct +
        "&version=" + gProduct + ":" + gVersion +
        "&range_unit=days&range_value=" + gDuration + "&date=" + gDate +
        "&signature=" + encodeURIComponent(signature));
    link.textContent = signature;
    var cell = trow.appendChild(document.createElement("td"));
    cell.classList.add("num");
    cell.textContent = gScores[signature].count;
    var cell = trow.appendChild(document.createElement("td"));
    cell.classList.add("num");
    cell.textContent = parseInt(gScores[signature].score);
  }
}

function calcScore(aSignature, aCallback) {
  gScores[aSignature].score = gScores[aSignature].count;
  // Startup crashes: count each crash with factor 10
  gScores[aSignature].score *= 1 + gScores[aSignature].startup_percent * (10 - 1);
  // GC crashes: count each crash with factor 1/4
  gScores[aSignature].score *= 1 + (gScores[aSignature].is_gc_count * (.25 - 1)) / gScores[aSignature].count;
  // OOM | small: factor 1/10
  if (aSignature == "OOM | small") {
    gScores[aSignature].score *= .1;
  }
  // OOM | large: factor 5
  if (aSignature.startsWith("OOM | large")) {
    gScores[aSignature].score *= 5;
  }

  // Get signature Summary data
  var sigRepTypes = "distinct_install";
  var startDate = new Date(gDate);
  startDate.setDate(startDate.getDate() - gDuration);
  fetchFile(gSocorroPath + "api/SignatureSummary/?versions=" + gProduct + ":" + gVersion +
            "&signature=" + encodeURIComponent(aSignature) +
            "&report_types=" + sigRepTypes +
            "&start_date=" + makeDate(startDate) + "&end_date=" + gDate, "json",
    function(aData) {
      if (aData) {
        gScores[aSignature].installations = aData.reports.distinct_install[0].installations;
        // installations: factor 0 for <3 installs
        if (aData.reports.distinct_install[0].installations < 3) {
          gScores[aSignature].score *= 0;
        }
        // installations: factor up to 2 for few people crashing over and over,
        //                factor 1 for installations == crashes
        // 1+e^(x*-3)*sin(x*pi)*3 - prototyped via http://www.mathe-fa.de/en
        var instRatio = aData.reports.distinct_install[0].installations /
                        aData.reports.distinct_install[0].crashes;
        gScores[aSignature].score *= 1 + 3 * Math.sin(instRatio * Math.PI) * Math.exp(instRatio * -3);
        gScores[aSignature].installations_factor = 1 + 3 * Math.sin(instRatio * Math.PI) * Math.exp(instRatio * -3);
        gScores[aSignature].installations_ratio = instRatio;
      }
      else {
        console.log("ERROR - couldn't find Signature Summary data for " + aSignature + "!");
      }
      aCallback(aSignature);
    }
  );
}

function displayMessage(aErrorMessage) {
  var trow = document.getElementById("scoreTBody")
                     .appendChild(document.createElement('tr'));
  trow.setAttribute("id", "message_row");
  var cell = trow.appendChild(document.createElement('td'));
  cell.textContent = aErrorMessage;
  return cell;
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
      console.log("ERROR: XHR status " + XHR.status + " - " + aURL);
      aCallback(null);
    }
  };
  XHR.open("GET", aURL);
  if (gSocorroAPIToken) {
    // XXX: Should work but doesn't yet! We'll need to figure this out.
    //      Use this path when we have a token so bug 1143424 can be tested.
    XHR.setRequestHeader("Auth-Token", gSocorroAPIToken);
  }
  if (aFormat == "json") { XHR.setRequestHeader("Accept", "application/json"); }
  else if (aFormat == "xml") { XHR.setRequestHeader("Accept", "application/xml"); }
  try {
    XHR.send();
  }
  catch (e) {
    console.log("ERROR: XHR send - " + e + " - " + aURL);
    aCallback(null);
  }
}

function makeDate(aDate) {
  // Date format is YYYY-MM-DD
  // Note that .getMonth() returns a number between 0 and 11 (0 for January)!
  return aDate.getUTCFullYear() + "-" +
         (aDate.getUTCMonth() < 9 ? "0" : "") + (aDate.getUTCMonth() + 1 ) + "-" +
         (aDate.getUTCDate() < 10 ? "0" : "") + aDate.getUTCDate();
}

function getParameterByName(aName) {
  // from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  name = aName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
