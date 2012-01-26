/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var gProductData = {
  firefox: {
    name: "Firefox Desktop",
    abbr: "ff",
    channels: {
      nightly: {
        name: "Nightly",
        version: "12.0a1",
        sumversion: "12",
        rate: { high: 2, max: 3 }, // crashes per 100 ADU
        startup: { high: 20, max: 30 }, // percent of total crashes
        flashhang: { high: 20, max: 30 }, // total Flash hangs
        flashcrash: { high: 3, max: 5 }, // percentage of crashes that comes from Flash
      },
      aurora: {
        name: "Aurora",
        version: "11.0a2",
        sumversion: "11",
        rate: { high: 2, max: 2.5 },
        startup: { high: 20, max: 30 },
        flashhang: { high: 100, max: 150 },
        flashcrash: { high: 4, max: 7 },
      },
      beta: {
        name: "Beta",
        version: "10.0",
        sumversion: "10",
        appendver: true,
        rate: { high: 2, max: 2.5 },
        startup: { high: 20, max: 25 },
        flashhang: { high: 500, max: 700 },
        flashcrash: { high: 5, max: 7 },
      },
      release: {
        name: "Release",
        version: "9.0",
        sumversion: "9",
        appendver: true,
        rate: { factor: 10, high: 2, max: 2.5 },
        startup: { high: 15, max: 20 },
        flashhang: { high: 15000, max: 20000 },
        flashcrash: { high: 10, max: 13 },
      },
    },
  },
  fennec: {
    name: "Mobile (XUL)",
    abbr: "fn",
    noflash: true,
    channels: {
      nightly: {
        name: "Nightly",
        version: "12.0a1",
        sumversion: "12",
        rate: { high: 2, max: 3 },
        startup: { high: 20, max: 30 },
        flashhang: { high: 20, max: 30 },
        flashcrash: { high: 3, max: 5 },
      },
      aurora: {
        name: "Aurora",
        version: "11.0a2",
        sumversion: "11",
        rate: { high: 2, max: 2.5 },
        startup: { high: 20, max: 30 },
        flashhang: { high: 100, max: 150 },
        flashcrash: { high: 4, max: 7 },
      },
      beta: {
        name: "Beta",
        version: "10.0",
        sumversion: "10",
        appendver: true,
        rate: { high: 2, max: 2.5 },
        startup: { high: 20, max: 25 },
        flashhang: { high: 500, max: 700 },
        flashcrash: { high: 5, max: 7 },
      },
      release: {
        name: "Release",
        version: "9.0",
        sumversion: "9",
        appendver: true,
        rate: { high: 2, max: 2.5 },
        startup: { high: 15, max: 20 },
        flashhang: { high: 15000, max: 20000 },
        flashcrash: { high: 10, max: 13 },
      },
    },
  },
  fennecandroid: {
    name: "Fennec Android (native)",
    abbr: "fna",
    noflash: true,
    channels: {
      nightly: {
        name: "Nightly",
        version: "12.0a1",
        sumversion: "12",
        rate: { high: 2, max: 3 },
        startup: { high: 20, max: 30 },
        flashhang: { high: 20, max: 30 },
        flashcrash: { high: 3, max: 5 },
      },
      aurora: {
        name: "Aurora",
        version: "11.0a2",
        sumversion: "11",
        rate: { high: 2, max: 2.5 },
        startup: { high: 20, max: 25 },
        flashhang: { high: 100, max: 150 },
        flashcrash: { high: 4, max: 7 },
      },
    },
  },
};

var gSources = {
  rate: {
    precision: 2,
    percent: false,
    getCrashesFile: function(aProd, aChannel) {
      return gAnalysisPath + gDay + "/" + aProd.abbr + "-" +
             aProd.channels[aChannel].sumversion + "-total.csv";
    },
    getADUFile: function(aProd, aChannel) {
      return gAnalysisPath + gDay + "/" + aProd.abbr + "-" +
             aProd.channels[aChannel].sumversion + "-adu.csv";
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      var src = this;
      fetchFile(src.getCrashesFile(aProd, aChannel), "",
          function(aCrashes) {
            if (!aCrashes)
              aCallback(null, aCBData);
            fetchFile(src.getADUFile(aProd, aChannel), "",
                function(aADU) {
                  if (!aADU)
                    aCallback(null, aCBData);
                  else
                    aCallback(aCrashes / aADU * 100 *
                                (aProd.channels[aChannel].rate.factor ?
                                 aProd.channels[aChannel].rate.factor :
                                 1),
                              aCBData);
                }
            );
          }
      );
    },
  },
  startup: {
    precision: 0,
    percent: true,
    getStartupFile: function(aProd, aChannel) {
      if (aProd.channels[aChannel].appendver)
        return gAnalysisPath + aProd.abbr + "-" + aChannel + "-" +
               aProd.channels[aChannel].version + ".startup.json";
      else
        return gAnalysisPath + aProd.abbr + "-" + aChannel + ".startup.json";
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getStartupFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[gDay])
              aCallback(null, aCBData);
            else
              aCallback(aData[gDay].startup.browser ?
                        aData[gDay].startup.browser / aData[gDay].total * 100 :
                        0, aCBData);
          }
      );
    },
  },
  flashhang: {
    precision: 0,
    percent: false,
    getFlashHangFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.abbr + "-" +
             aProd.channels[aChannel].version + ".flashhang.json";
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getFlashHangFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[gDay])
              aCallback(null, aCBData);
            else
              aCallback(aData[gDay].total_flash.hang, aCBData);
          }
      );
    },
  },
  flashcrash: {
    precision: 1,
    percent: true,
    getFlashHangFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.abbr + "-" +
             aProd.channels[aChannel].version + ".flashhang.json";
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getFlashHangFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[gDay])
              aCallback(null, aCBData);
            else
              aCallback(aData[gDay].total_flash.crash / aData[gDay].total.crash * 100,
                        aCBData);
          }
      );
    },
  },
}

var gDebug, gLog;
var gDay;
//var gAnalysisPath = "https://crash-analysis.mozilla.com/rkaiser/";
var gAnalysisPath = "../../";

window.onload = function() {
  gDebug = document.getElementById("debug");
  gLog = document.getElementById("debugLog");

  // Get date to analyze.
  var anadate = new Date();
  anadate.setDate(anadate.getDate() - 1); // yesterday
  if (anadate.getUTCHours() < 14)
    anadate.setDate(anadate.getDate() - 1); // the day before
  // Format the date for ISO. Phew.
  gDay = anadate.getUTCFullYear() + "-";
  if (anadate.getUTCMonth() < 9)
    gDay += "0";
  gDay += (anadate.getUTCMonth() + 1) + "-";
  if (anadate.getUTCDate() < 10)
    gDay += "0";
  gDay += anadate.getUTCDate();
  document.getElementById("repDay").textContent = gDay;

  processData();
}

function processData() {
  var db = document.getElementById("dashboard");
  var baseSection = document.getElementById("none");
  for (var product in gProductData) {
    var sect = db.appendChild(baseSection.cloneNode(true));
    sect.setAttribute("id", product);
    var ptitle = sect.getElementsByTagName("h2")[0];
    ptitle.textContent = gProductData[product].name;

    for (var channel in gProductData[product].channels) {
      var cdata = gProductData[product].channels[channel];
      var headrow = sect.getElementsByClassName("headers")[0];
      headrow.appendChild(createCell(cdata.name, true));
      var versionrow = sect.getElementsByClassName("versions")[0];
      versionrow.appendChild(createCell(cdata.version));
      for (var source in gSources) {
        var sourcerow = sect.getElementsByClassName(source)[0];
        if (source.indexOf("flash") !== -1 && gProductData[product].noflash) {
          sourcerow.classList.add("hidden");
        }
        else {
          var sourceCell = sourcerow.appendChild(createCell(""));
          gSources[source].getValue(gProductData[product], channel, valueCallback,
              {cell: sourceCell, data: cdata, type: source});
        }
      }
      //gDebug.textContent = channel.name;
    }
  }
}

function createCell(aText, aHeader) {
  var cell = document.createElement(aHeader ? "th" : "td");
  cell.appendChild(document.createTextNode(aText));
  return cell;
}

function fetchFile(aURL, aFormat, aCallback) {
  var XHR = new XMLHttpRequest();
  XHR.onreadystatechange = function() {
    if (XHR.readyState == 4) {
      gLog.appendChild(document.createElement("li"))
          .appendChild(document.createTextNode(aURL + " - " + XHR.status +
                                               " " + XHR.statusText));
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
  XHR.send();
}

function valueCallback(aValue, aCBData) {
  aCBData.data.current = aValue;
  if (aValue !== null) {
    aCBData.cell.textContent = aValue.toFixed(gSources[aCBData.type].precision);
    if (gSources[aCBData.type].percent)
      aCBData.cell.textContent += "%";
    aCBData.cell.classList.add("num");
    if (aValue > aCBData.data[aCBData.type].max)
      aCBData.cell.classList.add("max");
    else if (aValue > aCBData.data[aCBData.type].high)
      aCBData.cell.classList.add("high");
    else
      aCBData.cell.classList.add("normal");
  }
  else {
    aCBData.cell.textContent = "ERR";
    aCBData.cell.classList.add("fail");
  }
}
