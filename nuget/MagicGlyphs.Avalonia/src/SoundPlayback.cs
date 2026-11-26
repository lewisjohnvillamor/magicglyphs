using System;
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
