# Process DoCtoR: an open-source process modelling and mining environment for DCR graphs

[Try it live!](https://kmvarvou.github.io/ProcessDoctor/)

This repository extends [DCR-js](https://github.com/hugoalopez-dtu/dcr-js) with new features to support accessibility, expressiveness, and efficiency for declarative process management. It is developed at the Technical University of Denmark by Konstantinos Varvoutas, Julian Neuberger, and Hugo A. López, as described in the paper currently submitted for publication:

> Varvoutas, K., Neuberger, J., López, H. A. Streamlining the education of Declarative Process Management with Process DoCtoR.

Compared with [DCR-js](https://github.com/hugoalopez-dtu/dcr-js), Process DoCtoR extends the original repository with the following features:

* **Modeling** — Models in DCR are a compound of events, relations, and higher-order constructions (subprocesses/nestings). This new version extends control-flow constraints with time and data perspectives.   Events can be associated with a variable (integer, boolean, or string) with an optional default value. Relations support FEEL-based guard expressions (e.g. `Diagnosis = true`) as well as time annotations: condition relations carry a minimum delay and response relations carry a deadline, both specified as [ISO 8601 duration strings](https://en.wikipedia.org/wiki/ISO_8601#Durations) (e.g. `P30D` for 30 days, `PT2H` for 2 hours). We use the semantics specified in this [paper](https://link.springer.com/chapter/10.1007/978-3-032-28160-9_25).

* **Elicitation** — In order to kickstart the models, we now provide the possibility to extract DCR graphs from textual descriptions. Thanks to LLM provide ways to automate the extraction of DCR graphs, including variables, guards, and deadlines. Our prompts and evaluation have been covered in [this paper](https://www.genai4pm2025.info/201.pdf). This step requires a personal API key. Get yours from [Google](https://support.google.com/googleapi/answer/6158862?hl=en), [OpenAI](https://platform.openai.com/login?next=%2Fapi-keys), or [Claude](https://platform.claude.com/docs/en/get-started), among others.

* **BPMN import** — To facilitate the exploration of the declarative mindset, now you can import BPMN models and convert them into equivalent DCR graphs. For more details on the BPMN features we support, please look at our [Formalise paper](https://dl.acm.org/doi/full/10.1145/3793656.3793684)

* **Process discovery** — The parsing and pre-processing stages around discovery were re-engineered for performance: logs are streamed incrementally instead of being loaded in whole, and equivalent traces are collapsed before discovery, enabling large real-world event logs to be mined entirely in the browser.

* **Simulation** — Step-based simulation extended with the time and data perspectives. When an event with an associated variable is executed, a pop-up prompts the user for a value. The simulation clock is user-controlled and can be advanced by a chosen amount. Traces can be exported as XES event logs including timestamps and variable values.

* **Conformance checking** — Extended with support for data guards and timed constraints, along with novel definitions for partial compliance, and re-engineered following the same trace-variant aggregation principle applied to discovery. Conformance runs in two modes, depending on the type of input model: control-flow mode, used for models without guards, variables, or time constraints, collapses traces into variants so each unique execution pattern is replayed once; data-aware mode, used for models with them, replays each trace individually while still grouping them visually by control-flow signature. Variant groups are marked conforming, violating, or partially violating, and each trace reports its number of control-flow and temporal violations. 

What are DCR Graphs? A novel notation ideal for flexible processes, such as those in healthcare, municipal administration, or knowledge-intensive processes in general.

For a formal definition of DCR graphs, please [read this paper](https://arxiv.org/pdf/1110.4161.pdf).

## Instructions
A demo video of the extended version of DCR-js can be watched [here](https://drive.google.com/file/d/1Bq_MyWjYrv3FAvXLdrEJDh0fllxPfiPd).

## Getting started
To follow along with the demo video and try out the basic functionalities yourself, head to the [live app](https://kmvarvou.github.io/ProcessDoctor/). Example files for each functionality shown in the video are provided in the [`bpm_demo`](bpm_demo) folder:

* **Modeling & Simulation** — `bpm_demo/Modeling_Simulation/Multi-perspective medical prescription.xml`
* **BPMN import** — `bpm_demo/BPMN Import/ExampleFormalise.bpmn` and `bpm_demo/BPMN Import/test_xor_model.bpmn`
* **Elicitation** — This feature requires setting up a personal OpenAI API key. For exemplary process descriptions, the tool already has embedded some examples in its 'import from text' menu.
* **Process discovery** — [BPI Challenge 2019 event log](https://drive.google.com/file/d/1OLfE6Z9pRyNjc4UIJZiYRbfOwkD0bf_C/view?usp=drive_link)
* **Conformance checking** — `bpm_demo/Conformance/Multi-perspective medical prescription.xml` together with `bpm_demo/Conformance/test event log.xes`

## License
This package is published using an MIT license





