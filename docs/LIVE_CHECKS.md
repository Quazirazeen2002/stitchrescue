# Bounded live connector checks

Run on 31 October 2026 using the installation's existing server-side Meta configuration. No API key or provider error body was printed.

- Muse Wonder through the existing Meta model adapter and OpenAI Agents SDK: one short connectivity request completed with nonempty output.
- SAM 3.1 through the existing response-stream parser: one request on the explicitly simulated test fabric image completed with **zero boxes and zero masks**.

This verifies that the configured provider accepted these requests and that the connector/parser path returned a completed result. It does not establish useful defect recognition, positive-mask rendering quality or accuracy on real factory images. Positive SAM mask evaluation and factory-specific model validation remain required.

The raw automated business/API tests use mocks for provider responses. The browser workflow disables live inference and uses a temporary database. No live request was used to approve a plan or change fabric status.

To repeat the bounded checks intentionally:

```bash
# From stitchrescue with its virtual environment active
python scripts/check_live_models.py
```

The script sends one short reasoning request and one simulated-image segmentation request. External inference may use provider quota.
