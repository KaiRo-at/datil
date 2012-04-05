/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var gProductData = {
  firefox: {
    name: "Firefox Desktop",
    full: "Firefox",
    abbr: "ff",
    channels: {
      nightly: {
        name: "Nightly",
        version: "14.0a1",
        adu: { low: 1e5, min: 7e4 }, // ADUs
        rate: { high: 2, max: 3 }, // crashes per 100 ADU
        sigcnt: { high: 1e3, max: 1.5e3 }, // # of signatures
        startup: { high: 20, max: 30 }, // percent of total crashes
        flashhang: { high: 70, max: 90 }, // total Flash hangs
        flashcrash: { high: 3, max: 5 }, // percentage of crashes that comes from Flash
      },
      aurora: {
        name: "Aurora",
        version: "13.0a2",
        adu: { low: 1e6, min: 1.25e5 },
        rate: { high: 2, max: 2.5 },
        sigcnt: { high: 2e3, max: 3e3 },
        startup: { high: 20, max: 30 },
        flashhang: { high: 300, max: 400 },
        flashcrash: { high: 4, max: 7 },
      },
      beta: {
        name: "Beta",
        version: "12.0b3",
        appendver: true,
        adu: { low: 1e7, min: 1e6 },
        rate: { high: 2, max: 2.5 },
        sigcnt: { high: 7e3, max: 1e4 },
        startup: { high: 20, max: 25 },
        flashhang: { high: 3000, max: 4000 },
        flashcrash: { high: 5, max: 7 },
      },
      release: {
        name: "Release",
        version: "11.0",
        appendver: true,
        adu: { low: 1e8, min: 1e7 },
        rate: { factor: 1, high: 2, max: 2.5 },
        sigcnt: { high: 2e4, max: 2.5e4 },
        startup: { high: 15, max: 20 },
        flashhang: { high: 15000, max: 20000 },
        flashcrash: { high: 10, max: 13 },
      },
    },
  },
  fennec: {
    name: "Mobile (XUL)",
    full: "Fennec",
    abbr: "fn",
    noflash: true,
    channels: {
      nightly: {
        name: "Nightly",
        version: "14.0a1",
        adu: { low: 1000, min: 100 },
        rate: { high: 2, max: 3 },
        sigcnt: { high: 10, max: 15 },
        startup: { high: 20, max: 30 },
      },
      aurora: {
        name: "Aurora",
        version: "13.0a2",
        adu: { low: 1000, min: 100 },
        rate: { high: 2, max: 2.5 },
        sigcnt: { high: 10, max: 15 },
        startup: { high: 20, max: 30 },
      },
      beta: {
        name: "Beta",
        version: "12.0b3",
        appendver: true,
        adu: { low: 1e5, min: 1e4 },
        rate: { high: 2, max: 2.5 },
        sigcnt: { high: 60, max: 80 },
        startup: { high: 20, max: 25 },
      },
      esr: {
        name: "Release",
        version: "10.0.3esr",
        appendver: true,
        adu: { low: 5e5, min: 1e5 },
        rate: { high: 2, max: 2.5 },
        sigcnt: { high: 400, max: 500 },
        startup: { high: 15, max: 20 },
      },
    },
  },
  fennecandroid: {
    name: "Fennec Android (native)",
    full: "FennecAndroid",
    abbr: "fna",
    noflash: true,
    channels: {
      nightly: {
        name: "Nightly",
        version: "14.0a1",
        adu: { low: 1000, min: 100 },
        rate: { high: 2, max: 10 },
        sigcnt: { high: 80, max: 150 },
        startup: { high: 20, max: 30 },
      },
      aurora: {
        name: "Aurora",
        version: "13.0a2",
        adu: { low: 10000, min: 1000 },
        rate: { high: 2, max: 5 },
        sigcnt: { high: 100, max: 150 },
        startup: { high: 20, max: 30 },
      },
      beta: {
        name: "Beta",
        version: "12.0b1",
        appendver: true,
        adu: { low: 1e5, min: 1e4 },
        rate: { high: 2, max: 2.5 },
        sigcnt: { high: 400, max: 500 },
        startup: { high: 15, max: 25 },
      },
    },
  },
};

var gSources = {
  adu: {
    precision: null,
    unit: "kMG",
    lowLimits: true,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + aProd.channels[aChannel].version;
    },
    getDataFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.full + "-daily.json";
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getDataFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[aProd.channels[aChannel].version] ||
                !aData[aProd.channels[aChannel].version][gDay])
              aCallback(null, aCBData);
            else
              aCallback(aData[aProd.channels[aChannel].version][gDay].adu,
                        aCBData);
          }
      );
    },
  },
  rate: {
    precision: 2,
    unit: "",
    lowLimits: false,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + aProd.channels[aChannel].version;
    },
    getDataFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.full + "-daily.json";
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getDataFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[aProd.channels[aChannel].version] ||
                !aData[aProd.channels[aChannel].version][gDay]) {
              aCallback(null, aCBData);
            }
            else {
              var crashes = parseInt(aData[aProd.channels[aChannel].version][gDay].crashes);
              var adu = parseInt(aData[aProd.channels[aChannel].version][gDay].adu);
              var factor = aProd.channels[aChannel].rate.factor ?
                           aProd.channels[aChannel].rate.factor : 1;
              aCallback((adu ? crashes / adu : 0) * 100 * factor, aCBData);
            }
          }
      );
    },
  },
  sigcnt: {
    precision: 0,
    unit: "",
    lowLimits: false,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " +
             (aProd.channels[aChannel].appendver ?
              majVer(aProd.channels[aChannel].version) : aChannel);
    },
    getSigCntFile: function(aProd, aChannel) {
      return gAnalysisPath + gDay + "/" + aProd.abbr + "-" +
             (aProd.channels[aChannel].appendver ?
              majVer(aProd.channels[aChannel].version) : aChannel) +
             "-sigcount.csv";
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getSigCntFile(aProd, aChannel), "",
          function(aSigCnt) {
            if (!aSigCnt)
              aCallback(null, aCBData);
            else
              aCallback(parseInt(aSigCnt), aCBData);
          }
      );
    },
  },
  startup: {
    precision: 0,
    unit: "%",
    lowLimits: false,
    getPrettyVersion: function(aProd, aChannel) {
      if (aProd.channels[aChannel].appendver)
        return aProd.full + " " + repVer(aProd.channels[aChannel].version) +
               " " + aChannel;
      else
        return aProd.full + " " + aChannel;
    },
    getStartupFile: function(aProd, aChannel) {
      if (aProd.channels[aChannel].appendver)
        return gAnalysisPath + aProd.abbr + "-" + aChannel + "-" +
               repVer(aProd.channels[aChannel].version) + ".startup.json";
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
    unit: "",
    lowLimits: false,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + repVer(aProd.channels[aChannel].version);
    },
    getFlashHangFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.abbr + "-" +
             repVer(aProd.channels[aChannel].version) + ".flashhang.json";
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
    unit: "%",
    lowLimits: false,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + repVer(aProd.channels[aChannel].version);
    },
    getFlashHangFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.abbr + "-" +
             repVer(aProd.channels[aChannel].version) + ".flashhang.json";
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
  if (anadate.getUTCHours() < 13)
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
          sourceCell.addEventListener("mouseover", showInfo, false);
          sourceCell.addEventListener("mouseout", hideInfo, false);
          sourceCell.dataset.product = product;
          sourceCell.dataset.channel = channel;
          sourceCell.dataset.source = source;
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

function showInfo(event) {
  var cell = event.target;
  var info = document.getElementById("infobox");

  // Position: The parent is the table and has the offset within the body.
  info.style.left = (cell.offsetParent.offsetLeft +
                     cell.offsetLeft - 1) + "px";
  info.style.top = (cell.offsetParent.offsetTop +
                    cell.offsetTop + cell.offsetHeight - 1) + "px";

  // Set info to show.
  info.getElementsByClassName(cell.dataset.source)[0].classList.add("current");

  var limits = gProductData[cell.dataset.product]
               .channels[cell.dataset.channel][cell.dataset.source];
  if (gSources[cell.dataset.source].lowLimits) {
    info.getElementsByClassName("limits")[0].classList.add("low");
    document.getElementById("limit1").textContent =
        formatValue(limits.low,
                    gSources[cell.dataset.source].precision,
                    gSources[cell.dataset.source].unit);
    document.getElementById("limit2").textContent =
        formatValue(limits.min,
                    gSources[cell.dataset.source].precision,
                    gSources[cell.dataset.source].unit);
  }
  else {
    info.getElementsByClassName("limits")[0].classList.add("high");
    document.getElementById("limit1").textContent =
        formatValue(limits.high,
                    gSources[cell.dataset.source].precision,
                    gSources[cell.dataset.source].unit);
    document.getElementById("limit2").textContent =
        formatValue(limits.max,
                    gSources[cell.dataset.source].precision,
                    gSources[cell.dataset.source].unit);
  }

  document.getElementById("verinfo").textContent =
      gSources[cell.dataset.source].getPrettyVersion(gProductData[cell.dataset.product],
                                                     cell.dataset.channel);

  // Finally actually display the box.
  info.style.display = "block";
}

function hideInfo(event) {
  var cell = event.target;
  var info = document.getElementById("infobox");
  // Hide the box.
  info.style.display = "none";

  // Reset info where needed.
  info.getElementsByClassName(cell.dataset.source)[0].classList.remove("current");
  if (gSources[cell.dataset.source].lowLimits) {
    info.getElementsByClassName("limits")[0].classList.remove("low");
  }
  else {
    info.getElementsByClassName("limits")[0].classList.remove("high");
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
  XHR.send();
}

function valueCallback(aValue, aCBData) {
  aCBData.data[aCBData.type].current = aValue;
  if (aValue !== null) {
    aCBData.cell.textContent = formatValue(aValue,
                                           gSources[aCBData.type].precision,
                                           gSources[aCBData.type].unit);
    aCBData.cell.classList.add("num");
    if (((gSources[aCBData.type].lowLimits) &&
         (aValue < aCBData.data[aCBData.type].min)) ||
        (aValue > aCBData.data[aCBData.type].max))
      aCBData.cell.classList.add("faroff");
    else if (((gSources[aCBData.type].lowLimits) &&
              (aValue < aCBData.data[aCBData.type].low)) ||
             (aValue > aCBData.data[aCBData.type].high))
      aCBData.cell.classList.add("outside");
    else
      aCBData.cell.classList.add("normal");
  }
  else {
    aCBData.cell.textContent = "ERR";
    aCBData.cell.classList.add("fail");
  }
}

function formatValue(aValue, aPrecision, aUnit) {
  var formatted;
  if (aUnit == "kMG") {
    var val = aValue;
    var prec = aPrecision;
    var unit = "";
    if (aValue > 1e10) {
      prec = (prec === null) ? 0 : prec;
      val = (val / 1e9).toFixed(prec);
      unit = "G";
    }
    else if (aValue > 1e9) {
      prec = (prec === null) ? 1 : prec;
      val = (val / 1e9).toFixed(prec);
      unit = "G";
    }
    else if (aValue > 1e7) {
      prec = (prec === null) ? 0 : prec;
      val = (val / 1e6).toFixed(prec);
      unit = "M";
    }
    else if (aValue > 1e6) {
      prec = (prec === null) ? 1 : prec;
      val = (val / 1e6).toFixed(prec);
      unit = "M";
    }
    else if (aValue > 1e4) {
      prec = (prec === null) ? 0 : prec;
      val = (val / 1e3).toFixed(prec);
      unit = "k";
    }
    else if (aValue > 1e3) {
      prec = (prec === null) ? 1 : prec;
      val = (val / 1e3).toFixed(prec);
      unit = "k";
    }
    else if (prec !== null) {
      val = val.toFixed(prec);
    }
    formatted = val + unit;
  }
  else {
    formatted = aValue.toFixed(aPrecision);
    if (aUnit)
      formatted += aUnit;
  }
  return formatted;
}

function majVer(aVersion) {
  // returns major version, e.g. 11 for 11.0b3, 13 for 13.0a1, 10 for 10.0.2
  return aVersion.match(/^\d+/);
}

function repVer(aVersion) {
  // returns a report version, e.g. 11.0 for 11.0b3, 13.0a1 for 13.0a1, 10.0 for 10.0.2
  return aVersion.match(/^\d+\.[\da]+/);
}

function intVer(aVersion) {
  // returns the internal version, e.g. 11.0 for 11.0b3, 13.0a1 for 13.0a1, 10.0.2 for 10.0.2
  return aVersion.match(/^[\d\.a]+/);
}
