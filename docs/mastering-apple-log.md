# Mastering Apple Log: The Essential LUT & Color Grading Guide

*A Practical Guide for Filmmakers Using iPhones and Log Footage*
*By Tobia Montanari — tobiamontanari.com*

---

## Introduction

Welcome to Mastering Apple Log: The Essential LUT & Color Grading Guide.

If you've ever opened your Apple Log footage and thought, "Why does this look so flat?", you're not alone. Log footage is incredibly powerful, but it also presents a challenge. It gives you the flexibility of professional color pipelines, right inside your iPhone or compact camera. But that flexibility comes with a learning curve.

This guide is here to flatten that curve.

Inside, you'll learn the 10 core techniques that professional colorists rely on to transform raw, log-recorded footage into polished, cinematic images.

You'll also discover how to:
- Use LUTs the smart way (including the Apple Log Filmic Looks Pack)
- Build clean, flexible node trees
- Balance, stylize and finish your grades with purpose
- Avoid the most common mistakes when working with log footage

This isn't about theory — it's about control. By the end, you won't just be applying looks. You'll be making decisions like a colorist.

---

## Contents

1. Contrast Is King
2. Balance Your Neutrals First
3. Match Exposure Before Matching Color
4. Log to Rec.709 the Right Way
5. Why LUTs Aren't Enough
6. Skin Tones Are Sacred
7. Use Color Contrast, Not Just Saturation
8. Shape Light with Power Windows
9. Roll Off Your Highlights Like Film
10. Let the Story Drive the Grade

---

## Chapter 1 — Contrast Is King

### Mastering Tonal Separation Before You Touch Color

If you only fix one thing in your footage... fix contrast. Seriously.

Contrast is the foundation of visual storytelling. It determines mood, shapes depth, and tells your viewer where to look. Yet so many beginner filmmakers jump straight into LUTs or stylized looks without locking in the most important part: tonal structure.

**You can't polish a muddy image. And muddy = poor contrast.**

### What Is Tonal Separation?

Tonal separation is the clear distribution of brightness across the image:

- **Shadows:** deep and anchored, not crushed
- **Midtones:** where most skin and subject detail lives
- **Highlights:** soft and roll off, not harsh or clipped

When you get the right relationship between these zones, the image pops. When they collapse into each other? Flat. Muddy. Amateur.

Apple Log footage captures a huge range of luminance — but it comes out looking dull and low-contrast until you sculpt it.

### How to Fix It: 3 Steps

**1. Use Contrast + Pivot**
In DaVinci Resolve, the "Contrast" and "Pivot" controls on the Primary Wheels are your best friends. Raise Contrast until the image feels structured. Adjust Pivot to shift the balance — do you want more weight in the shadows or brightness in the mids?

**2. Watch Your Scopes**
Use the Waveform scope:
- Shadows: ~0–20 IRE
- Mids: ~40–60 IRE (especially for skin tones)
- Highlights: ~80–100 IRE

You're aiming for a clean spread — not bunched-up values in the middle.

**3. Adjust with Curves (Optional)**
Use Custom Curves for more control. Add a subtle S-curve: pull down shadows, lift highlights (but don't go extreme). The more roll-off you add, the more "filmic" it feels.

### Pro Tips for Apple Log Users

- **Start in Log:** Don't convert to Rec.709 before you shape contrast.
- **Avoid Early Clipping:** Apple Log retains lots of highlight info — don't throw it away.
- **Use an ODT Last:** Apply your Color Space Transform or Technical LUT to convert to Rec.709 after your tonal shaping.

### Common Mistakes

- Using the wrong tools first — don't jump straight to LUTs before shaping contrast
- Crushing shadows — if the bottom of your waveform flatlines at 0, you're killing detail
- Thinking contrast = drama — it's about structure, not just punch

### Recap
- Tonal contrast builds the structure of your grade
- Apple Log gives you a wide range — but needs shaping
- Use Contrast + Pivot + Scopes to guide the process

---

## Chapter 2 — Balance Your Neutrals First

### The Art of White Balance and Channel Matching in Apple Log

If contrast is the backbone of your image, neutral balance is the skin. Without proper white balance, any LUT or look you apply will sit wrong.

**Fix this early. Or suffer later.**

### What Does "Neutral" Mean?

A neutral image has no unintended color cast. A white wall looks white. A grey shirt looks grey. Skin tones don't skew green or magenta.

Technically: on the RGB Parade scope, the Red, Green and Blue channels align when reading neutral content (like a grey card or a white object). If one channel is higher or lower — you have a color cast.

### Apply This in 3 Steps

**1. Find a Neutral Reference in the Frame**
Look for something grey or white: t-shirt, wall, paper. If there's nothing neutral, use your best judgment on skin tones.

**2. Use the RGB Parade Scope**
Open the Parade scope in Resolve. Adjust the Gain or Lift of each color channel manually to align them. For example, if Blue is too high, reduce Blue Gain slightly.

**3. Fine-Tune with White Balance Controls**
Use the White Balance Temp/Tint sliders in the Primaries panel. You can also do finer corrections using Log Wheels or Hue vs Sat.

### Pro Tips

- Save a "Neutralize" node early in your node tree. If you go off-track, you can always toggle it and compare.
- Once neutral, you can push color where you want it — now you're doing it with intent, not fighting bad input.
- As you grow more confident, explore DaVinci YRGB Color Managed workflows.

### Common Mistakes

- Ignoring neutral balance and applying a LUT right away — this bakes in your color cast
- Correcting the image by eye only — your eyes adapt to color; your scopes don't
- Overcorrecting and neutralizing intentional temperature shifts — balance first, then warm or cool later

### Recap
- White balance is non-negotiable
- Use the RGB Parade to align channels
- Apple Log footage needs manual balancing
- Fix this early to avoid pain later

---

## Chapter 3 — Match Exposure Before Matching Color

### The Fastest Way to Consistency Across Apple Log Shots

Color gets all the glory, but **exposure is what breaks continuity**.

If two shots have different exposure levels, your viewer will feel the mismatch instantly — even if the colors are perfect. That's why in professional color workflows, exposure matching comes first.

### Why It Matters So Much in Apple Log

Apple Log is incredibly flexible, but it hides a trap: its flat, low-contrast look can trick your eye into thinking two shots are matched when they're not. Slight changes in ISO or lighting can shift the exposure by a full stop, but you won't see it clearly until your CST or LUT is applied. By then? It's too late.

**The fix? Normalize exposure before applying transforms or looks.**

### Apply This in 3 Steps

**1. Identify Your Reference Shot**
Choose the "hero" shot — ideally well-lit, static, sharp and emotionally significant. You'll be matching all other shots to this anchor.

**2. Use Waveform and Skin Tone IRE Levels**
Find where skin sits (usually ~50–65 IRE in Rec.709 space) and match the other shot's brightness to those same levels.

**3. Adjust with Offset, Gain, Lift or Gamma**
- **Offset:** moves everything uniformly — best for global exposure shifts
- **Gain:** adjusts highlights
- **Lift:** adjusts shadows
- **Gamma:** non-linear, use carefully

### Common Mistakes

- Relying on your eyes in Log space — Apple Log is flat by design; use scopes
- Matching color before exposure
- Using LUTs as correction tools — LUTs are for styling, not fixing

### Recap
- Exposure mismatches are more distracting than color ones
- Always match brightness using scopes before you style
- Use Offset for global control, then fine-tune

---

## Chapter 4 — Log to Rec.709 the Right Way

### How to Convert Apple Log into Beautiful, Viewable Footage

**Log is a record format — not a display format.**

Your Apple Log image is flat, low in contrast and desaturated for a reason: it captures maximum dynamic range, not to look good on screen. To make footage look viewable, you need to convert to Rec.709 / Gamma 2.4.

### What Is a Color Space Transform (CST)?

A CST mathematically converts an image from one color space and gamma curve into another.

For Apple Log:
- **Input:** Color Space: Rec.2020 / Gamma: Apple Log
- **Output:** Color Space: Rec.709 / Gamma: Gamma 2.4 (or Rec.709-A for Apple devices)

### You Have Three Main Options

**1. Use a Color Managed Workflow**
Set your project to DaVinci YRGB Color Managed with Timeline Color Space: Rec.709. This automates the transform, saving time and ensuring consistent tone mapping.

**2. Use a Manual CST Node**
Add a Color Space Transform node: Input: Rec.2020 / Apple Log → Output: Rec.709 / Gamma 2.4. Create this node first, but **place it at the end of your node tree**. Adjust contrast, white balance and creative looks before it.

**3. Use a Trusted LUT as an ODT**
Apply a LUT specifically designed to convert Apple Log to Rec.709. Make sure the LUT matches your input. Avoid generic Rec.709 LUTs without prep — they can clip or skew your image.

### Common Mistakes

- Skipping CST/ODT and grading in Log — you'll end up fighting your footage
- Using a Rec.709 LUT on Log footage without matching input/output — this crushes shadows, clips highlights and skews colors

### Recap
- Always study what a LUT does before applying it
- Place your CST or ODT as the final node in your grade
- Make sure all corrections (exposure, contrast, balance, creative looks) come before it

---

## Chapter 5 — Why LUTs Aren't Enough

### Learn to Rebuild a Look and Take Back Control

**LUTs are blind. They don't care what your image looks like.**

They're fixed input-output maps. They don't adapt to exposure, white balance, contrast or dynamic range. If your input isn't perfect, your image falls apart.

**A LUT is a spice, not the whole recipe.**

### What Does a LUT Actually Do?

Most LUTs apply a combination of:
- Contrast curve
- Saturation boost or suppression
- Hue rotation (often teal/orange)
- Highlight roll-off

They're often designed for Rec.709, not Log. When you apply a LUT to Apple Log footage — unless it's specifically designed for Apple Log — you risk incorrect gamma, skewed colors, lost dynamic range and incorrect mapping.

### When LUTs Do Work

When built properly, LUTs can be powerful. LUTs created specifically for:
- Rec.2020 color space
- Apple Log gamma
- Skin tone integrity
- Highlight roll-off and filmic contrast curves

...these are not blindly applying a generic teal-orange Rec.709 filter. Use these as starting points — or better yet, study what each one does, then rebuild and customize them. That's where the learning happens.

### Apply This in 3 Steps

**1. Study the LUT's Behavior**
Apply the LUT and observe: How does it affect contrast? Does it shift hues in shadows, mids or highlights? What happens to skin tones? Use split-view to compare before/after.

**2. Rebuild It Node-by-Node**
Try to recreate the LUT effect in layers:
- Contrast Curve: Custom Curves or Contrast + Pivot
- Saturation: boost or suppress
- Hue vs Hue or Hue vs Sat: match stylized color shifts

**3. Save Your Look as a PowerGrade**
Once rebuilt, save it. This gives you full control and tweakability forever — unlike a fixed LUT. You now own the process, not the preset.

### Common Mistakes

- Relying on LUTs to do all the work — you end up tweaking sliders forever trying to fix what the LUT broke
- Not knowing the input the LUT expects — a Rec.709 input LUT on Apple Log footage will ruin your contrast and color
- Applying LUTs too early — always shape your image (exposure, white balance, contrast) before any creative LUT

### Recap
- LUTs are static maps, not smart adjustments
- Good LUTs from trusted sources can save time when applied to well-balanced footage
- Always study and rebuild for full creative control
- For Apple Log: **transform → balance → then apply the LUT**

---

## Chapter 6 — Skin Tones Are Sacred

### How to Read, Correct, and Protect Skin — Even in Stylized Looks

Skin tones are where your audience lives. They're the most emotionally recognizable part of the frame and the easiest to mess up. **If the skin looks weird, the whole image looks wrong.**

### What Makes Skin "Correct"?

On the vectorscope, properly balanced skin tones — regardless of ethnicity — typically fall along the line between red and yellow. What varies is luma (brightness), saturation and context, but hue direction remains consistent.

If your vectorscope shows skin tones veering toward green or magenta... that's a problem.

### Apply This in 3 Steps

**1. Isolate Skin in the Vectorscope**
Temporarily blur or mask out everything but the face. Open the Vectorscope and locate the skin blob. Is it sitting on the skin tone line?

**2. Use Hue vs Hue to Nudge It Back**
Open the Hue vs Hue curve. Select the hue range around the skin. Gently shift it until the vectorscope blob falls back on the line. Often a +/– 2 to 4° change is all that's needed.

**3. Adjust Luma vs Sat for Mood**
Use Luma vs Sat to prevent oversaturation in shadows/highlights. Use Contrast + Pivot to place skin tone in a flattering brightness range (typically ~55–65 IRE).

### Apple Log Skin Behavior

- Small white balance errors shift skin more dramatically than you'd expect
- In mixed lighting, iPhones can shift toward green or magenta unpredictably
- Before grading skin, fix exposure, contrast and white balance first

### Creative Look vs Realistic Skin

Even in stylized looks:
- Keep skin in motion picture range — not neon, not greyed out
- Use Windows to isolate skin and exclude it from certain color effects
- Want a warm grade? Try shifting highlights first, not midtones (where skin lives)
- **Style the world — protect the subject.**

### Recap
- Skin tones are emotionally critical
- Always check the vectorscope and aim for the skin tone line
- In Apple Log, small shifts cause big changes — fix early
- Stylize with care and isolate skin if needed

---

## Chapter 7 — Use Color Contrast, Not Just Saturation

### How Hue Separation Creates Mood, Depth and Style

Beginners reach for saturation. Professionals reach for **color contrast**.

Color contrast — the intentional use of opposing hues — creates energy, emotion and spatial separation between elements in your frame. It's how you guide the eye. It's how you make skin tones glow.

### What Is Color Contrast?

Color contrast happens when two colors from opposite sides of the color wheel interact in the same frame:
- Orange vs Blue (the classic "teal and orange")
- Green vs Magenta
- Cyan vs Red

This opposition creates visual tension and helps separate foreground from background. **It's not about more color: it's about separation of color.**

### Apply This in 3 Steps

**1. Choose a Hero Hue**
Pick a base color to preserve and support — often skin tones (orange/yellow) or wardrobe/set color. This is your "anchor" hue.

**2. Introduce Opposing Color Gently**
- Cool down shadows (teal, blue, cyan)
- Warm up highlights (amber, peach, light orange)
- Or reverse: warm shadows, cool highlights

**3. Check the Vectorscope Spread**
Look for hue separation, not just saturation spread. Two strong but opposing hue blobs = cinematic depth.

### Split Toning Examples

- Shadows: teal; highlights: warm orange = classic blockbuster look
- Shadows: magenta; mids: olive = moody, stylized fashion
- Desaturated mids, colored shadows = painterly, editorial

Subtle shifts work best — try only 3–5° hue rotations. No need to go neon.

### Workflow for Apple Log

1. Add an ODT to Rec.709 as your last node
2. Work in log to shape contrast and exposure
3. Shift hues for color contrast
4. Refine stylization (saturation, grain, halation, etc.)

### Recap
- Color contrast adds depth without oversaturation
- Push/pull shadows and highlights in opposing directions
- Color separation creates depth
- Subtle hue shifts > raw saturation boosts

---

## Chapter 8 — Shape Light with Power Windows

### Simulate Lighting, Guide the Eye, Add Depth to Your Apple Log Grades

Power Windows let you simulate light falloff, sculpt your subject and subtly control where the viewer looks. When working with flat, naturalistic Apple Log footage, **they're indispensable**.

### Why Power Windows Work

Humans are drawn to light. By using windows to shape exposure and add localized contrast, you can:
- Create subject-background separation
- Mimic real-world light falloff
- Enhance practical lighting
- Emphasize faces and eyes
- Add cinematic softness and mood

### Apply This in 3 Steps

**1. Add a Circular Window to the Face or Subject**
In the Window panel, select a soft circular window. Position it over the subject's face or focal point. Feather generously (50–100) for natural falloff.

**2. Gently Raise or Lower Exposure Inside/Outside**
- +0.2 for emphasis, –0.2 for subtle vignetting
- You can also adjust contrast or color temp (e.g. warmer for skin)

**3. Stack Multiple Windows for Layered Control**
Add a second window for background or environment. Use gradient windows to simulate sun direction or bounce.

### Suggested Window Uses

- **Face Circle:** Draws attention, lifts shadows under eyes
- **Gradient from Top:** Simulates sunlight or studio key
- **Gradient from Bottom:** Adds mystery
- **Side Soft Rectangle:** Window light, bounce, fill light
- **Inverted Vignette:** Brightens center subtly, darkens edges
- **Background Cooler Tint:** Separates subject by hue and warmth

### Common Mistakes

- Using vignettes as a crutch — a dark circle ≠ depth; use windows with direction
- Forgetting to track movement — if your subject moves and your window doesn't, the illusion breaks
- Overexposing inside windows — subtle is key

### Recap
- Power Windows simulate depth and lighting
- Use soft feathering and small exposure shifts
- Apple Log grades benefit massively from this added shape
- Track motion and layer multiple windows for realism

---

## Chapter 9 — Roll Off Your Highlights Like Film

### Preserve Detail, Add Glow, Avoid Harsh Digital Clipping

Here's a quick way to tell the difference between digital and film: look at the brightest parts of the image.

- **Film:** soft glow, gradual fade, organic roll-off
- **Bad digital:** harsh whites, flat spots, blown-out skies

### What Is Highlight Roll-Off?

Good roll-off:
- Keeps texture in bright areas
- Avoids hard clipping
- Looks smooth and natural
- Gives highlights a soft glow, not a hard edge

Bad roll-off:
- Skips the gradient
- Hard clips to 100 IRE
- Creates distracting flat zones or "video burn"

Think of it like a gentle slope instead of a sudden cliff.

### Apply This in 3 Steps

**1. Check Your Highlights on the Waveform**
Look for parts that approach or touch 100 IRE. If it suddenly flatlines at the top — that's hard clipping.

**2. Use the HDR Wheels or Custom Curves**
- HDR Wheels (Highlight / Specular / Global): lower slightly to bring down bright zones without affecting mids
- Custom Curves: add a soft "shoulder" in the top 10% of your luma curve

**3. Add Soft Glow or Halation (Optional)**
- Resolve's built-in Glow effect
- Film Halation
- Blur + Overlay trick on bright areas

### Apple Log–Specific Considerations

Apple Log captures a wide highlight range, but that detail can vanish if:
- You apply a LUT too early that clips highlights
- Your CST is set up wrong

Grade in log space first, then roll off, then apply an ODT. Apple Log is forgiving — but only if you treat it carefully.

### Common Mistakes

- Clipping too early with a LUT — apply contrast and roll-off before stylization
- Lifting whites instead of rolling them — if you're just pushing whites up, you're flattening, not enhancing
- Confusing glow with exposure — glow is an effect, not a brightness increase

### Recap
- Highlight roll-off softens bright transitions
- Avoid hard clipping above 95–100 IRE
- Use HDR wheels, curves and glow tools

---

## Chapter 10 — Let the Story Drive the Grade

### Why Intent > Aesthetics (and How to Grade with Purpose)

With all the tools, techniques and LUTs at your disposal, it's easy to fall into the trap of grading for the "wow" factor. **But the best grades aren't just beautiful... they're invisible.**

They serve the story, not the ego. Your grade should reflect what the scene is trying to say, not just how it looks.

### Ask the Right Questions Before You Start

Before touching the wheels or curves, ask:
- What's the emotional tone of this scene?
- What's the character's state of mind?
- What do I want the viewer to feel?
- How do light, shadow and color reinforce this?

### Common Story-to-Grade Matches

| Story Tone | Grade Approach |
|---|---|
| Romance / Nostalgia | Warm highlights, soft contrast, bloom, slight haze |
| Thriller / Tension | Desaturated mids, cooler shadows, harsh edges |
| Drama / Internal conflict | Muted palette, uneven lighting, intentional imbalance |
| Joy / Freedom | High contrast, vibrant mids, clean whites |
| Melancholy | Low saturation, low contrast, split tones |

### Apply This in 3 Steps

**1. Grade in Layers, Not Just Looks**
- **Technical layer:** Fix exposure, contrast, balance
- **Emotional layer:** Adjust mood, saturation, softness
- **Narrative layer:** Use windows, color separation to highlight story beats

**2. Use Windows to Emphasize Meaning**
- Lighten the subject as they "wake up" emotionally
- Desaturate surroundings to isolate them
- Shift hue subtly to mirror internal change

**3. Reference Storyboards, Music and Dialogue**
Pull cues from soundtrack tone, performance, narrative pacing and cinematography choices.

### Common Mistakes

- Grading everything the same — not every scene needs contrast and teal/orange
- Ignoring context — a dark look might be gorgeous, but does it make sense for the character?
- Forgetting rhythm — your grade should breathe with the edit

### Recap
- Great grading supports the story, not just the style
- Break your grade into layers: technical, emotional, narrative
- Let every choice answer: *how does this serve the story?*

---

## Final Note

You now have the tools to:
- Shape contrast with intention
- Balance exposure and color precisely
- Rebuild looks from scratch (or from LUTs)
- Sculpt light, tone skin, add mood, drive meaning
- Use Apple Log to its full narrative and technical potential

These aren't just color grading tricks — they're tools for creative freedom. The more you practice, the more second nature they'll become.

*— Tobia Montanari, tobiamontanari.com*
