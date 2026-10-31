@AGENTS.md

## Claude Code specifics
- `.claude/settings.json` hooks: edits to published `public/data/vN` files are denied. When code or data changed, a Stop hook runs `pnpm check` and sends the failure back, at most twice per session; after that, report the failing check instead of retrying. `OVERSHOOT_SKIP_STOP_CHECK=1` turns the Stop hook off.
- Data releases and source refreshes: use the `data-release` skill.
