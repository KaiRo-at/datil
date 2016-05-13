# score
Top Crash Score builds weighted top crash lists by calculating an "importance" score for every signature, e.g. startup crashes or crashes repeatedly seen by users get to be closer to the top of the list, while GC or OOM|small get to be lower in the list.
Currently running on [crash-analysis/.../score](https://crash-analysis.mozilla.com/rkaiser/datil/score/) but can run anywhere as long as the [Socorro API](https://crash-stats.mozilla.com/api/) is accessible.

## Parameters

The tool supports a number of parameters:

* product
  * Any product listed in Socorro (Firefox [default], FennecAndroid, etc.)
* version
  * A version of this product (e.g. 44.0b8 or 43.0, defaults to 44.0b1)
* buildid
  * A specific build ID to match (e.g. to be able to run this for a specific release candidate)
* limit
  * How many entries to display (defaults to 10)
  * Right now, the top limit*1.5 entries are being queried in the first place, but that may change
* duration
  * How many days back to query (defaults to 7)
* date
  * if this is "now", will query up to the current minute, otherwise to the last full UTC day
* process
  * which process type to query for (browser, content, plugin, browser+content - shorthands allowed: b, c, p, bc)
  * defaults to browser+content for Firefox, browser for other products

## Examples

* https://crash-analysis.mozilla.com/rkaiser/crash-report-tools/score/?product=FennecAndroid&version=44.0b11&date=now&limit=30
  * Max 30 entries, for FennecAndroid 44.0b11, 7 days up to the current minute

* https://crash-analysis.mozilla.com/rkaiser/crash-report-tools/score/?version=44.0b99&limit=30&process=b
  * Max 30 entries, only browser process, for Firefox 44.0 RC (all builds), 7 full UTC days before today

* https://crash-analysis.mozilla.com/rkaiser/crash-report-tools/score/?version=46.0b99&buildid=20160421124000&limit=30&date=now
  * Max 30 entries, browser+content processes (default), for the last Firefox 46.0 RC (by specific build IDs), 7 days up to right now

* https://crash-analysis.mozilla.com/rkaiser/crash-report-tools/score/?version=46.0a1&limit=30&duration=3&date=now
  * Max 30 entries, browser+content processes (default), for Firefox 46.0a1 (current nightly), 3 days up to right now

## Development Notes:

See https://public.etherpad-mozilla.org/p/topcrash-weighted
