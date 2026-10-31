# LineWatch

A production batch references an existing order and records cutting/sewing lines, planned/produced quantities, start/completion timestamps and status. Produced quantity cannot exceed the planned quantity. A batch cannot exceed the order's total quantity.

A roll may be linked to several batches. A batch/roll pair is unique; the sum of all allocated metres may not exceed the roll length. Allocation is transactional and requires a matching production order. `ON_HOLD` and `CONSUMED` rolls cannot receive new allocations. Putting a roll on hold preserves earlier links for traceability. Completed batches cannot receive new links.

Machine event types are maintenance, breakdown, cleaning, lubrication and inspection. Records include machine, production line, timestamp, description and recorder. Investigation queries both cutting and sewing lines.

A deterministic investigation returns:

- Recorded batch and roll facts.
- Human-verified defects and pending observations separately.
- Machine events as potential line correlations.
- Repeated verified labels across linked batches.
- Missing start times, allocations, verification, machine evidence and clearance.
- An explicit statement that no machine or operator cause is established.

The report does not infer causation from shared lines or timing. It has no fabricated hypotheses or confidence score. Saving an investigation creates a finding, a report and an audit event. A manager may request additional Muse Wonder reasoning in Investigation Reports; the same facts remain the evidence base.
