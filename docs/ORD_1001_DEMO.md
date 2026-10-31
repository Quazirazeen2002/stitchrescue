# ORD-1001 — explicitly simulated demonstration

This scenario is exercised by pytest and the connected browser test using a temporary database. It does not add simulated production rows to the operational SQLite file.

Order: 20,000 shirts. The existing seed record has 20,000 completed and 2,000 rejected, giving 18,000 accepted. Affected quantity: 2,000. Remaining time: 48 hours. Configured potential penalty exposure: BDT 500,000.

1. Register `SIM-ROLL-1001` for ORD-1001 with a simulated supplier and 500 metres of cotton.
2. Preserve a simulated test photograph; record an oil-stain observation as `HUMAN_REPORTED` and `PENDING`.
3. A simulated human inspector verifies it, with identity and notes.
4. Register `SIM-BATCH-1001`, cutting line `SIM-CUT-1`, sewing line `SIM-SEW-1`, planned quantity 2,000. Allocate 200 metres of the roll.
5. Save a LineWatch report. It includes the verified observation and unknown evidence. It does not establish a machine cause.
6. Calculate alternatives with these explicitly simulated inputs: rework BDT 20/unit at 100 units/hour; replacement BDT 180/unit at 120 units/hour with 2,000 material units; 1,000 approved stock units at BDT 150/unit and 3 handling hours.
7. Rework: recover 2,000, estimated BDT 40,000, 20 hours. Replacement: recover 2,000, BDT 360,000, about 16.6667 hours. Stock: recover 1,000, BDT 150,000, 3 hours, leaving 1,000 missing. Partial shipment: 18,000 accepted units available, 2,000 still due; buyer authorization and revised delivery terms are required.
8. Material/buyer compatibility, capacity and reinspection confirmations are simulated checkboxes, not actual factory proof. Rework/replacement are marked feasible only when those supplied prerequisites are confirmed. Stock is insufficient; partial shipment remains conditional.
9. Save REWORK as a proposal with evidence. Request manager approval. The human test manager records APPROVED using the separate test credential and explicit human confirmation.
10. Verify the audit stream and approved plan state. No rework, shipment or financial transaction is executed.

The browser test uses the real forms, API endpoints, image upload, selectors, calculations, proposal and decision controls. Unit tests separately exercise provider failure without requiring live Meta access.
