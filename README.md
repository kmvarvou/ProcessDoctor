# Process DoCtoR: an open-source process modelling and mining environment for DCR graphs

[Try it live!](https://kmvarvou.github.io/ProcessDoctor/)

This repository extends [DCR-js](https://github.com/hugoalopez-dtu/dcr-js) with new features to support accessibility, expressiveness, and efficiency for declarative process management. It is developed at the Technical University of Denmark by Konstantinos Varvoutas, Julian Neuberger, and Hugo A. López, as described in the preprint:

> Varvoutas, K., Neuberger, J., López, H. A. Streamlining the education of Declarative Process Management with Process DoCtoR. International Conference on Business Process Management — Demos and Resources, 2026.

The extensions cover the following areas of DCR-js:

* **Modeling** — Events can be associated with a variable (integer, boolean, or string) with an optional default value. Relations support FEEL-based guard expressions (e.g. `Diagnosis = true`) as well as time annotations: condition relations carry a minimum delay and response relations carry a deadline, both specified as ISO 8601 duration strings (e.g. `P30D` for 30 days, `PT2H` for 2 hours).

* **Elicitation** — Automatic extraction of DCR graphs, including variables, guards, and deadlines, from natural-language process descriptions using large language models.

* **BPMN import** — Sound BPMN models can be imported and converted to DCR graphs, helping users coming from imperative modeling notations transition into declarative process management.

* **Process discovery** — The parsing and pre-processing stages around discovery were re-engineered for performance: logs are streamed incrementally instead of being loaded whole, and equivalent traces are collapsed before discovery, enabling large real-world event logs to be mined entirely in the browser.

* **Simulation** — Step-based simulation extended with the time and data perspectives. When an event with an associated variable is executed, a pop-up prompts the user for a value. The simulation clock is user-controlled and can be advanced by a chosen amount. Traces can be exported as XES event logs including timestamps and variable values.

* **Conformance checking** — Extended with support for data guards and timed constraints, along with novel definitions for partial compliance, and re-engineered following the same trace-variant aggregation principle applied to discovery. Conformance runs in two modes, depending on the type of input model: control-flow mode, used for models without guards, variables, or time constraints, collapses traces into variants so each unique execution pattern is replayed once; data-aware mode, used for models with them, replays each trace individually while still grouping them visually by control-flow signature. Variant groups are marked conforming, violating, or partially violating, and each trace reports its number of control-flow and temporal violations. 

What are DCR Graphs? A novel notation ideal for flexible processes, such as those in healthcare, municipal administration, or knowledge-intensive processes in general.

For a formal definition of DCR graphs, please [read this paper](https://arxiv.org/pdf/1110.4161.pdf).

## Instructions
A demo video of the extended version of DCR-js can be watched [here](https://drive.google.com/file/d/1Bq_MyWjYrv3FAvXLdrEJDh0fllxPfiPd).

## License
This package is published using an MIT license





