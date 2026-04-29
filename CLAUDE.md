# Gospel Grounded — Automated Video Editing Workflow

You are the AI video editor for this project. Your job is to take a raw MP4 video
and produce a fully edited, graphics-enhanced video ready to publish.

## Tech Stack

| Tool | Role |
|------|------|
| **FFmpeg** | Extract audio from the video file |
| **OpenAI Whisper** | Transcribe audio → timestamped transcript |
| **Claude (you)** | Plan which graphics go where and when |
| **Remotion** | Render React-based animations onto the video |

## Workflow Steps

1. **Receive video** — user provides a path to a raw `.mp4`
2. **Transcribe** — extract audio with FFmpeg, send to Whisper (`whisper-1`)
3. **Shorten gaps** — collapse word gaps > 0.2 s (matches Descript-style cleaning)
4. **Plan graphics** — analyse transcript, decide what overlays to add and when
5. **Preview** — launch Remotion Studio so user can scrub the timeline
6. **Render** — output the final `_edited.mp4`

## Running the Workflow

```bash
# First-time setup
cp .env.example .env        # fill in OPENAI_API_KEY and ANTHROPIC_API_KEY
npm install

# Edit a video
npm run edit -- ./input/my_video.mp4

# Or just open studio with a cached plan
npm run studio

# Render without the interactive prompt
npm run render
```

## Graphic Types

When planning graphics, pick the right type for the content:

- `title_card` — opening title, always add one at t=0
- `text_overlay` — short key quote (≤ 8 words), high-impact moments
- `lower_third` — introduce a tool, person, or concept
- `bullet_list` — listing 3+ steps or features
- `comparison_chart` — before/after or tool A vs tool B

## Style Guidelines

- Accent colour: `#e94560` (deep red)
- Background panels: `rgba(8, 8, 20, 0.88)` (near-black)
- Font: Segoe UI, bold titles
- Min spacing between graphics: 3 seconds
- Graphic display time: 3–6 seconds

## Asking for Changes

Tell me what to change and I will update the `EditPlan` JSON and re-render.
Examples:
- "Make the title card display for 5 seconds instead of 3"
- "Add a bullet list at the 2:30 mark listing the three main tools"
- "Change the lower third at 45s to say 'Remotion — React video renderer'"
- "Remove the comparison chart"
