using System;
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
