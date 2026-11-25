// One-file components for native apps. Each embeds the icon's Lottie animation, so there is no asset to copy;
// if a <name>.wav from `--sound` is bundled with the app, the component plays it with the animation.
function lottieJson(ic, o) { const { toLottie } = require('./lottie.js'); return JSON.stringify(toLottie(ic, Object.assign({}, o, { color: o.color || '#000000' }))); }
const pascal = (n) => n.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('').replace(/^(\d)/, 'Glyph$1');
const camel = (n) => { const p = pascal(n); return p[0].toLowerCase() + p.slice(1); };

function reactNative(ic, o) {
  const P = pascal(ic.n), j = lottieJson(ic, o);
  return { file: P + 'Glyph.tsx', text: `// Animated "${ic.n}" icon from Magic Glyphs for React Native.
// Needs: npm install lottie-react-native   (sound, optional: npx expo install expo-audio, and bundle ${ic.n}.wav)
import React, { useRef } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

const animation = ${j};

export type ${P}GlyphProps = {
  size?: number;
  /** Play when pressed (default true). */
  playOnPress?: boolean;
  /** Called when it plays, for example to play its sound with expo-audio. */
  onPlay?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export default function ${P}Glyph({ size = 24, playOnPress = true, onPlay, accessibilityLabel, style }: ${P}GlyphProps) {
  const ref = useRef<LottieView>(null);
  const play = () => { ref.current?.reset(); ref.current?.play(); onPlay?.(); };
  return (
    <Pressable onPress={playOnPress ? play : undefined} accessibilityRole={accessibilityLabel ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel} accessibilityElementsHidden={!accessibilityLabel} style={style}>
      <LottieView ref={ref} source={animation} autoPlay={false} loop={false} style={{ width: size, height: size }} />
    </Pressable>
  );
}
` };
}

function swiftui(ic, o) {
  const P = pascal(ic.n), j = lottieJson(ic, o);
  return { file: P + 'Glyph.swift', text: `// Animated "${ic.n}" icon from Magic Glyphs for SwiftUI (iOS 15+, macOS 12+).
// Needs the Lottie package: https://github.com/airbnb/lottie-ios (4.4 or later).
// Sound, optional: add ${ic.n}.wav to the app bundle and it plays with the animation.
import SwiftUI
import Lottie
import AVFoundation

public struct ${P}Glyph: View {
    private static let animation = LottieAnimation.from(data: Data(#"${j}"#.utf8))
    private static var player: AVAudioPlayer? = Bundle.main.url(forResource: "${ic.n}", withExtension: "wav").flatMap { try? AVAudioPlayer(contentsOf: $0) }
    @State private var playback: LottiePlaybackMode = .paused(at: .progress(0))
    var size: CGFloat
    var sound: Bool
    var label: String?

    public init(size: CGFloat = 24, sound: Bool = true, label: String? = nil) { self.size = size; self.sound = sound; self.label = label }

    public var body: some View {
        LottieView(animation: Self.animation)
            .playbackMode(playback)
            .animationDidFinish { _ in playback = .paused(at: .progress(0)) }   // ready to play again on the next tap
            .frame(width: size, height: size)
            .contentShape(Rectangle())
            .onTapGesture {
                playback = .playing(.fromProgress(0, toProgress: 1, loopMode: .playOnce))
                if sound { Self.player?.currentTime = 0; Self.player?.play() }
            }
            .accessibilityLabel(label ?? "")
            .accessibilityHidden(label == nil)
    }
}
` };
}

function compose(ic, o) {
  const P = pascal(ic.n), j = lottieJson(ic, o).replace(/\$/g, "${'$'}");
  return { file: P + 'Glyph.kt', text: `// Animated "${ic.n}" icon from Magic Glyphs for Jetpack Compose.
// Needs: implementation("com.airbnb.android:lottie-compose:6.6.0")
// Sound, optional: put ${ic.n}.wav in res/raw as ${ic.n.replace(/-/g, '_')}.wav and pass sound = true.
package magicglyphs

import android.media.MediaPlayer
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.airbnb.lottie.compose.*

private const val ${camel(ic.n)}Json = """${j}"""

@Composable
fun ${P}Glyph(size: Dp = 24.dp, sound: Boolean = false, label: String? = null, modifier: Modifier = Modifier) {
    val composition by rememberLottieComposition(LottieCompositionSpec.JsonString(${camel(ic.n)}Json))
    var plays by remember { mutableIntStateOf(0) }
    val progress by animateLottieCompositionAsState(composition, isPlaying = plays > 0, restartOnPlay = true, iterations = 1)
    val context = LocalContext.current
    val soundId = remember { context.resources.getIdentifier("${ic.n.replace(/-/g, '_')}", "raw", context.packageName) }
    LottieAnimation(
        composition = composition,
        progress = { if (plays == 0) 0f else progress },
        modifier = modifier.size(size)
            .semantics { if (label != null) contentDescription = label }
            .clickable {
                plays++
                if (sound && soundId != 0) MediaPlayer.create(context, soundId)?.apply { setOnCompletionListener { it.release() }; start() }
            }
    )
}
` };
}

function flutter(ic, o) {
  const P = pascal(ic.n), j = lottieJson(ic, o);
  return { file: ic.n.replace(/-/g, '_') + '_glyph.dart', text: `// Animated "${ic.n}" icon from Magic Glyphs for Flutter.
// Needs: flutter pub add lottie   (sound, optional: flutter pub add audioplayers, and add assets/${ic.n}.wav to pubspec.yaml)
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:audioplayers/audioplayers.dart';

const String _${camel(ic.n)}Json = r'''${j}''';

class ${P}Glyph extends StatefulWidget {
  const ${P}Glyph({super.key, this.size = 24, this.sound = false, this.label});
  final double size;
  final bool sound;
  final String? label;
  @override
  State<${P}Glyph> createState() => _${P}GlyphState();
}

class _${P}GlyphState extends State<${P}Glyph> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(vsync: this);
  final AudioPlayer _audio = AudioPlayer();

  void play() {
    _controller.forward(from: 0);
    if (widget.sound) _audio.play(AssetSource('${ic.n}.wav'));
  }

  @override
  void dispose() { _controller.dispose(); _audio.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: widget.label,
      excludeSemantics: widget.label == null,
      button: widget.label != null,
      child: GestureDetector(
        onTap: play,
        child: Lottie.memory(
          utf8.encode(_${camel(ic.n)}Json),
          controller: _controller,
          width: widget.size,
          height: widget.size,
          onLoaded: (c) => _controller.duration = c.duration,
        ),
      ),
    );
  }
}
` };
}

function winui(ic, o) {
  const P = pascal(ic.n), j = lottieJson(ic, o).replace(/"/g, '""');
  return { file: P + 'Glyph.cs', text: `// Animated "${ic.n}" icon from Magic Glyphs for WinUI 3 (Windows App SDK).
// Needs: dotnet add package CommunityToolkit.WinUI.Lottie
// Sound, optional: add ${ic.n}.wav to the project as Content and set Sound = true.
using System;
using CommunityToolkit.WinUI.Lottie;
using Microsoft.UI.Xaml.Controls;
using Windows.Media.Core;
using Windows.Media.Playback;

namespace MagicGlyphs;

public sealed class ${P}Glyph : UserControl
{
    private const string Json = @"${j}";
    private readonly AnimatedVisualPlayer _player = new() { AutoPlay = false };
    private readonly MediaPlayer _audio = new();
    public bool Sound { get; set; }

    public ${P}Glyph(double size = 24)
    {
        Width = Height = size;
        _player.Source = LottieVisualSource.CreateFromString(Json);
        Content = _player;
        Tapped += (_, _) => Play();
    }

    public async void Play()
    {
        if (Sound) { _audio.Source = MediaSource.CreateFromUri(new Uri("ms-appx:///${ic.n}.wav")); _audio.Play(); }
        await _player.PlayAsync(0, 1, false);
    }
}
` };
}
module.exports = { 'react-native': reactNative, swiftui, compose, flutter, winui, lottieJson };
