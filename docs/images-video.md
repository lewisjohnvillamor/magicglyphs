# Animated images and video

Some places cannot run code: email, slide decks, Canva, Notion, chat emoji and social posts. For those, export a finished animation. Video formats carry the icon's sound.

| Format | Best for | Transparency | Sound |
| --- | --- | --- | --- |
| GIF | Email, Notion, Google Slides, Canva, anywhere | One-bit (soft edges blend into a colour you choose) | No |
| Animated PNG | Slack and Discord emoji, Keynote, browsers | Full | No |
| MP4 | PowerPoint, Keynote, social posts, Canva | No (uses a background colour) | Yes |
| WebM | Web pages, Discord, OBS overlays | Full | Yes |

## From the icon maker

Open the [icon maker](https://magicglyphs.com/maker/), pick a library icon or bring your own, then choose a colour, a background (or transparent) and a size under **Animated image or video**. Everything is drawn in your browser.

## From the command line

```bash
npx magic-glyphs add rocket --format gif --color "#7c3aed"
npx magic-glyphs add bell heart --format apng --size 128          # Slack and Discord emoji
npx magic-glyphs add send --format mp4 --size 1080 --background "#0f0f12" --color "#ffffff"
npx magic-glyphs add star --format webm                           # transparent video with sound
```

| Option | What it does |
| --- | --- |
| `--size <px>` | Width and height. Defaults: GIF 256, APNG 128, MP4 and WebM 512 |
| `--color`, `--secondary`, `--style` | As for every other format (glass needs a background in GIF) |
| `--background <hex>` | Solid background. Without it GIF, APNG and WebM are transparent |
| `--matte <hex>` | GIF without a background: the colour soft edges blend into (default white) |
| `--loop <n>` | GIF and APNG: plays (default 0, forever) |
| `--hold <s>` | Seconds to hold the final pose (default 0.6) |
| `--no-sound` | MP4 and WebM without sound |

GIF and animated PNG need nothing extra. MP4 and WebM use [ffmpeg](https://ffmpeg.org) if it is installed (`winget install ffmpeg`, `brew install ffmpeg`, `apt install ffmpeg`); otherwise make them in the icon maker.

## Tips

- **Slack emoji:** APNG at 128 px, under 128 KB. Short motions (bell, heart, star) fit easily.
- **Email:** GIF with a background matching the email, so the edges are clean. Some Outlook versions show only the first frame; that frame is the icon at rest, so it still reads.
- **PowerPoint and Keynote:** MP4 with the slide's background colour, set to play automatically.
- **Canva:** upload the GIF, or the MP4 if you want the sound.
