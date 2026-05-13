# Internal Prompt — Image Asset Generation

> The agent uses this template internally during **Phase 2 — MANIFEST**. Generates a single PNG asset by invoking the `image-generation` skill.

## When to generate an image asset (vs. NOT)

Generate a PNG when the element is:
- Hero/illustrative artwork (splash screens, empty states, game thumbnails)
- Branded imagery (logos, mascots)
- Photographic content
- A glyph too complex for icon shapes (e.g. a TrueMoney brand mark)

DO NOT generate a PNG when the element is:
- A UI control (use Lucide icon)
- A geometric primitive (use Tailwind shapes)
- Text (use a `<span>` with a font class)

## Prompt construction

For every asset, the prompt MUST include:

1. **Design DNA recap** — first paragraph copies the Voice line from `design-dna.md` verbatim
2. **Concrete subject** — what to draw
3. **Style constraints** — palette references the locked tokens (use exact hex values)
4. **Composition rules** — center/edge/aspect/cropping notes
5. **Forbidden** — copy the relevant Forbidden bullets from `design-dna.md`

### Template

```
[VOICE]
<copy verbatim from design-dna.md::Voice>

[SUBJECT]
<one-paragraph description of what the image shows>

[STYLE]
- Palette: only these colors — bg #<bg.base>, surface #<bg.raised>, accent #<accent.primary>, text #<text.primary>
- No additional colors. No gradients. No photoreal textures unless explicitly required.
- Composition: <centered | edge-bleed | full-bleed | etc.>
- Aspect ratio: <1:1 | 9:16 | 16:9 | 4:3>
- Background: <fully bleeding bg.base | transparent PNG (alpha) | etc.>

[FORBIDDEN]
- No watermarks
- No text labels (unless this asset IS a wordmark)
- No platform UI chrome (status bars, dock, etc.)
- <copy other relevant bullets from design-dna.md::Forbidden>
```

## Invocation

The agent invokes `image-generation` via the shell scripts that ship with that skill:

```bash
# Single-shot, no refs
.sisyphus/bake-off/gen-image.sh \
  <prompt-file> \
  <output-png-path> \
  <aspect-ratio>

# With reference images attached
.sisyphus/bake-off/gen-image-with-refs.sh \
  <prompt-file> \
  <output-png-path> \
  <aspect-ratio> \
  <ref1.png> <ref2.png> ...
```

Aspect ratio options: `1:1`, `9:16`, `16:9`, `2:3`, `3:2`, `4:5`, `5:4`, `3:4`, `4:3`, `21:9`.

## Per-asset workflow

For each entry in `asset-manifest.json::images`:

1. Write the prompt to a temp file: `<output-dir>/<id>.prompt.txt`
2. Call `gen-image.sh` (or `gen-image-with-refs.sh` if `refs` is non-empty)
3. Verify the output PNG exists, is a valid PNG (`file <path>` shows `PNG image data`), and matches the requested aspect ratio
4. If verification fails → re-run with a tightened prompt (mention what went wrong)
5. Delete the temp prompt file ONLY after success

## Batch generation

When the manifest has many assets, generate in parallel where possible:

```bash
# Example: generate 9 game thumbnails in parallel (one curl per asset)
for entry in $(jq -c '.images[]' asset-manifest.json); do
  id=$(echo $entry | jq -r .id)
  path=$(echo $entry | jq -r .path)
  aspect=$(echo $entry | jq -r .aspect)
  prompt=$(echo $entry | jq -r .prompt)
  echo "$prompt" > "/tmp/$id.prompt.txt"
  ./gen-image.sh "/tmp/$id.prompt.txt" "$path" "$aspect" &
done
wait
```

CAUTION: parallel generation is rate-limited by OpenRouter. Default to sequential unless the manifest has 6+ small/cheap assets.

## Cost discipline

`gpt-5.4-image-2` is metered. Per asset cost is typically $0.10–$0.20 at default size.

- Budget per project: state it upfront. Default cap: 20 generated assets.
- If the manifest exceeds the cap, ask the user to prune before generating.
- Cache aggressively. If a manifest entry hasn't changed (same prompt, same refs), reuse the existing PNG instead of regenerating.
