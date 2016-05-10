# datil
Datil is a little town on the other side of the VLA from Socorro, New Mexico.

This repository contains dashboards and web tools for working with [Socorro](https://github.com/mozilla/socorro) (which was originally named this way because it collects and analyzes crash data from "out there", similar to the VLA that has its operations center in Socorro, NM).

Some dashboards/tools in this repo are supposed to work in concert with [Magdalena](https://github.com/KaiRo-at/magdalena), though they are supposed to be able to operate on different servers. That said, right now, [missing CORS headers](https://bugzilla.mozilla.org/show_bug.cgi?id=1239764) prevent this and Datil needs to run on the same crash-analysis machine that Magdalena is running on.

Currently, the following dashboards/tools are part of Datil:

* [dashboard](dashboard/README.md): main dashboard of [arewestableyet](https://arewestableyet.com)
* [longtermgraph](longtermgraph/README.md): long-term crash [graphs](https://arewestableyet.com/graph/) linked from arewestableyet
* [score](score/README.md): weighted top crash lists by calculating an "importance" score for every signature
* [searchcompare](searchcompare/README.md): compare two Socorro Super Search queries

See the separate READMEs linked from the dashboard/tool names for more details and usage instructions!
