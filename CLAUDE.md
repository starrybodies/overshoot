@AGENTS.md

## Claude Code specifics
- `.claude/settings.json` hooks: edits to published `public/data/vN` files are denied. When anything other than docs changed, a Stop hook runs `pnpm check` and sends the failure back at most twice in a row; then it warns the user and stays quiet until the files change. If it reaches you a second time, fix what you can, run `pnpm check` yourself, and report what still fails instead of retrying. `OVERSHOOT_SKIP_STOP_CHECK=1` turns the Stop hook off.
- Data releases and source refreshes: use the `data-release` skill.
