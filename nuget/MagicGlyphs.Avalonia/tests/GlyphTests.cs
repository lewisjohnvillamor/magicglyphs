using System;
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
        Assert.Equal(120, Glyphs.Names.Count);
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
