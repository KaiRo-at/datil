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
        version: "44.0a1",
        versions: { },
        adi: { low: 8e4, min: 5e4 }, // ADUs
        rateBrCo: { high: 2.0, max: 3.0 }, // browser+content crashes per 100 ADI
        startup: { high: 0.3, max: 0.6 }, // browser startup crashes per 100 ADI
        plugincrash: { high: .09, max: .2 }, // plugin crashes per 100 ADI
        pluginhang: { high: .05, max: .2 }, // plugin hangs per 100 ADI
      },
      aurora: {
        name: "Dev Ed",
        version: "43.0a2",
        versions: { },
        adi: { low: 1.3e5, min: 1e5 },
        rateBrCo: { high: 1.5, max: 2.0 },
        startup: { high: 0.25, max: 0.4 },
        plugincrash: { high: .09, max: .2 },
        pluginhang: { high: .05, max: .2 },
      },
      beta: {
        name: "Beta",
        version: "42.0b",
        appendver: true,
        versions: { },
        adi: { low: 2e6, min: 1.4e6 },
        rateBrCo: { high: 1.0, max: 1.25 },
        startup: { high: 0.2, max: 0.25 },
        plugincrash: { high: .09, max: .2 },
        pluginhang: { high: .09, max: .2 },
      },
      release: {
        name: "Release",
        version: "41.0.1",
        appendver: true,
        versions: { },
        adi: { low: 1e8, min: 7e7 },
        rateBrCo: { factor: 1, high: 0.95, max: 1.1 },
        startup: { high: 0.15, max: 0.20 },
        plugincrash: { high: .09, max: .15 },
        pluginhang: { high: .09, max: .15 },
      },
    },
  },
  fennecandroid: {
    name: "Firefox for Android",
    full: "FennecAndroid",
    abbr: "fna",
    noplugin: true,
    channels: {
      nightly: {
        name: "Nightly",
        version: "44.0a1",
        versions: { },
        adi: { low: 1.5e3, min: 1e3 },
        rateBrCo: { high: 5, max: 9 },
        startup: { high: 2, max: 5 },
      },
      aurora: {
        name: "Aurora",
        version: "43.0a2",
        versions: { },
        adi: { low: 1.5e3, min: 1e3 },
        rateBrCo: { high: 4, max: 7 },
        startup: { high: 1.5, max: 3 },
      },
      beta: {
        name: "Beta",
        version: "42.0b1",
        appendver: true,
        versions: { },
        adi: { low: 9e4, min: 8e4 },
        rateBrCo: { high: 2.0, max: 2.5 },
        startup: { high: 0.75, max: 1 },
      },
      release: {
        name: "Release",
        version: "41.0",
        appendver: true,
        versions: { },
        adi: { low: 4.4e6, min: 3.8e6 },
        rateBrCo: { high: 1.3, max: 1.6 },
        startup: { high: 0.35, max: 0.45 },
      },
    },
  },
};

var gSources = {
  versions: {
    precision: null,
    unit: "plain",
    noLimits: true,
    hasInfoValue: true,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + aProd.channels[aChannel].name;
    },
    getDataFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.full + "-" + aChannel + "-bytype.json";
    },
    getLinkURL: function(aProd, aChannel) {
      return false;
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getDataFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[gDay] || !aData[gDay].versions)
              aCallback(null, aCBData);
            else
              aCallback(aData[gDay].versions[0] + (aData[gDay].versions.length > 1 ? " - " + aData[gDay].versions[aData[gDay].versions.length - 1]: ""), aCBData);
          }
      );
    },
    getInfoValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getDataFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[gDay] || !aData[gDay].versions)
              aCallback(null, aCBData);
            else
              aCallback(aData[gDay].versions.join(', '), aCBData);
          }
      );
    },
  },
  adi: {
    precision: null,
    unit: "kMG",
    lowLimits: true,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + aProd.channels[aChannel].name;
    },
    getDataFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.full + "-" + aChannel + "-bytype.json";
    },
    getLinkURL: function(aProd, aChannel) {
      return false;
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getDataFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[gDay] || !aData[gDay].adi)
              aCallback(null, aCBData);
            else
              aCallback(aData[gDay].adi, aCBData);
          }
      );
    },
  },
  rateBrCo: {
    precision: 2,
    unit: "",
    lowLimits: false,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + aProd.channels[aChannel].name;
    },
    getDataFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.full + "-" + aChannel + "-bytype.json";
    },
    getLinkURL: function(aProd, aChannel) {
      return false;
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getDataFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[gDay] || !aData[gDay].crashes || !aData[gDay].adi) {
              aCallback(null, aCBData);
            }
            else {
              var crashes = (aData[gDay].crashes["Browser"] ? parseInt(aData[gDay].crashes["Browser"]) : 0)
                          + (aData[gDay].crashes["Content"] ? parseInt(aData[gDay].crashes["Content"]) : 0);
              var adi = parseInt(aData[gDay].adi);
              var factor = aProd.channels[aChannel].rateBrCo.factor ?
                           aProd.channels[aChannel].rateBrCo.factor : 1;
              aCallback(adi ? (crashes / adi) * 100 * factor : null, aCBData);
            }
          }
      );
    },
  },
  startup: {
    precision: 2,
    unit: "",
    lowLimits: false,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + aProd.channels[aChannel].name;
    },
    getDataFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.full + "-" + aChannel + "-bytype.json";
    },
    getCategoryFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.full + "-" + aChannel + "-counts.json";
    },
    getLinkURL: function(aProd, aChannel) {
      return false;
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getCategoryFile(aProd, aChannel), "json",
          function(aCData) {
            if (!aCData || !aCData[gDay] || !aCData[gDay].startup)
              aCallback(null, aCBData);
            else
              fetchFile(this.getDataFile(aProd, aChannel), "json",
                  function(aData) {
                    if (!aData || !aData[gDay] || !aData[gDay].adi) {
                      aCallback(null, aCBData);
                    }
                    else {
                      var crashes = aCData[gDay].startup["browser"] ? parseInt(aCData[gDay].startup["browser"]) : 0;
                      var adi = parseInt(aData[gDay].adi);
                      var factor = aProd.channels[aChannel].rateBrCo.factor ?
                                  aProd.channels[aChannel].rateBrCo.factor : 1;
                      aCallback(adi ? (crashes / adi) * 100 * factor : null, aCBData);
                    }
                  }
              );
          }.bind(this)
      );
    },
  },
  plugincrash: {
    precision: 2,
    unit: "",
    lowLimits: false,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + aProd.channels[aChannel].name;
    },
    getDataFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.full + "-" + aChannel + "-bytype.json";
    },
    getLinkURL: function(aProd, aChannel) {
      return false;
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getDataFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[gDay] || !aData[gDay].crashes || !aData[gDay].adi) {
              aCallback(null, aCBData);
            }
            else {
              var crashes = aData[gDay].crashes["OOP Plugin"] ? parseInt(aData[gDay].crashes["OOP Plugin"]) : 0;
              var adi = parseInt(aData[gDay].adi);
              var factor = aProd.channels[aChannel].rateBrCo.factor ?
                           aProd.channels[aChannel].rateBrCo.factor : 1;
              aCallback(adi ? (crashes / adi) * 100 * factor : null, aCBData);
            }
          }
      );
    },
  },
  pluginhang: {
    precision: 2,
    unit: "",
    lowLimits: false,
    getPrettyVersion: function(aProd, aChannel) {
      return aProd.full + " " + aProd.channels[aChannel].name;
    },
    getDataFile: function(aProd, aChannel) {
      return gAnalysisPath + aProd.full + "-" + aChannel + "-bytype.json";
    },
    getLinkURL: function(aProd, aChannel) {
      return false;
    },
    getValue: function(aProd, aChannel, aCallback, aCBData) {
      fetchFile(this.getDataFile(aProd, aChannel), "json",
          function(aData) {
            if (!aData || !aData[gDay] || !aData[gDay].crashes || !aData[gDay].adi) {
              aCallback(null, aCBData);
            }
            else {
              var crashes = aData[gDay].crashes["Hang Plugin"] ? parseInt(aData[gDay].crashes["Hang Plugin"]) : 0;
              var adi = parseInt(aData[gDay].adi);
              var factor = aProd.channels[aChannel].rateBrCo.factor ?
                           aProd.channels[aChannel].rateBrCo.factor : 1;
              aCallback(adi ? (crashes / adi) * 100 * factor : null, aCBData);
            }
          }
      );
    },
  },
}

var gDebug, gLog;
var gDay;
//var gAnalysisPath = "https://crash-analysis.mozilla.com/rkaiser/";
//var gAnalysisPath = "../../";
var gAnalysisPath = "../socorro/";
var gBzAPIPath = "https://bugzilla.mozilla.org/bzapi/";
var gBzBasePath = "https://bugzilla.mozilla.org/";

window.onload = function() {
  gDebug = document.getElementById("debug");
  gLog = document.getElementById("debugLog");

  // Get date to analyze.
  fetchFile(gAnalysisPath + "latestdate.txt", "",
    function(aData) {
      if (aData) {
        gDay = aData.trim();
        document.getElementById("repDay").textContent = gDay;
        processData();
      }
      else {
        gDay = null;
        document.getElementById("repDay").textContent = "ERROR - couldn't find latest analyzed date!"
      }
    }
  );
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
      //var versionrow = sect.getElementsByClassName("versions")[0];
      //versionrow.appendChild(createCell(cdata.version));
      for (var source in gSources) {
        var sourcerow = sect.getElementsByClassName(source)[0];
        if (source.indexOf("plugin") !== -1 && gProductData[product].noplugin) {
          sourcerow.classList.add("hidden");
        }
        else {
          var sourceCell = sourcerow.appendChild(createCell(""));
          sourceCell.addEventListener("mouseover", infoEvent, false);
          sourceCell.addEventListener("mouseout", infoEvent, false);
          sourceCell.addEventListener("touchstart", infoEvent, false);
          sourceCell.addEventListener("touchleave", infoEvent, false);
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

function infoEvent(event) {
  var info = document.getElementById("infobox");

  var cell = event.target;
  if (cell.tagName == "A") { cell = cell.parentNode; }

  if (info.getElementsByClassName(cell.dataset.source)[0]) {
    if (event.type == "mouseover" || event.type == "touchstart") {
      // Position: The parent is the table and has the offset within the body.
      info.style.left = (cell.offsetParent.offsetLeft +
                        cell.offsetLeft - 1) + "px";
      info.style.top = (cell.offsetParent.offsetTop +
                        cell.offsetTop + cell.offsetHeight - 1) + "px";

      // Set info to show.
      info.getElementsByClassName(cell.dataset.source)[0].classList.add("current");

      if (gSources[cell.dataset.source].hasInfoValue) {
        info.getElementsByClassName("infovalue")[0].classList.remove("hidden");
        gSources[cell.dataset.source]
        .getInfoValue(gProductData[cell.dataset.product],
                      cell.dataset.channel,
                      function(aValue, aCBData) { aCBData.node.textContent = aValue; },
                      {node: info.getElementsByClassName("infovalue")[0]});
      }
      else {
        info.getElementsByClassName("infovalue")[0].classList.add("hidden");
      }

      if (gSources[cell.dataset.source].noLimits) {
        info.getElementsByClassName("limits")[0].classList.add("hidden");
      }
      else {
        info.getElementsByClassName("limits")[0].classList.remove("hidden");
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
      }

      document.getElementById("verinfo").textContent =
          gSources[cell.dataset.source]
          .getPrettyVersion(gProductData[cell.dataset.product],
                                         cell.dataset.channel);

      // Finally actually display the box.
      info.style.display = "block";
    }
    else {
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

function valueCallback(aValue, aCBData) {
  aCBData.data[aCBData.type].current = aValue;
  if (aValue !== null) {
    var url = gSources[aCBData.type]
              .getLinkURL(gProductData[aCBData.cell.dataset.product],
                                       aCBData.cell.dataset.channel);
    var value = formatValue(aValue, gSources[aCBData.type].precision,
                                    gSources[aCBData.type].unit);
    if (url) {
      var link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("target", "_blank");
      link.textContent = value;
      aCBData.cell.appendChild(link);
    }
    else {
      aCBData.cell.textContent = value;
    }
    if (!gSources[aCBData.type].noLimits) {
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
  else if (aUnit == "plain") {
    formatted = aValue;
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
  // returns a report version, e.g. 11.0 for 11.0b3, 13.0a1 for 13.0a1, 10.0 for 10.0.2, 38.0.5 for 38.0.5b99
  return /\d+b\d*$/.test(aVersion) ? aVersion.match(/^\d+(?:\.\d+)+/) : aVersion.match(/^\d+\.[\da]+/);
}

function intVer(aVersion) {
  // returns the internal version, e.g. 11.0 for 11.0b3, 13.0a1 for 13.0a1, 10.0.2 for 10.0.2
  return aVersion.match(/^[\d\.a]+/);
}
