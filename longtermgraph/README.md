# longtermgraph
This is the code for long-term crash [graphs](https://arewestableyet.com/graph/) linked from the [arewestableyet](https://arewestableyet.com) [dashboard](../dashboard/README.md).

You can zoom into a date range by clicking and dragging the mouse over a range, unzoom by double-clicking. Annotations on the graphs have tooltips with a description that is displayed on hovering over the annotation.
Those graphs use only counts of crashes actually submitted to Socorro crash-stats and has no idea how many crashes actually happened on users's computers. Usually, crash counts are normalized by blocklist ping ADIs, and browser+content process crashes are summed up, there are checkboxes where applicable to siwtch off those defaults.

## Parameters

All in all, the graphs only take one unnamed parameter that signifies which graph to show by compounding multiple parts:

* "fx" or "and" or Firefox desktop or Firefox for Android
* "nightly", "aurora", "beta", or "rel" for the Nightly, Aurora (Developer Edition), Beta, and Release channels
* Optionally, after a dash ("-"), a type of graph ("bcat", "ccat", "pcat" for category graphs of browser, content, and plugin processes) - if not given, type will be the main graph of crashe rates for the different processes of this product and channel
* or just "office" for a random product+channel graph formatted for display on office screens

## Examples

* https://arewestableyet.com/graph/?fxrel
  * Main crash rate graph for Firefox Release

* https://arewestableyet.com/graph/?andbeta-bcat
  * Split of browser process crashes by category for Firefox for Android Beta channel

* https://arewestableyet.com/graph/?fxnightly-ccat
  * Split of content process crashes by category for desktop Nightly channel

* https://arewestableyet.com/graph/?office - or just https://arewestableyet.com/office
  * Random graph to display on office screens, refeshes to other random product+channel combination on every load
  * Only displays last year of crashes

## Legend

### Main graphs

* browser crashes
* content crashes
  * Rates (per 100 blocklist ping ADI) or counts (if normalization unchecked) of submitted crashes for browser/main and content processes
* browser+content crashes
  * Sum of crash rates/counts for browser and content processes
* plugin crashes
  * Rate/count of (submitted) actual crashes in plugin processes
* plugin hangs
  * Rate/count of (submitted) "hangs" in plugin processes - if a plugin process doesn't respond to the main process in 45 seconds, it is being artifically crashed and this is counted as a "plugin hang"

### Category graphs

* total (reference)
  * total crash rate/count of submitted crashes for the given process type
* startup (<60s uptime)
  * "startup" crashes, i.e. where the given process has been running for less than 60 seconds before crashing
* OOM (total)
  * Out of memory crashes (signatures that clearly indicate and out-of-memory condition, regardless of annotation size annotation existing or its value)
* OOM:small (<256K)
  * Out of memory crashes where an allocation sizes of up to 256 KB was annotated - usually meaning general memory pressure, no fix specific to the crash possible
* OOM:large (>256K)
  * Out of memory crashes where an allocation sizes of over 256 KB was annotated - often can be fixed by making the specific code path use less memory or failing gracefully (fallible allocation) when this condition is encountered
* pure address (@0x...)
  * The crash signature only consists of a bare address, usually without any useful stack/backtrace - could be memory corruption, stackwalking failure or similar
* unsymbolized: file@0x...
  * Unsymbolized file@address pattern at the start of the signature - either missing symbols that need to be fetched from somewhere or crashes in 3rd-party libraries that we don't have symbols for
* shutdownhang (>1min)
  * Shutting down Firefox took more than 60 seconds and we killed the process by force to both make it go away and give us some data to analyze from those submitted crashes - the interesting stack is usually in thread 0 and not the crashing thread
