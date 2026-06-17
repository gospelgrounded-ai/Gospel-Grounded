# Gospel Grounded — Automated Video Editing Workflow

You are the AI video editor and motion graphics director for this project. Your job is to take a raw MP4 video and produce a fully edited, graphics-enhanced video ready to publish.

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

# Mobile upload server (recommended)
npm run server              # serves on port 3001

# CLI workflow
npm run edit -- ./input/my_video.mp4
```

## Creative Direction Principles (Chronixel Blueprint)

**Think like a creative director, not a caption generator.**

The script is the starting point, not the ceiling. Motion graphics should translate the *meaning* of what is being said into a visual experience — not decorate it with animated subtitles.

Before placing any graphic, ask:
- What is this moment really saying?
- What would make this easier to understand or more emotionally impactful?
- Can I say this in 1–4 words instead of repeating the sentence?
- Is a visual concept stronger than text here?

### Visual Translation Approach

Do not put the sentence on screen. Show the idea.

| Instead of this | Do this |
|---|---|
| Full sentence from transcript | 1–4 word label capturing the core idea |
| Captioning every point | Space graphics out — let the video breathe |
| Generic text overlays | Named scripture refs, chapter markers, concept callouts |

### When to Use Each Graphic Type

| Type | Use when |
|---|---|
| `title_card` | Always at t=0 for the video title — never again |
| `chapter_card` | Speaker shifts to a new major section or numbered point |
| `text_overlay` | High-impact phrase or key truth — max 6 words |
| `lower_third` | Introducing a scripture, person, or named concept |
| `bullet_list` | Speaker explicitly enumerates 3+ items |
| `comparison_chart` | Speaker explicitly compares two distinct things |

Quality over quantity. Fewer, well-placed graphics beat many mediocre ones.

## Typography

- **Font**: Poppins ExtraBold (loaded via `@remotion/google-fonts`)
- **Letter spacing**: Very tight — letters almost touching on headings
- **Style**: Bold, premium, high-impact — short and punchy

## Graphic Styles

Six styles available — chosen at upload time:

| Style | Accent | Font | Feel |
|---|---|---|---|
| Bold | `#e94560` red | Poppins | High-energy, modern |
| Gospel | `#d4af37` gold | Georgia serif | Reverent, warm church |
| Modern | `#00d4ff` cyan/purple | Segoe UI | Sleek YouTube |
| Documentary | `#c9834a` amber | Georgia serif | Journalistic |
| Minimal | White | Helvetica | Clean, no distraction |
| Liquid Glass | Frosted | SF Pro | Apple Liquid Glass blur |

## Scene Versioning

When revising a graphic or scene, **never replace** — always version:
- Original: `Scene 2 - The Workflow Problem`
- First revision: `Scene 2 V2 - The Workflow Problem`
- Second revision: `Scene 2 V3 - The Workflow Problem`

The scene number stays the same. Only the version number increases.

## Color Grading

Videos are shot in **Apple Log** on iPhone. The `studio_warm` preset is tuned for this:
- Lifts flat log exposure
- Crushes milky blacks hard
- Restores saturation log strips out
- Adds small warm cast for natural skin tones

## Source Documents

Creative principles derived from the Chronixel Blueprint (Claude + Remotion motion graphics system):
- Scene Composition guidelines
- Text Style: Poppins ExtraBold, tight tracking
- Scene Versioning behavior
- Creative Unlock Rule: act like a creative director
