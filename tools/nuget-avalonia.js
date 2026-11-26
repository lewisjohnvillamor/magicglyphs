#!/usr/bin/env node
// Builds the Avalonia NuGet package source (MagicGlyphs.Avalonia) into dist/nuget/MagicGlyphs.Avalonia.
// One MagicGlyph control reads the 120 free icons from an embedded data file: their vector paths, the paint for each
// style, and their spring motion pre-computed as one 2D matrix per layer per frame. Sounds are embedded WAV files.
//   node tools/nuget-avalonia.js
const fs = require('fs'), path = require('path');
const L = require('../lib.js'), B = require('./baked.js'), A = require('./audio.js'), Lic = require('../licence.js');
const root = path.join(__dirname, '..'), out = path.join(root, 'dist', 'nuget', 'MagicGlyphs.Avalonia');
const version = require('../package.json').version, FPS = 30, STYLES = ['outline', 'solid', 'duotone'];
const r4 = (v) => Math.round(v * 10000) / 10000;

(async () => {
  fs.rmSync(out, { recursive: true, force: true });
  for (const d of ['src/Sounds', 'tests']) fs.mkdirSync(path.join(out, d), { recursive: true });
  const free = L.index.map((x) => x.name || x.n).filter((n) => Lic.isFree(n) && L.byName.has(n));
  if (free.length !== 120) throw new Error('expected the 120 free icons, found ' + free.length);
  const icons = {}, sounds = new Set();
  for (const n of free) {
    const ic = L.byName.get(n), bs = STYLES.map((s) => B.bake(L.MG, ic, { style: s, fps: FPS }));
    icons[n] = {
      c: ic.c, s: ic.s || null, f: bs[0].frames,
      L: bs[0].layers.map((l, i) => {
        const ident = !l.m || l.m.every((m) => m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1 && m[4] === 0 && m[5] === 0);
        return {
          p: l.paths.map((p) => [p.d, p.r || null, p.fill || null]),
          m: ident ? null : l.m.flat().map(r4),
          st: Object.fromEntries(STYLES.map((s, k) => [s, bs[k].layers[i].paint])),
        };
      }),
    };
    if (ic.s) sounds.add(ic.s);
  }
  fs.writeFileSync(path.join(out, 'src', 'glyphs.json'), JSON.stringify({ fps: FPS, icons }));
  for (const s of sounds) fs.writeFileSync(path.join(out, 'src', 'Sounds', s + '.wav'), Buffer.from(L.MG.sound.wav(await L.MG.sound.render(s, { delay: 0, pan: 0 }, A.OfflineContext))));
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(out, 'LICENSE'));
  fs.copyFileSync(path.join(root, '..', 'web', 'public', 'apple-touch-icon.png'), path.join(out, 'src', 'icon.png'));

  fs.writeFileSync(path.join(out, 'src', 'MagicGlyphs.Avalonia.csproj'), `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <LangVersion>latest</LangVersion>
    <RootNamespace>MagicGlyphs</RootNamespace>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <PackageId>MagicGlyphs.Avalonia</PackageId>
    <Version>${version}</Version>
    <Authors>Lewis John Villamor</Authors>
    <Description>Animated icons with sound for Avalonia: 120 free Magic Glyphs icons with spring motion in outline, solid and duotone, each with its own short sound. One control, no other dependencies.</Description>
    <PackageTags>avalonia;icons;animated-icons;animation;svg;sound;ui</PackageTags>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
    <PackageProjectUrl>https://magicglyphs.com/docs/avalonia/</PackageProjectUrl>
    <RepositoryUrl>https://github.com/lewisjohnvillamor/magicglyphs</RepositoryUrl>
    <RepositoryType>git</RepositoryType>
    <PackageIcon>icon.png</PackageIcon>
    <PackageReadmeFile>README.md</PackageReadmeFile>
    <Copyright>Copyright (c) 2026 Lewis John Villamor</Copyright>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Avalonia" Version="11.0.0" />
  </ItemGroup>
  <ItemGroup>
    <EmbeddedResource Include="glyphs.json" LogicalName="MagicGlyphs.glyphs.json" />
    <EmbeddedResource Include="Sounds\\*.wav" LogicalName="MagicGlyphs.Sounds.%(Filename).wav" />
    <None Include="icon.png" Pack="true" PackagePath="\\" />
    <None Include="..\\README.md" Pack="true" PackagePath="\\" />
    <None Include="..\\LICENSE" Pack="true" PackagePath="\\" />
  </ItemGroup>
</Project>
`);

  fs.writeFileSync(path.join(out, 'src', 'MagicGlyph.cs'), `using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Documents;
using Avalonia.Input;
using Avalonia.Media;
using Avalonia.Threading;

namespace MagicGlyphs;

/// <summary>The drawing style of an icon.</summary>
public enum GlyphVariant
{
    /// <summary>Lines.</summary>
    Outline,
    /// <summary>Filled shapes, with inner details cut out.</summary>
    Solid,
    /// <summary>Lines with a light tinted fill behind them.</summary>
    Duotone,
}

/// <summary>What makes an icon play its animation.</summary>
public enum GlyphTrigger
{
    /// <summary>When the pointer moves over it, or when it is clicked or tapped.</summary>
    Hover,
    /// <summary>When it is clicked or tapped.</summary>
    Click,
    /// <summary>Once, when it first appears.</summary>
    Load,
    /// <summary>Only when <see cref="MagicGlyph.Play"/> is called.</summary>
    Manual,
}

/// <summary>An animated Magic Glyphs icon. It springs into motion and can play its own short sound.</summary>
/// <example><code>&lt;mg:MagicGlyph Icon="heart" Size="32" Foreground="#E11D48" Sound="True" /&gt;</code></example>
public class MagicGlyph : Control
{
    /// <summary>The icon name, for example "heart". See <see cref="Glyphs.Names"/>.</summary>
    public static readonly StyledProperty<string> IconProperty = AvaloniaProperty.Register<MagicGlyph, string>(nameof(Icon), "heart");
    /// <summary>Outline, solid or duotone.</summary>
    public static readonly StyledProperty<GlyphVariant> VariantProperty = AvaloniaProperty.Register<MagicGlyph, GlyphVariant>(nameof(Variant));
    /// <summary>Width and height in device-independent pixels.</summary>
    public static readonly StyledProperty<double> SizeProperty = AvaloniaProperty.Register<MagicGlyph, double>(nameof(Size), 24);
    /// <summary>The icon colour. Inherited from the surrounding text colour, like text.</summary>
    public static readonly StyledProperty<IBrush?> ForegroundProperty = TextElement.ForegroundProperty.AddOwner<MagicGlyph>();
    /// <summary>The duotone fill colour. Defaults to <see cref="Foreground"/>.</summary>
    public static readonly StyledProperty<IBrush?> SecondaryProperty = AvaloniaProperty.Register<MagicGlyph, IBrush?>(nameof(Secondary));
    /// <summary>The colour behind the icon. The solid style draws its inner details in it. Defaults to white.</summary>
    public static readonly StyledProperty<IBrush?> BackdropProperty = AvaloniaProperty.Register<MagicGlyph, IBrush?>(nameof(Backdrop));
    /// <summary>What makes the icon play.</summary>
    public static readonly StyledProperty<GlyphTrigger> TriggerProperty = AvaloniaProperty.Register<MagicGlyph, GlyphTrigger>(nameof(Trigger));
    /// <summary>Play the icon's sound with its animation.</summary>
    public static readonly StyledProperty<bool> SoundProperty = AvaloniaProperty.Register<MagicGlyph, bool>(nameof(Sound));

    /// <inheritdoc cref="IconProperty"/>
    public string Icon { get => GetValue(IconProperty); set => SetValue(IconProperty, value); }
    /// <inheritdoc cref="VariantProperty"/>
    public GlyphVariant Variant { get => GetValue(VariantProperty); set => SetValue(VariantProperty, value); }
    /// <inheritdoc cref="SizeProperty"/>
    public double Size { get => GetValue(SizeProperty); set => SetValue(SizeProperty, value); }
    /// <inheritdoc cref="ForegroundProperty"/>
    public IBrush? Foreground { get => GetValue(ForegroundProperty); set => SetValue(ForegroundProperty, value); }
    /// <inheritdoc cref="SecondaryProperty"/>
    public IBrush? Secondary { get => GetValue(SecondaryProperty); set => SetValue(SecondaryProperty, value); }
    /// <inheritdoc cref="BackdropProperty"/>
    public IBrush? Backdrop { get => GetValue(BackdropProperty); set => SetValue(BackdropProperty, value); }
    /// <inheritdoc cref="TriggerProperty"/>
    public GlyphTrigger Trigger { get => GetValue(TriggerProperty); set => SetValue(TriggerProperty, value); }
    /// <inheritdoc cref="SoundProperty"/>
    public bool Sound { get => GetValue(SoundProperty); set => SetValue(SoundProperty, value); }

    /// <summary>Raised each time the icon plays, with the name of its sound (or null). Use it to play the sound with your own audio library.</summary>
    public event EventHandler<GlyphPlayedEventArgs>? Played;

    private readonly Stopwatch _clock = new();
    private DispatcherTimer? _timer;
    private double _frame = double.MaxValue;

    static MagicGlyph()
    {
        AffectsRender<MagicGlyph>(IconProperty, VariantProperty, ForegroundProperty, SecondaryProperty, BackdropProperty);
        AffectsMeasure<MagicGlyph>(SizeProperty);
    }

    /// <summary>Creates an icon. Set <see cref="Icon"/> to choose which one.</summary>
    public MagicGlyph()
    {
        PointerEntered += (_, _) => { if (Trigger == GlyphTrigger.Hover) Play(); };
        PointerPressed += (_, _) => { if (Trigger is GlyphTrigger.Hover or GlyphTrigger.Click) Play(); };
        AttachedToVisualTree += (_, _) => { if (Trigger == GlyphTrigger.Load) Dispatcher.UIThread.Post(Play, DispatcherPriority.Background); };
        DetachedFromVisualTree += (_, _) => _timer?.Stop();
    }

    /// <summary>Plays the animation, and the sound when <see cref="Sound"/> is on.</summary>
    public void Play()
    {
        var g = Glyphs.Get(Icon);
        if (g == null) return;
        _clock.Restart();
        _frame = 0;
        _timer ??= new DispatcherTimer(TimeSpan.FromMilliseconds(15), DispatcherPriority.Render, (_, _) => Tick());
        _timer.Start();
        if (Sound && g.Sound != null && Glyphs.SoundEnabled) SoundPlayback.Play(g.Sound);
        Played?.Invoke(this, new GlyphPlayedEventArgs(Icon, g.Sound));
        InvalidateVisual();
    }

    /// <summary>True while the animation is running.</summary>
    public bool IsPlaying => _timer?.IsEnabled == true;

    /// <summary>Shows the icon as it is <paramref name="seconds"/> into its motion, without playing it. Useful for previews and tests.</summary>
    public void Seek(double seconds) { _timer?.Stop(); _frame = Math.Max(0, seconds) * Glyphs.Fps; InvalidateVisual(); }

    private void Tick()
    {
        var g = Glyphs.Get(Icon);
        _frame = _clock.Elapsed.TotalSeconds * Glyphs.Fps;
        if (g == null || _frame >= g.Frames - 1) { _frame = double.MaxValue; _timer?.Stop(); }
        InvalidateVisual();
    }

    /// <inheritdoc/>
    protected override Size MeasureOverride(Size availableSize) => new(Size, Size);

    /// <inheritdoc/>
    public override void Render(DrawingContext context)
    {
        var g = Glyphs.Get(Icon);
        if (g == null) return;
        IBrush fg = Foreground ?? Brushes.Black, sec = Secondary ?? fg, bg = Backdrop ?? Brushes.White;
        var scale = Math.Min(Bounds.Width, Bounds.Height) / 24.0;
        if (scale <= 0) return;
        var t = Math.Min(_frame, g.Frames - 1);
        int k = (int)t, j = Math.Min(k + 1, g.Frames - 1);
        double f = t - k;
        var style = Variant switch { GlyphVariant.Solid => 1, GlyphVariant.Duotone => 2, _ => 0 };
        using (context.PushTransform(Matrix.CreateScale(scale, scale)))
        {
            foreach (var layer in g.Layers)
            {
                var m = Matrix.Identity;
                if (layer.Motion is { } a)
                {
                    double V(int n) => a[k * 6 + n] + (a[j * 6 + n] - a[k * 6 + n]) * f;
                    m = new Matrix(V(0), V(1), V(2), V(3), V(4), V(5));
                }
                var paint = layer.Paint[style];
                IBrush? Pick(string? role, double opacity)
                {
                    IBrush? b = role switch { "fg" => fg, "sec" => sec, "bg" => bg, _ => null };
                    if (b == null || opacity >= 1) return b;
                    return b is ISolidColorBrush s ? new SolidColorBrush(s.Color, opacity * s.Opacity) : b;
                }
                var fill = Pick(paint.Fill, paint.FillOpacity);
                var strokeBrush = Pick(paint.Stroke, 1);
                var pen = strokeBrush == null ? null : new Pen(strokeBrush, 1.75, lineCap: PenLineCap.Round, lineJoin: PenLineJoin.Round);
                using (context.PushTransform(m))
                {
                    foreach (var p in layer.Paths)
                    {
                        var pf = p.Fill != null ? Brush.Parse(p.Fill) : fill;
                        if (p.Turn is { } r)
                            using (context.PushTransform(r)) context.DrawGeometry(pf, pen, p.Geometry);
                        else context.DrawGeometry(pf, pen, p.Geometry);
                    }
                }
            }
        }
    }
}

/// <summary>Details of one play of an icon.</summary>
public sealed class GlyphPlayedEventArgs : EventArgs
{
    internal GlyphPlayedEventArgs(string icon, string? sound) { Icon = icon; SoundName = sound; }
    /// <summary>The icon that played.</summary>
    public string Icon { get; }
    /// <summary>The name of its sound, or null if it has none. <see cref="Glyphs.OpenSound"/> gives you the WAV data.</summary>
    public string? SoundName { get; }
}
`);

  fs.writeFileSync(path.join(out, 'src', 'Glyphs.cs'), `using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.Json;
using Avalonia;
using Avalonia.Media;

namespace MagicGlyphs;

/// <summary>Lists the icons in this package and gives access to their sounds.</summary>
public static class Glyphs
{
    private static readonly Lazy<Dictionary<string, GlyphData>> All = new(Load);
    internal static double Fps { get; private set; } = 30;

    /// <summary>Every icon name, sorted.</summary>
    public static IReadOnlyList<string> Names => All.Value.Keys.OrderBy(n => n, StringComparer.Ordinal).ToList();

    /// <summary>The category of an icon, such as "ui", or null if there is no icon with that name.</summary>
    public static string? Category(string name) => Get(name)?.Category;

    /// <summary>The name of an icon's sound, or null.</summary>
    public static string? SoundOf(string name) => Get(name)?.Sound;

    /// <summary>Whether icons play their sounds at all. Set it to false for a global mute switch.</summary>
    public static bool SoundEnabled { get; set; } = true;

    /// <summary>Opens a sound as a WAV stream, to play with your own audio library. Null if there is no such sound.</summary>
    public static Stream? OpenSound(string soundName) =>
        typeof(Glyphs).Assembly.GetManifestResourceStream("MagicGlyphs.Sounds." + soundName + ".wav");

    internal static GlyphData? Get(string? name) => name != null && All.Value.TryGetValue(name, out var g) ? g : null;

    private static Dictionary<string, GlyphData> Load()
    {
        using var s = typeof(Glyphs).Assembly.GetManifestResourceStream("MagicGlyphs.glyphs.json")
            ?? throw new InvalidOperationException("Magic Glyphs icon data is missing from the assembly.");
        using var doc = JsonDocument.Parse(s);
        Fps = doc.RootElement.GetProperty("fps").GetDouble();
        var map = new Dictionary<string, GlyphData>(StringComparer.Ordinal);
        foreach (var ic in doc.RootElement.GetProperty("icons").EnumerateObject())
        {
            var v = ic.Value;
            var layers = v.GetProperty("L").EnumerateArray().Select(l =>
            {
                var paths = l.GetProperty("p").EnumerateArray().Select(p =>
                {
                    var a = p.EnumerateArray().ToArray();
                    Matrix? turn = null;
                    if (a[1].ValueKind == JsonValueKind.Array)
                    {
                        var r = a[1].EnumerateArray().Select(x => x.GetDouble()).ToArray();
                        var rad = r[0] * Math.PI / 180;
                        turn = Matrix.CreateTranslation(-r[1], -r[2]) * Matrix.CreateRotation(rad) * Matrix.CreateTranslation(r[1], r[2]);
                    }
                    return new GlyphPath(a[0].GetString()!, turn, a[2].ValueKind == JsonValueKind.String ? a[2].GetString() : null);
                }).ToArray();
                double[]? motion = l.GetProperty("m").ValueKind == JsonValueKind.Array ? l.GetProperty("m").EnumerateArray().Select(x => x.GetDouble()).ToArray() : null;
                var st = l.GetProperty("st");
                var paint = new[] { "outline", "solid", "duotone" }.Select(n =>
                {
                    var o = st.GetProperty(n);
                    string? Str(string key) => o.TryGetProperty(key, out var e) && e.ValueKind == JsonValueKind.String ? e.GetString() : null;
                    double op = o.TryGetProperty("fillOpacity", out var fo) && fo.ValueKind == JsonValueKind.Number ? fo.GetDouble() : 1;
                    return new GlyphPaint(Str("fill"), Str("stroke"), op);
                }).ToArray();
                return new GlyphLayer(paths, motion, paint);
            }).ToArray();
            var sound = v.GetProperty("s");
            map[ic.Name] = new GlyphData(v.GetProperty("c").GetString() ?? "", sound.ValueKind == JsonValueKind.String ? sound.GetString() : null, v.GetProperty("f").GetInt32(), layers);
        }
        return map;
    }
}

internal sealed record GlyphData(string Category, string? Sound, int Frames, GlyphLayer[] Layers);
internal sealed record GlyphLayer(GlyphPath[] Paths, double[]? Motion, GlyphPaint[] Paint);
// geometry is parsed on first draw, so listing icons works before Avalonia's renderer is set up
internal sealed record GlyphPath(string Data, Matrix? Turn, string? Fill)
{
    private Geometry? _geometry;
    public Geometry Geometry => _geometry ??= Geometry.Parse(Data);
}
internal sealed record GlyphPaint(string? Fill, string? Stroke, double FillOpacity);
`);

  fs.writeFileSync(path.join(out, 'src', 'SoundPlayback.cs'), `using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;

namespace MagicGlyphs;

/// <summary>
/// Plays the icon sounds without extra packages: the system sound API on Windows, afplay on macOS, and paplay, pw-play
/// or aplay on Linux. If none is available it stays silent; use <see cref="MagicGlyph.Played"/> to play sounds yourself.
/// </summary>
internal static class SoundPlayback
{
    private static readonly ConcurrentDictionary<string, string> Files = new();

    [DllImport("winmm.dll", CharSet = CharSet.Unicode)]
    private static extern bool PlaySound(string? sound, IntPtr module, uint flags);
    private const uint SND_ASYNC = 0x0001, SND_NODEFAULT = 0x0002, SND_FILENAME = 0x20000;

    internal static void Play(string name)
    {
        try
        {
            var file = Files.GetOrAdd(name, n =>
            {
                using var s = Glyphs.OpenSound(n) ?? throw new FileNotFoundException(n);
                var p = Path.Combine(Path.GetTempPath(), "magic-glyphs-" + n + ".wav");
                using (var f = File.Create(p)) s.CopyTo(f);
                return p;
            });
            if (OperatingSystem.IsWindows()) { PlaySound(file, IntPtr.Zero, SND_FILENAME | SND_ASYNC | SND_NODEFAULT); return; }
            var players = OperatingSystem.IsMacOS() ? new[] { "afplay" } : new[] { "paplay", "pw-play", "aplay" };
            foreach (var player in players)
            {
                try
                {
                    var psi = new ProcessStartInfo(player) { UseShellExecute = false, CreateNoWindow = true, RedirectStandardError = true, RedirectStandardOutput = true };
                    if (player == "aplay") psi.ArgumentList.Add("-q");
                    psi.ArgumentList.Add(file);
                    Process.Start(psi);
                    return;
                }
                catch (System.ComponentModel.Win32Exception) { }
            }
        }
        catch (Exception e) { Debug.WriteLine("Magic Glyphs: could not play sound " + name + ": " + e.Message); }
    }
}
`);

  fs.writeFileSync(path.join(out, 'README.md'), `# Magic Glyphs for Avalonia

Animated icons with sound for Avalonia 11 and 12. Each icon springs into motion when it is hovered, clicked or appears, and can play its own short sound.

- **${free.length} free icons** in outline, solid and duotone.
- **One control**, \`MagicGlyph\`, with no dependencies beyond Avalonia. It draws vectors, so it is sharp at any size.
- **Sound, off by default.** Played with the system's own audio on Windows, macOS and Linux, or handle the \`Played\` event to use your own audio library.

## Install

\`\`\`sh
dotnet add package MagicGlyphs.Avalonia
\`\`\`

## Use

\`\`\`xml
<Window xmlns:mg="using:MagicGlyphs">
  <StackPanel Orientation="Horizontal" Spacing="12">
    <mg:MagicGlyph Icon="heart" Size="32" Foreground="#E11D48" Sound="True" />
    <mg:MagicGlyph Icon="bell" Variant="Duotone" Trigger="Load" />
  </StackPanel>
</Window>
\`\`\`

| Property | Default | |
|---|---|---|
| \`Icon\` | \`heart\` | The icon name. \`Glyphs.Names\` lists them all |
| \`Variant\` | \`Outline\` | \`Outline\`, \`Solid\` or \`Duotone\` |
| \`Size\` | 24 | Width and height |
| \`Foreground\` | inherited | The icon colour, inherited like text colour |
| \`Secondary\` | \`Foreground\` | The duotone fill colour |
| \`Backdrop\` | white | The colour behind the icon; the solid style draws its inner details in it |
| \`Trigger\` | \`Hover\` | \`Hover\` (hover or click), \`Click\`, \`Load\` or \`Manual\` |
| \`Sound\` | false | Play the icon's sound |

Call \`Play()\` to play an icon yourself. Mute every icon with \`Glyphs.SoundEnabled = false\`. To play sounds with your own audio library, handle \`Played\` and open the sound with \`Glyphs.OpenSound(e.SoundName)\`, a WAV stream.

## The full library

The full Magic Glyphs library has more than 8,000 icons, an icon maker for your own artwork, and 528 sounds. Export any of them for Avalonia with the command line tool: see [magicglyphs.com/docs/avalonia](https://magicglyphs.com/docs/avalonia/).

## Licence

This package, its code, icons and sounds, is MIT licensed. The paid Magic Glyphs icons have their own licence.
`);

  // tests: headless Avalonia with Skia, so icons are really drawn
  fs.writeFileSync(path.join(out, 'tests', 'MagicGlyphs.Avalonia.Tests.csproj'), `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <AvaloniaVersion Condition="'$(AvaloniaVersion)' == ''">12.2.0</AvaloniaVersion>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Avalonia" Version="$(AvaloniaVersion)" />
    <PackageReference Include="Avalonia.Skia" Version="$(AvaloniaVersion)" />
    <PackageReference Include="Avalonia.Headless.XUnit" Version="$(AvaloniaVersion)" />
    <PackageReference Include="Avalonia.Themes.Fluent" Version="$(AvaloniaVersion)" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="18.12.0" />
    <PackageReference Include="xunit.runner.visualstudio" Version="3.1.5" />
  </ItemGroup>
  <!-- Avalonia 12's headless test helper uses xunit v3; Avalonia 11's uses xunit v2 -->
  <PropertyGroup Condition="$(AvaloniaVersion.StartsWith('12'))"><OutputType>Exe</OutputType></PropertyGroup>
  <ItemGroup Condition="$(AvaloniaVersion.StartsWith('12'))"><PackageReference Include="xunit.v3" Version="3.2.2" /></ItemGroup>
  <ItemGroup Condition="!$(AvaloniaVersion.StartsWith('12'))"><PackageReference Include="xunit" Version="2.9.3" /></ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\\src\\MagicGlyphs.Avalonia.csproj" />
  </ItemGroup>
</Project>
`);
  fs.writeFileSync(path.join(out, 'tests', 'TestApp.cs'), `using Avalonia;
using Avalonia.Headless;
using Avalonia.Themes.Fluent;

[assembly: AvaloniaTestApplication(typeof(MagicGlyphs.Tests.TestApp))]

namespace MagicGlyphs.Tests;

public class TestApp : Application
{
    public override void Initialize() => Styles.Add(new FluentTheme());
    public static AppBuilder BuildAvaloniaApp() => AppBuilder.Configure<TestApp>().UseSkia().UseHeadless(new AvaloniaHeadlessPlatformOptions { UseHeadlessDrawing = false });
}
`);
  fs.writeFileSync(path.join(out, 'tests', 'GlyphTests.cs'), `using System;
using System.Linq;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Headless.XUnit;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.Threading;
using Xunit;

namespace MagicGlyphs.Tests;

public class GlyphTests
{
    [Fact]
    public void Lists_the_free_icons_with_their_sounds()
    {
        Assert.Equal(${free.length}, Glyphs.Names.Count);
        Assert.NotNull(Glyphs.SoundOf("bell"));
        Assert.Null(Glyphs.Category("no-such-icon"));
        using var wav = Glyphs.OpenSound(Glyphs.SoundOf("bell")!);
        Assert.NotNull(wav);
        Assert.True(wav!.Length > 1000);
    }

    private static (Window w, MagicGlyph g) Show(string icon, GlyphVariant v)
    {
        var g = new MagicGlyph { Icon = icon, Variant = v, Size = 48, Foreground = Brushes.Black, Trigger = GlyphTrigger.Manual };
        var w = new Window { Width = 64, Height = 64, Background = Brushes.White, Content = g };
        w.Show();
        Dispatcher.UIThread.RunJobs();
        return (w, g);
    }

    private static int Ink(Window w)
    {
        using var frame = w.CaptureRenderedFrame()!;
        using var buf = new WriteableBitmap(frame.PixelSize, frame.Dpi, global::Avalonia.Platform.PixelFormat.Bgra8888, global::Avalonia.Platform.AlphaFormat.Premul);
        using var fb = buf.Lock();
        frame.CopyPixels(new PixelRect(frame.PixelSize), fb.Address, fb.RowBytes * frame.PixelSize.Height, fb.RowBytes);
        var bytes = new byte[fb.RowBytes * frame.PixelSize.Height];
        System.Runtime.InteropServices.Marshal.Copy(fb.Address, bytes, 0, bytes.Length);
        var n = 0;
        for (var i = 0; i < bytes.Length; i += 4) if (bytes[i] < 128) n++;
        return n;
    }

    [AvaloniaFact]
    public void Every_icon_draws_in_every_style()
    {
        foreach (var name in Glyphs.Names)
            foreach (var v in Enum.GetValues<GlyphVariant>())
            {
                var (w, _) = Show(name, v);
                Assert.True(Ink(w) > 20, name + " " + v + " drew nothing");
                w.Close();
            }
    }

    [AvaloniaFact]
    public void Solid_is_heavier_than_outline()
    {
        var (a, _) = Show("heart", GlyphVariant.Outline); var outline = Ink(a); a.Close();
        var (b, _) = Show("heart", GlyphVariant.Solid); var solid = Ink(b); b.Close();
        Assert.True(solid > outline * 1.3, $"solid {solid} vs outline {outline}");
    }

    [AvaloniaFact]
    public void Playing_moves_the_icon_and_reports_its_sound()
    {
        var (w, g) = Show("bell", GlyphVariant.Outline);
        string? sound = null;
        g.Played += (_, e) => sound = e.SoundName;
        using var rest = w.CaptureRenderedFrame()!;
        g.Seek(0.12);
        Dispatcher.UIThread.RunJobs();
        using var mid = w.CaptureRenderedFrame()!;
        Assert.NotEqual(Bytes(rest), Bytes(mid));
        g.Play();
        Assert.True(g.IsPlaying);
        Assert.Equal(Glyphs.SoundOf("bell"), sound);
        w.Close();
    }

    [AvaloniaFact]
    public void Draws_a_sheet_when_asked()
    {
        var file = Environment.GetEnvironmentVariable("MG_SHEET");
        if (string.IsNullOrEmpty(file)) return;
        var grid = new WrapPanel { Width = 960, Background = Brushes.White };
        var names = Glyphs.Names.Take(40).ToArray();
        for (var i = 0; i < names.Length; i++)
            grid.Children.Add(new Border { Width = 96, Height = 80, Child = new MagicGlyph { Icon = names[i], Size = 40, Variant = (GlyphVariant)(i % 3), Foreground = new SolidColorBrush(Color.Parse(i % 2 == 0 ? "#4a35d6" : "#14122b")), HorizontalAlignment = global::Avalonia.Layout.HorizontalAlignment.Center, VerticalAlignment = global::Avalonia.Layout.VerticalAlignment.Center, Trigger = GlyphTrigger.Manual } });
        var w = new Window { Width = 960, Height = 340, Content = grid, Background = Brushes.White };
        w.Show();
        Dispatcher.UIThread.RunJobs();
        w.CaptureRenderedFrame()!.Save(file);
        w.Close();
    }

    private static string Bytes(Bitmap b)
    {
        using var ms = new System.IO.MemoryStream();
        b.Save(ms);
        return Convert.ToBase64String(ms.ToArray());
    }
}
`);
  let bytes = 0; const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : (bytes += fs.statSync(p).size); } }; walk(out);
  console.log('Avalonia package source: dist/nuget/MagicGlyphs.Avalonia  (' + free.length + ' icons, ' + sounds.size + ' sounds, ' + (bytes / 1048576).toFixed(1) + ' MB)');
})().catch((e) => { console.error(e); process.exit(1); });
