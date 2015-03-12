/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var gDebug, gLog;
var gAnalysisPath = "../../";
var gBzAPIPath = "https://bugzilla.mozilla.org/bzapi/";
var gBzBasePath = "https://bugzilla.mozilla.org/";
var gSocorroPath = "https://crash-stats.mozilla.com/";

// Should select / figure out from https://crash-stats.mozilla.com/api/ProductsVersions/ or https://crash-stats.mozilla.com/api/CurrentVersions/
var gProduct = "Firefox", gVersion = "37.0b3", gProcess = "browser";
var gDate, gDuration = 7;
var gScores = {};


window.onload = function() {
  gDebug = document.getElementById("debug");
  gLog = document.getElementById("debugLog");

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
        document.getElementById("repDate").textContent = "ERROR - couldn't find crobtabber state!";
      }
    }
  );
}

function processData() {
  var tblBody = document.getElementById("scoreTBody");
  var limit = 10; //300;
  fetchFile(gSocorroPath + "api/TCBS/?product=" + gProduct + "&version=" + gVersion +
            "&crash_type=" + gProcess + "&date_range_type=" + gDuration +
            "&end_date=" + gDate + "&limit=" + limit, "json",
    function(aData) {
      if (aData) {
        console.log("found TCBS results: " + aData.crashes.length);
        // Header
        var trow = document.getElementById("scoreTHeader").appendChild(document.createElement("tr"));
        var cell = trow.appendChild(document.createElement("th"));
        cell.textContent = "Signature";
        var cell = trow.appendChild(document.createElement("th"));
        cell.textContent = "Count";
        var cell = trow.appendChild(document.createElement("th"));
        cell.textContent = "Score";
        // Body
        for (var i = 0; i <= aData.crashes.length - 1; i++) {
          gScores[aData.crashes[i].signature] = aData.crashes[i];
          var trow = tblBody.appendChild(document.createElement("tr"));
          var cell = trow.appendChild(document.createElement("td"));
          cell.classList.add("sig");
          var link = cell.appendChild(document.createElement("a"));
          link.setAttribute("href",
              gSocorroPath + "report/list?product=" + gProduct +
              "&version=" + gProduct + ":" + gVersion +
              "&range_unit=days&range_value=" + gDuration + "&date=" + gDate +
              "&signature=" + encodeURIComponent(aData.crashes[i].signature));
          link.textContent = aData.crashes[i].signature;
          var cell = trow.appendChild(document.createElement("td"));
          cell.classList.add("num");
          cell.textContent = aData.crashes[i].count;
          calcScore(aData.crashes[i].signature);
          var cell = trow.appendChild(document.createElement("td"));
          cell.classList.add("num");
          cell.textContent = parseInt(aData.crashes[i].score);
        }
      }
      else {
        var trow = tblBody.appendChild(document.createElement('tr'));
        var cell = trow.appendChild(document.createElement('td'));
        cell.textContent = "ERROR - couldn't find TCBS data!";
      }
    }
  );
}

function calcScore(aSignature) {
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

function makeDate(aDate) {
  // Date format is YYYY-MM-DD
  // Note that .getMonth() returns a number between 0 and 11 (0 for January)!
  return aDate.getUTCFullYear() + "-" +
         (aDate.getUTCMonth() < 9 ? "0" : "") + (aDate.getUTCMonth() + 1 ) + "-" +
         (aDate.getUTCDate() < 10 ? "0" : "") + aDate.getUTCDate();
}
