# OVERSHOOT remote inference service

The site's `/api/agent` endpoint and its data tools run on OVERSHOOT's hosted Worker. This directory describes the separate, continuously running open-weight model service. The model has **not** been deployed by adding these files: a GPU host, its public DNS name and a private API key are required.

The reference model is [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B), licensed Apache-2.0. The server is [vLLM's OpenAI-compatible API](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/), served by its [official container](https://docs.vllm.ai/en/latest/deployment/docker/). A persistent GPU host avoids scaling to zero; the public-facing OVERSHOOT Worker never exposes the model's API key to a browser. Choose a GPU with sufficient VRAM for the weights and selected 8,192-token context, and validate actual capacity before public rollout.

On a GPU VM with Docker Compose and the NVIDIA container runtime:

1. Point a DNS A/AAAA record for a dedicated model hostname at the VM and allow inbound TCP 80/443. Limit administrative access separately.
2. Place `compose.yaml` and `Caddyfile` together in a private deployment directory. Create a local `.env` there with `MODEL_DOMAIN=<model hostname>` and a long random `MODEL_API_KEY=<secret>`; never commit it. Launch `docker compose up -d` and check `docker compose logs model` until the model loads.
3. Verify `curl -H "Authorization: Bearer <secret>" https://<model hostname>/v1/models` returns `Qwen/Qwen3-8B`. Verify that requests without a key fail. The proxy exposes only `/v1/*`; vLLM's API key protects these routes, not arbitrary service endpoints.
4. Store `OVERSHOOT_MODEL_URL=https://<model hostname>/v1/chat/completions`, `OVERSHOOT_MODEL_ID=Qwen/Qwen3-8B` and secret `OVERSHOOT_MODEL_KEY=<same secret>` in the Site's production runtime configuration; redeploy OVERSHOOT to apply the values.
5. Query `/api/agent` for `available:true`, then ask a question on `/data`. Inspect its linked source JSON. Set request limits at the edge before broad public rollout; the Worker already caps prompt size, response tokens, dataset result size and model call time, but these alone do not impose a per-user quota.

The assistant chooses one validated, read-only Material World query, sends a bounded source excerpt to the model, and returns a link to the exact JSON response. It does not operate an autonomous web crawler, geocoder, live data feed or verified end-to-end shipment tracker. If the model host is offline, the existing website, `/api/material-world` and `/mcp` continue to serve the retained data.
