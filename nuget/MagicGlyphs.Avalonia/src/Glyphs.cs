using System;
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
