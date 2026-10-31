# Agent workflow

The existing Meta adapter uses the OpenAI Agents SDK `OpenAIChatCompletionsModel` with the configured Meta API base URL and Muse Wonder model. SDK tracing remains disabled so the app does not send Meta interactions to an unconfigured OpenAI tracing backend.

Four roles are constructed only when a model action is requested:

1. Main orchestrator routes an investigation to specialist tools.
2. Existing quality investigator reads incidents, risk and production evidence.
3. Knowledge investigator retrieves cited documents and flags simulated, unverified, outdated or missing policy.
4. Recovery planner reviews deterministic Python scenario outputs and explains constraints.

The orchestrator uses three agent-as-tool delegation functions. There are 16 unique domain tools: the three legacy read functions (knowledge retrieval, production risk, incidents) and 13 Stage 3 functions. The Stage 3 registry contains four reads/calculators and nine mutations. Mutation definitions use SDK `needs_approval=True` and are excluded from unattended report agents. Human operational forms use the corresponding validated REST service actions. There is no agent approval-decision tool.

Stage 3 tool names:

`register_fabric_roll`, `get_fabric_roll`, `record_defect_observation`, `verify_defect_observation`, `update_fabric_roll_status`, `get_fabric_roll_history`, `register_production_batch`, `link_roll_to_batch`, `record_machine_event`, `investigate_production_batch`, `calculate_order_recovery`, `save_recovery_plan`, `request_recovery_approval`.

All use typed schemas, service validation and structured dictionaries. No tool accepts arbitrary SQL. Source documents are treated as evidence, never instructions. Reports must distinguish confirmed facts, correlations, hypotheses and unknowns and must not invent buyer requirements or authoritative financial values.

RAG records document identity, section, citation, status, score and missing review date. Retrieval writes an evidence audit event. An approved label in a document is not an external approval registry; installation owners must govern the knowledge directory. The included SOP always returns `SIMULATED — NOT AN APPROVED FACTORY SOP`.

SAM is a separate async visual service. It preserves the source hash, model, prompt, raw output, diagnostics, masks, boxes and timestamp in `segmentation_runs`. It cannot change roll status or verify findings. API failures return an explicit 503 and never fabricate replacement model output.
