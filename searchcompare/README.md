# searchcompare
Simple way to compare two Socorro Super Search queries and the relative percentages of the signatures returned from it.
Currently running on [crash-analysis/.../searchcompare](https://crash-analysis.mozilla.com/rkaiser/datil/searchcompare/) but can run anywhere as long as the [Socorro API](https://crash-stats.mozilla.com/api/) is accessible.

Currently, any Super Search queries that facet on signatures are supported. By default, the top 300 signatures are fetched for both queries, and the 20 with the largest percentage changes between the two queries will be displayed. Links to both search queries are listed right under the header and the "[edit]" text next to it toggles UI to edit the query parameters.

## Parameters

* common
  * The common Super Search parameters shared between the queries to compare.
* p1
  * Super Search parameters specific to only query 1.
  * If both common and p1 are not specified, UI will be presented for entering common, p1, and p2, and no comparison will be run.
* p2
  * Super Search parameters specific to only query 2.
  * If both common and p2 are not specified or p1 and p2 are the same, UI will be presented for entering common, p1, and p2, and no comparison will be run.
* limit
  * Amount of signatures with largest percentage changes between the queries to be shown (defaults to 20)
* fetchlimit
  * Amount of top signatures to fetch for every query (defaults to 300)

## Examples

* https://crash-analysis.mozilla.com/rkaiser/datil/searchcompare/?common=product%3DFirefox%26process_type%3Dbrowser%26process_type%3Dcontent%26dom_ipc_enabled%3D__null__&p1=version%3D47.0b3&p2=version%3D47.0b4
  * Compare browser and content non-e10s crashes between Firefox 47.0b3 and 47.0b4

* https://crash-analysis.mozilla.com/rkaiser/datil/searchcompare/?common=product%3DFirefox%26version%3D48.0a2%26process_type%3Dbrowser%26process_type%3Dcontent&p1=dom_ipc_enabled%3D__null__&p2=dom_ipc_enabled%3D%21__null__
  * Compare browser and content crash signatures on Firefox 48 Developer Edition between e10s being off and on

* https://crash-analysis.mozilla.com/rkaiser/datil/searchcompare/?common=product%3DFirefox%26process_type%3Dbrowser%26process_type%3Dcontent%26dom_ipc_enabled%3D__null__%26signature%3D%7EOOM&p1=version%3D44.0b%26date%3D%3E%253D2016-01-10%26date%3D%3C2016-01-17&p2=version%3D45.0b%26date%3D%3E%253D2016-02-17%26date%3D%3C2016-02-24&limit=30
  * Compare browser and content non-e10s OOM crashes bnetween Firefox 44 and 45 betas of certain date ranges
