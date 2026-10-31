import gradio as gr
import pandas as pd

from PIL import Image, ImageDraw
from ai.sam_service import segment_fabric


from core.database import (
    init_fabricguard,
    register_fabric_roll,
    get_fabric_rolls,
    get_roll_observations,
    verify_observation,
    update_fabric_roll_status,
    get_fabric_audit,
)

from core.database import (
    init_linewatch,
    register_production_batch,
    link_roll_to_batch,
    record_machine_event,
)

from core.linewatch import investigate_batch
from core.fabricguard import record_fabric_observation
from core.database import (
    init_db,
    get_orders,
    get_order,
    get_incidents,
    save_inspection,
    create_incident,
)
from core.inspection import inspect_image
from core.risk_engine import calculate_risk

from ai.investigator import investigate

init_db()

init_fabricguard()

init_linewatch()

CSS = """
.gradio-container {
    max-width: 1400px !important;
    margin: auto !important;
}
.hero {
    background: linear-gradient(120deg, #102D38, #176A70);
    padding: 30px;
    border-radius: 18px;
    color: white;
}
.hero h1 { color: white !important; }
.hero p { color: #D3EAEB !important; }
"""

def order_table():
    return pd.DataFrame(get_orders())


def incident_table():
    rows = get_incidents()
    return pd.DataFrame(
        rows,
        columns=[
            "id", "order_id", "defect_label",
            "affected_quantity", "status", "created_at"
        ]
    )


def overview():
    orders = get_orders()
    incidents = get_incidents()

    critical = sum(
        calculate_risk(o)["risk"] == "CRITICAL"
        for o in orders
    )

    return (
        len(orders),
        len(incidents),
        critical,
        order_table()
    )


def run_inspection(image, annotation, order_id, label):
    if image is None:
        raise gr.Error("Upload an image first.")

    try:
        result, detections, path = inspect_image(
            image, annotation
        )

        evidence_type = (
            "DATASET_ANNOTATION"
            if annotation else "MANUAL_REVIEW"
        )

        inspection_id = save_inspection(
            order_id, path, label, evidence_type
        )

        message = (
            f"Inspection #{inspection_id} saved. "
            f"Annotation boxes: {len(detections)}. "
            f"Evidence: {evidence_type}. "
            "No AI defect prediction was performed."
        )

        return result, detections, message

    except Exception as exc:
        raise gr.Error(str(exc))


def analyze_order(order_id):
    order = get_order(order_id)

    if not order:
        raise gr.Error("Order not found.")

    risk = calculate_risk(order)

    report = f"""
### Production Risk Report

**Order:** {risk['order_id']}

**Accepted units:** {risk['accepted_units']:,}

**Remaining units:** {risk['remaining_units']:,}

**Required production time:** {risk['required_hours']} hours

**Time available:** {risk['hours_left']} hours

**Nominal buffer:** {risk['buffer_hours']} hours

**Risk level:** {risk['risk']}

**Potential penalty exposure:** ৳{risk['penalty_exposure_bdt']:,.0f}

*Assumes the configured production rate remains available.
Quality inspection, transport, and other dependencies
are not included.*
"""
    return report, risk


def report_incident(order_id, defect, quantity):
    order = get_order(order_id)

    if order is None:
        raise gr.Error("Invalid order.")

    quantity = int(quantity)

    if quantity <= 0 or quantity > order["quantity"]:
        raise gr.Error("Invalid affected quantity.")

    incident_id = create_incident(
        order_id, defect, quantity
    )

    return (
        f"Incident #{incident_id} created. "
        "Status: OPEN. Awaiting quality verification.",
        incident_table()
    )


async def run_sam_inspection(image_path, prompt):
    if not image_path:
        raise gr.Error("Upload a fabric image.")

    if not prompt or not prompt.strip():
        raise gr.Error("Enter a segmentation prompt.")

    try:
        result = await segment_fabric(
            image_path,
            prompt.strip()
        )

        original = Image.open(image_path).convert("RGB")
        preview = original.copy()
        draw = ImageDraw.Draw(preview)

        box_details = []

        for box in result["boxes"]:
            x1 = int(box.left)
            y1 = int(box.top)
            x2 = int(box.right)
            y2 = int(box.bottom)

            draw.rectangle(
                [x1, y1, x2, y2],
                outline="#00D5B0",
                width=4
            )

            box_details.append({
                "object_id": str(box.object_id),
                "box": [x1, y1, x2, y2],
                "confidence": getattr(
                    box, "confidence", None
                ),
            })

        report = {
            "model": "sam-3.1",
            "status": result["outcome"],
            "prompt": prompt,
            "objects_found": len(result["boxes"]),
            "masks_returned": len(result["masks"]),
            "boxes": box_details,
            "diagnostics": [
                str(item)
                for item in result["diagnostics"]
            ],
            "raw_output": result["raw_output"],
        }

        status = (
            f"SAM completed. "
            f"Objects: {len(result['boxes'])}. "
            f"Masks: {len(result['masks'])}."
        )

        if not result["boxes"]:
            status = (
                "SAM returned zero matches. "
                "Try a different concrete noun phrase."
            )

        return preview, report, status

    except Exception as exc:
        raise gr.Error(
            f"SAM inspection failed: {exc}"
        )


orders = get_orders()
order_ids = [o["id"] for o in orders]


def register_roll_ui(
    roll_id, supplier, fabric_type,
    color, length, order_id
):
    try:
        roll_id = roll_id.strip()
        if not roll_id:
            raise ValueError("Roll ID is required.")

        register_fabric_roll(
            roll_id,
            supplier.strip(),
            fabric_type.strip(),
            color,
            float(length),
            order_id
        )

        rolls = get_fabric_rolls()
        roll_ids = [roll["roll_id"] for roll in rolls if roll["roll_id"]]

        return (
            "Fabric roll registered successfully.",
            pd.DataFrame(rolls),
            gr.update(choices=roll_ids, value=roll_id),
            gr.update(choices=roll_ids, value=roll_id),
        )
    except Exception as exc:
        raise gr.Error(str(exc))


def record_observation_ui(
    roll_id, image, defect,
    position, width_position,
    evidence_source, notes
):
    try:
        observation_id, saved_path = (
            record_fabric_observation(
                roll_id,
                image,
                defect,
                position,
                width_position,
                evidence_source,
                notes
            )
        )

        return (
            f"Observation #{observation_id} saved. "
            f"Evidence: {evidence_source}. "
            "Verification: PENDING.",
            pd.DataFrame(get_roll_observations(roll_id)),
            saved_path
        )

    except Exception as exc:
        raise gr.Error(str(exc))


def refresh_roll_ui(roll_id):
    rolls = get_fabric_rolls()
    roll_ids = [roll["roll_id"] for roll in rolls if roll["roll_id"]]
    selected = roll_id if roll_id in roll_ids else (roll_ids[0] if roll_ids else None)

    return (
        pd.DataFrame(rolls),
        pd.DataFrame(get_roll_observations(selected)) if selected else pd.DataFrame(),
        pd.DataFrame(get_fabric_audit(selected)) if selected else pd.DataFrame(),
        gr.update(choices=roll_ids, value=selected),
        gr.update(choices=roll_ids, value=selected),
    )


def verify_observation_ui(
    observation_id, decision, notes
):
    try:
        verify_observation(
            int(observation_id),
            decision,
            notes
        )

        return (
            "Verification decision recorded.",
        )

    except Exception as exc:
        raise gr.Error(str(exc))


def update_roll_status_ui(roll_id, status):
    try:
        update_fabric_roll_status(roll_id, status)

        return (
            "Fabric roll status updated.",
            pd.DataFrame(get_fabric_rolls()),
            pd.DataFrame(get_fabric_audit(roll_id))
        )

    except Exception as exc:
        raise gr.Error(str(exc))


def run_linewatch_ui(batch_id):
    try:
        result = investigate_batch(batch_id)

        return (
            result,
            "Batch trace retrieved successfully."
        )
    except Exception as exc:
        raise gr.Error(str(exc))


def create_batch_ui(
    batch_id, order_id, cutting_line,
    sewing_line, quantity, started_at
):
    try:
        register_production_batch(
            batch_id, order_id, cutting_line,
            sewing_line, quantity, started_at
        )
        return "Production batch registered."
    except Exception as exc:
        raise gr.Error(str(exc))


def link_roll_ui(batch_id, roll_id, length):
    try:
        link_roll_to_batch(
            batch_id, roll_id, length
        )
        return "Fabric roll linked successfully."
    except Exception as exc:
        raise gr.Error(str(exc))


def add_machine_event_ui(
    machine_id, line, event_type,
    description, event_time, actor
):
    try:
        record_machine_event(
            machine_id, line, event_type,
            description, event_time, actor
        )
        return "Machine event recorded."
    except Exception as exc:
        raise gr.Error(str(exc))



with gr.Blocks(
    title="StitchRescue",
    theme=gr.themes.Soft(primary_hue="teal"),
    css=CSS
) as demo:

    gr.HTML("""
    <div class="hero">
        <h1>STITCHRESCUE</h1>
        <p>Garment Quality Intelligence &
        Production Recovery Command Center</p>
        <p>Stage 1 · Dataset-Grounded Inspection</p>
    </div>
    """)

    with gr.Tabs():


        with gr.Tab("LineWatch"):
            gr.Markdown("""
            # LineWatch
            ### Production Traceability & Investigation
            """)

            with gr.Accordion("Register Production Batch"):
                batch_id = gr.Textbox(
                    label="Batch ID",
                    value="BATCH-1001-A"
                )

                batch_order = gr.Dropdown(
                    choices=order_ids,
                    label="Order ID",
                    value=order_ids[0]
                )

                cutting_line = gr.Textbox(
                    label="Cutting Line",
                    value="CUT-01"
                )

                sewing_line = gr.Textbox(
                    label="Sewing Line",
                    value="SEW-03"
                )

                quantity = gr.Number(
                    label="Planned Quantity",
                    value=5000,
                    precision=0
                )

                started_at = gr.Textbox(
                    label="Start Time (ISO format)",
                    value="2026-10-31T08:00:00"
                )

                create_batch_btn = gr.Button(
                    "Register Batch"
                )

                create_batch_status = gr.Textbox()

                create_batch_btn.click(
                    create_batch_ui,
                    inputs=[
                        batch_id, batch_order,
                        cutting_line, sewing_line,
                        quantity, started_at
                    ],
                    outputs=create_batch_status
                )

            gr.Markdown("---")
            gr.Markdown("## Link Fabric Roll")

            link_batch_id = gr.Textbox(
                label="Batch ID",
                value="BATCH-1001-A"
            )

            link_roll_id = gr.Textbox(
                label="Fabric Roll ID",
                value="ROLL-GZ-104"
            )

            allocated_length = gr.Number(
                label="Allocated Length (metres)",
                value=100
            )

            link_btn = gr.Button("Link Roll")
            link_status = gr.Textbox()

            link_btn.click(
                link_roll_ui,
                inputs=[
                    link_batch_id,
                    link_roll_id,
                    allocated_length
                ],
                outputs=link_status
            )

            gr.Markdown("---")
            gr.Markdown("## Record Machine Event")

            machine_id = gr.Textbox(
                label="Machine ID",
                value="MACHINE-CUT-01"
            )

            machine_line = gr.Textbox(
                label="Production Line",
                value="CUT-01"
            )

            machine_event_type = gr.Dropdown(
                choices=[
                    "MAINTENANCE",
                    "BREAKDOWN",
                    "CLEANING",
                    "LUBRICATION",
                    "INSPECTION"
                ],
                value="MAINTENANCE"
            )

            machine_description = gr.Textbox(
                label="Event Description",
                value="Routine maintenance completed"
            )

            machine_event_time = gr.Textbox(
                label="Event Time (ISO format)",
                value="2026-10-31T09:00:00"
            )

            machine_actor = gr.Textbox(
                label="Recorded By",
                value="Maintenance Supervisor"
            )

            machine_btn = gr.Button(
                "Record Machine Event"
            )

            machine_status = gr.Textbox()

            machine_btn.click(
                add_machine_event_ui,
                inputs=[
                    machine_id,
                    machine_line,
                    machine_event_type,
                    machine_description,
                    machine_event_time,
                    machine_actor
                ],
                outputs=machine_status
            )

            gr.Markdown("---")
            gr.Markdown("## Batch Investigation")

            investigate_batch_id = gr.Textbox(
                label="Production Batch ID",
                value="BATCH-1001-A"
            )

            investigate_btn = gr.Button(
                "Investigate Batch",
                variant="primary"
            )

            investigation_output = gr.JSON(
                label="Production Trace"
            )

            investigation_status = gr.Textbox(
                label="Status"
            )

            investigate_btn.click(
                run_linewatch_ui,
                inputs=investigate_batch_id,
                outputs=[
                    investigation_output,
                    investigation_status
                ]
            )



        with gr.Tab("FabricGuard"):
            gr.Markdown("""
            # FabricGuard
            ### Fabric Roll Quality Management

            Register incoming fabric rolls, attach
            inspection evidence and verify quality findings.
            """)

            with gr.Accordion(
                "Register New Fabric Roll",
                open=True
            ):
                with gr.Row():
                    roll_id = gr.Textbox(
                        label="Roll ID",
                        placeholder="ROLL-GZ-104"
                    )

                    supplier = gr.Textbox(
                        label="Supplier",
                        placeholder="Supplier name"
                    )

                with gr.Row():
                    fabric_type = gr.Textbox(
                        label="Fabric Type",
                        placeholder="Cotton"
                    )

                    color = gr.Textbox(
                        label="Color",
                        placeholder="White"
                    )

                with gr.Row():
                    roll_length = gr.Number(
                        label="Length (metres)",
                        value=500,
                        minimum=0.01
                    )

                    roll_order = gr.Dropdown(
                        choices=order_ids,
                        value=order_ids[0],
                        label="Linked Order"
                    )

                register_btn = gr.Button(
                    "Register Roll",
                    variant="primary"
                )

                register_status = gr.Textbox(
                    label="Registration Status"
                )

                roll_table = gr.Dataframe(
                    label="Registered Fabric Rolls",
                    interactive=False
                )

            gr.Markdown("---")
            gr.Markdown("## Record Fabric Defect Evidence")

            registered_ids = [
                r["roll_id"] for r in get_fabric_rolls() if r["roll_id"]
            ]

            selected_roll = gr.Dropdown(
                choices=registered_ids,
                value=registered_ids[0] if registered_ids else None,
                label="Select Fabric Roll"
            )

            with gr.Row():
                fabric_image = gr.Image(
                    type="filepath",
                    label="Inspection Photograph"
                )

                defect_name = gr.Textbox(
                    label="Reported Defect",
                    placeholder="Suspected oil stain"
                )

            with gr.Row():
                position = gr.Number(
                    label="Position along roll (metres)",
                    value=None
                )

                width_position = gr.Number(
                    label="Width position (%)",
                    value=None
                )

            evidence_source = gr.Dropdown(
                choices=[
                    "HUMAN_REPORTED",
                    "BDFD9_GROUND_TRUTH",
                    "MODEL_PREDICTION"
                ],
                value="HUMAN_REPORTED",
                label="Evidence Source"
            )

            observation_notes = gr.Textbox(
                label="Inspector Notes",
                lines=2
            )

            record_btn = gr.Button(
                "Save Defect Observation",
                variant="primary"
            )

            observation_status = gr.Textbox(
                label="Observation Status"
            )

            observation_table = gr.Dataframe(
                label="Roll Defect Observations",
                interactive=False
            )

            record_btn.click(
                record_observation_ui,
                inputs=[
                    selected_roll,
                    fabric_image,
                    defect_name,
                    position,
                    width_position,
                    evidence_source,
                    observation_notes
                ],
                outputs=[
                    observation_status,
                    observation_table,
                    fabric_image
                ]
            )

            gr.Markdown("---")
            gr.Markdown("## Quality Verification")

            observation_id = gr.Number(
                label="Observation ID",
                precision=0
            )

            verification_decision = gr.Radio(
                choices=["VERIFIED", "REJECTED"],
                label="Inspector Decision"
            )

            verification_notes = gr.Textbox(
                label="Verification Notes"
            )

            verify_btn = gr.Button(
                "Submit Verification",
                variant="primary"
            )

            verification_status = gr.Textbox(
                label="Verification Result"
            )

            verify_btn.click(
                verify_observation_ui,
                inputs=[
                    observation_id,
                    verification_decision,
                    verification_notes
                ],
                outputs=[verification_status]
            )

            gr.Markdown("---")
            gr.Markdown("## Roll Status & Audit History")

            status_roll = gr.Dropdown(
                choices=registered_ids,
                value=registered_ids[0] if registered_ids else None,
                label="Select Roll"
            )

            new_roll_status = gr.Dropdown(
                choices=[
                    "RECEIVED",
                    "UNDER_INSPECTION",
                    "ON_HOLD",
                    "QUALITY_CLEARED"
                ],
                value="UNDER_INSPECTION",
                label="New Roll Status"
            )

            update_status_btn = gr.Button(
                "Update Roll Status"
            )

            roll_status_message = gr.Textbox(
                label="Status Update"
            )

            refresh_btn = gr.Button(
                "Refresh Roll Records"
            )

            audit_table = gr.Dataframe(
                label="Roll Audit History",
                interactive=False
            )

            register_btn.click(
                register_roll_ui,
                inputs=[roll_id, supplier, fabric_type, color, roll_length, roll_order],
                outputs=[register_status, roll_table, selected_roll, status_roll]
            )

            update_status_btn.click(
                update_roll_status_ui,
                inputs=[status_roll, new_roll_status],
                outputs=[
                    roll_status_message,
                    roll_table,
                    audit_table
                ]
            )

            refresh_btn.click(
                refresh_roll_ui,
                inputs=[selected_roll],
                outputs=[
                    roll_table,
                    observation_table,
                    audit_table,
                    selected_roll,
                    status_roll,
                ]
            )



        with gr.Tab("Meta Visual Intelligence"):
            gr.Markdown("""
            ## Meta SAM 3.1 — Fabric Segmentation

            Compare actual model-generated segmentation
            with your BDFD9 ground-truth annotations.

            This first integration displays predicted
            bounding boxes and confirms mask responses.
            It does not yet calculate defect classification
            accuracy.
            """)

            with gr.Row():
                with gr.Column():
                    sam_image = gr.Image(
                        type="filepath",
                        label="Upload BDFD9 Fabric Image"
                    )

                    sam_prompt = gr.Textbox(
                        label="Segmentation Concept",
                        value="fabric defect",
                        placeholder="Example: fabric hole"
                    )

                    sam_button = gr.Button(
                        "Run Meta SAM 3.1",
                        variant="primary"
                    )

                with gr.Column():
                    sam_preview = gr.Image(
                        label="SAM Predicted Bounding Boxes"
                    )

                    sam_status = gr.Textbox(
                        label="Segmentation Status"
                    )

            sam_report = gr.JSON(
                label="SAM Segmentation Results"
            )

            sam_button.click(
                run_sam_inspection,
                inputs=[sam_image, sam_prompt],
                outputs=[
                    sam_preview,
                    sam_report,
                    sam_status
                ]
            )


        with gr.Tab("Overview"):
            gr.Markdown("## Factory Operations")

            with gr.Row():
                total_orders = gr.Number(
                    label="Orders", interactive=False
                )
                total_incidents = gr.Number(
                    label="Incidents", interactive=False
                )
                critical_orders = gr.Number(
                    label="Critical Orders", interactive=False
                )

            orders_df = gr.Dataframe(
                label="Production Orders",
                interactive=False
            )

            refresh = gr.Button(
                "Refresh Dashboard", variant="primary"
            )

            refresh.click(
                overview,
                outputs=[
                    total_orders, total_incidents,
                    critical_orders, orders_df
                ]
            )

        with gr.Tab("Fabric Inspector"):
            gr.Markdown("""
            ## BDFD9 Fabric Inspection

            Upload a fabric photograph and optionally
            its matching YOLO `.txt` annotation.

            Bounding boxes represent dataset annotations,
            **not AI predictions**.
            """)

            with gr.Row():
                with gr.Column():
                    image_input = gr.Image(
                        type="pil",
                        label="Fabric Image"
                    )

                    annotation_input = gr.File(
                        label="YOLO Annotation (optional)",
                        file_types=[".txt"],
                        type="filepath"
                    )

                    inspection_order = gr.Dropdown(
                        choices=order_ids,
                        value=order_ids[0],
                        label="Order ID"
                    )

                    defect_label = gr.Textbox(
                        value="Pending verification",
                        label="Inspector Notes / Defect Label"
                    )

                    inspect_btn = gr.Button(
                        "Inspect & Save",
                        variant="primary"
                    )

                with gr.Column():
                    annotated_image = gr.Image(
                        label="Annotated Image"
                    )

                    detection_json = gr.JSON(
                        label="Annotation Data"
                    )

                    inspection_status = gr.Textbox(
                        label="Inspection Status"
                    )

            inspect_btn.click(
                run_inspection,
                inputs=[
                    image_input, annotation_input,
                    inspection_order, defect_label
                ],
                outputs=[
                    annotated_image,
                    detection_json,
                    inspection_status
                ]
            )

        with gr.Tab("Production Risk"):
            gr.Markdown("## Production Deadline Analysis")

            risk_order = gr.Dropdown(
                choices=order_ids,
                value=order_ids[0],
                label="Select Order"
            )

            risk_btn = gr.Button(
                "Calculate Production Risk",
                variant="primary"
            )

            risk_report = gr.Markdown()
            risk_json = gr.JSON(label="Structured Risk Data")

            risk_btn.click(
                analyze_order,
                inputs=[risk_order],
                outputs=[risk_report, risk_json]
            )


        with gr.Tab("AI Investigation"):
            gr.Markdown("""
            ## StitchRescue — Agentic Investigation

            Powered by OpenAI Agents SDK and
            Meta Muse Wonder.

            The agent can search demo SOP documents,
            inspect incident records and calculate
            production risk.

            This initial version does not yet analyze
            image pixels or transcribe voice.
            """)

            investigation_order = gr.Dropdown(
                choices=order_ids,
                value=order_ids[0],
                label="Factory Order"
            )

            investigation_question = gr.Textbox(
                label="Supervisor Question",
                lines=4,
                value=(
                    "We have 2,000 rejected shirts "
                    "due to suspected oil stains. "
                    "Investigate ORD-1001, review "
                    "the factory SOP and calculate "
                    "the production risk."
                )
            )


            investigation_button = gr.Button(
                "Run AI Investigation",
                variant="primary"
            )

            investigation_report = gr.Markdown()

            investigation_button.click(
                fn=investigate,
                inputs=[
                    investigation_order,
                    investigation_question
                ],
                outputs=investigation_report
            )




        with gr.Tab("Incident Center"):
            gr.Markdown("## Quality Incident Management")

            with gr.Row():
                incident_order = gr.Dropdown(
                    choices=order_ids,
                    value=order_ids[0],
                    label="Order"
                )

                incident_defect = gr.Textbox(
                    label="Reported Defect",
                    value="Oil stain"
                )

                incident_quantity = gr.Number(
                    label="Affected Units",
                    value=2000,
                    precision=0
                )

            create_btn = gr.Button(
                "Create Quality Incident",
                variant="primary"
            )

            incident_status = gr.Textbox(
                label="Incident Result"
            )

            incidents_df = gr.Dataframe(
                label="Incident Register",
                interactive=False
            )

            create_btn.click(
                report_incident,
                inputs=[
                    incident_order,
                    incident_defect,
                    incident_quantity
                ],
                outputs=[
                    incident_status,
                    incidents_df
                ]
            )

    demo.load(
        overview,
        outputs=[
            total_orders, total_incidents,
            critical_orders, orders_df
        ]
    )

    demo.load(
        incident_table,
        outputs=[incidents_df]
    )

if __name__ == "__main__":
    demo.launch()
