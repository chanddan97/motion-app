import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TEMPLATES, VIDEO_FORMATS, LOGO_POSITIONS, FONTS } from '../constants';
import { CaptionJSON } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LiveStudioProps {
  navigation: any;
  route: any;
}

export default function LiveStudioScreen({ navigation, route }: LiveStudioProps) {
  const { captions, audioUri, audioName } = route.params;

  // Studio Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState('fire_punch');
  const [videoFormat, setVideoFormat] = useState<'reel' | 'youtube'>('reel');
  const [selectedFont, setSelectedFont] = useState(FONTS.english[0].value);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState('bot_right');
  const [activeTab, setActiveTab] = useState<'templates' | 'style' | 'logo'>('templates');

  // Sound instance
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<any>(null);

  // Total Duration calculation
  const totalDuration = captions.length > 0 ? Math.max(...captions.map((c: CaptionJSON) => c.end)) : 10;

  // Active Caption based on current playback time
  const currentCaption = captions.find(
    (c: CaptionJSON) => currentTime >= c.start && currentTime <= c.end
  );

  const activeTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  // Play / Pause Audio & Timeline Timer
  const togglePlay = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearInterval(timerRef.current);
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
    } else {
      setIsPlaying(true);
      // Play real audio if available
      if (soundRef.current) {
        await soundRef.current.playAsync();
      }

      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            return 0;
          }
          return parseFloat((prev + 0.1).toFixed(2));
        });
      }, 100);
    }
  };

  useEffect(() => {
    // Load audio if user supplied audioUri
    async function loadAudio() {
      if (audioUri) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: false }
          );
          soundRef.current = sound;
        } catch (e) {
          console.log('Audio load fallback to virtual timer');
        }
      }
    }
    loadAudio();

    return () => {
      clearInterval(timerRef.current);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [audioUri]);

  // Pick Logo Image
  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const handleExport = () => {
    navigation.navigate('Render', {
      captions,
      templateId: selectedTemplateId,
      videoFormat,
      logoUri,
      logoPosition,
      fontFamily: selectedFont,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Live Studio Preview</Text>
          <Text style={styles.headerSub}>{audioName || 'Audio Timeline Sync'}</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.exportGrad}>
            <Text style={styles.exportText}>Export ➔</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 📱 The Live Video Player Screen Frame */}
      <View style={styles.playerContainer}>
        <View
          style={[
            styles.playerFrame,
            videoFormat === 'reel' ? styles.playerReel : styles.playerYoutube,
            { backgroundColor: activeTemplate.preview.bg },
          ]}
        >
          {/* Logo Watermark Overlay */}
          {logoUri && (
            <View style={[styles.logoOverlay, getPositionStyle(logoPosition)]}>
              <Image source={{ uri: logoUri }} style={styles.logoImage} />
            </View>
          )}

          {/* Animated Caption Display in Realtime */}
          <View style={styles.captionContainer}>
            {currentCaption ? (
              <View style={styles.captionBox}>
                <Text style={styles.activeEmoji}>{activeTemplate.emoji}</Text>
                <View style={styles.wordsWrapper}>
                  {currentCaption.words.map((word: string, index: number) => {
                    const isWordActive =
                      currentCaption.wordTimeline &&
                      currentTime >= (currentCaption.wordTimeline[index]?.start || 0) &&
                      currentTime <= (currentCaption.wordTimeline[index]?.end || currentCaption.end);

                    return (
                      <Text
                        key={index}
                        style={[
                          styles.captionWord,
                          { color: activeTemplate.preview.text },
                          isWordActive && {
                            color: activeTemplate.preview.accent,
                            transform: [{ scale: 1.15 }],
                            fontWeight: '900',
                            textShadowColor: activeTemplate.preview.accent,
                            textShadowRadius: 10,
                          },
                        ]}
                      >
                        {word}{' '}
                      </Text>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Text style={styles.placeholderCaption}>
                {isPlaying ? '...' : '▶ Play চেপে লাইভ অ্যানিমেশন দেখো'}
              </Text>
            )}
          </View>

          {/* Format Badge */}
          <View style={styles.formatBadge}>
            <Text style={styles.formatBadgeText}>{videoFormat.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* ⏯️ Player Controls & Timeline */}
      <View style={styles.controlBar}>
        <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <View style={styles.timelineWrapper}>
          <View style={styles.timelineBar}>
            <View
              style={[
                styles.timelineProgress,
                { width: `${Math.min(100, (currentTime / totalDuration) * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.timeLabels}>
            <Text style={styles.timeText}>{currentTime.toFixed(1)}s</Text>
            <Text style={styles.timeText}>{totalDuration.toFixed(1)}s</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.formatToggleBtn}
          onPress={() => setVideoFormat(videoFormat === 'reel' ? 'youtube' : 'reel')}
        >
          <Text style={styles.formatToggleText}>
            {videoFormat === 'reel' ? '9:16' : '16:9'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🛠️ Studio Customizer Tabs */}
      <View style={styles.studioTabs}>
        <TouchableOpacity
          style={[styles.studioTabBtn, activeTab === 'templates' && styles.studioTabActive]}
          onPress={() => setActiveTab('templates')}
        >
          <Text style={[styles.studioTabText, activeTab === 'templates' && styles.studioTabTextActive]}>
            🎨 ২০টি টেমপ্লেট
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.studioTabBtn, activeTab === 'style' && styles.studioTabActive]}
          onPress={() => setActiveTab('style')}
        >
          <Text style={[styles.studioTabText, activeTab === 'style' && styles.studioTabTextActive]}>
            🖋️ ফন্ট ও স্টাইল
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.studioTabBtn, activeTab === 'logo' && styles.studioTabActive]}
          onPress={() => setActiveTab('logo')}
        >
          <Text style={[styles.studioTabText, activeTab === 'logo' && styles.studioTabTextActive]}>
            🖼️ লোগো যুক্ত
          </Text>
        </TouchableOpacity>
      </View>

      {/* Studio Sub-Panels */}
      <View style={styles.subPanel}>
        {activeTab === 'templates' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizScroll}>
            {TEMPLATES.map((tmpl) => (
              <TouchableOpacity
                key={tmpl.id}
                style={[
                  styles.tmplCard,
                  { backgroundColor: tmpl.preview.bg },
                  selectedTemplateId === tmpl.id && styles.tmplCardActive,
                ]}
                onPress={() => setSelectedTemplateId(tmpl.id)}
              >
                <Text style={styles.tmplEmoji}>{tmpl.emoji}</Text>
                <Text style={[styles.tmplName, { color: tmpl.preview.text }]}>{tmpl.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {activeTab === 'style' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizScroll}>
            {FONTS.english.concat(FONTS.bengali).map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.fontCard, selectedFont === f.value && styles.fontCardActive]}
                onPress={() => setSelectedFont(f.value)}
              >
                <Text style={[styles.fontCardText, selectedFont === f.value && { color: '#FFF' }]}>
                  {f.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {activeTab === 'logo' && (
          <View style={styles.logoPanel}>
            <TouchableOpacity style={styles.logoPickBtn} onPress={pickLogo}>
              <Text style={{ fontSize: 18 }}>{logoUri ? '✅' : '➕'}</Text>
              <Text style={styles.logoPickText}>
                {logoUri ? 'লোগো পরিবর্তন করো' : 'লোগো ইমেজ সিলেক্ট করো'}
              </Text>
            </TouchableOpacity>

            {logoUri && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {LOGO_POSITIONS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.posChip, logoPosition === p.id && styles.posChipActive]}
                    onPress={() => setLogoPosition(p.id)}
                  >
                    <Text style={[styles.posChipText, logoPosition === p.id && { color: '#FFF' }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function getPositionStyle(pos: string) {
  switch (pos) {
    case 'top_left': return { top: 12, left: 12 };
    case 'top_center': return { top: 12, alignSelf: "center" as const };
    case 'top_right': return { top: 12, right: 12 };
    case 'bot_left': return { bottom: 12, left: 12 };
    case 'bot_right': return { bottom: 12, right: 12 };
    default: return { bottom: 12, right: 12 };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backIcon: { fontSize: 22, color: '#FFF' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  headerSub: { fontSize: 11, color: COLORS.whiteAlpha40 },
  exportBtn: { borderRadius: 12, overflow: 'hidden' },
  exportGrad: { paddingHorizontal: 16, paddingVertical: 8 },
  exportText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  playerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  playerFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    position: 'relative',
  },
  playerReel: { width: SCREEN_WIDTH * 0.65, height: SCREEN_WIDTH * 0.65 * (16 / 9) },
  playerYoutube: { width: SCREEN_WIDTH * 0.9, height: SCREEN_WIDTH * 0.9 * (9 / 16) },
  captionContainer: { paddingHorizontal: 16, alignItems: 'center' },
  captionBox: { alignItems: 'center' },
  activeEmoji: { fontSize: 32, marginBottom: 8 },
  wordsWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  captionWord: { fontSize: 18, fontWeight: '800', lineHeight: 28 },
  placeholderCaption: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' },
  logoOverlay: { position: 'absolute', zIndex: 10 },
  logoImage: { width: 44, height: 44, resizeMode: 'contain' },
  formatBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  formatBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.bgCard,
    gap: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#FFF', fontSize: 18 },
  timelineWrapper: { flex: 1 },
  timelineBar: { height: 6, backgroundColor: COLORS.bgElevated, borderRadius: 3, overflow: 'hidden' },
  timelineProgress: { height: '100%', backgroundColor: COLORS.primaryLight },
  timeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timeText: { color: COLORS.whiteAlpha40, fontSize: 11 },
  formatToggleBtn: {
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatToggleText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  studioTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  studioTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  studioTabActive: { backgroundColor: 'rgba(124,58,237,0.2)' },
  studioTabText: { color: COLORS.whiteAlpha40, fontSize: 12, fontWeight: '700' },
  studioTabTextActive: { color: COLORS.primaryLight },
  subPanel: { backgroundColor: COLORS.bgCard, paddingBottom: 20, paddingTop: 8 },
  horizScroll: { paddingHorizontal: 16, gap: 10 },
  tmplCard: {
    width: 90,
    height: 90,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 6,
  },
  tmplCardActive: { borderColor: COLORS.primaryLight },
  tmplEmoji: { fontSize: 24, marginBottom: 4 },
  tmplName: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  fontCard: {
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  fontCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fontCardText: { color: COLORS.whiteAlpha40, fontSize: 13, fontWeight: '600' },
  logoPanel: { paddingHorizontal: 16 },
  logoPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.bgElevated,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoPickText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  posChip: {
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  posChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  posChipText: { color: COLORS.whiteAlpha40, fontSize: 11 },
});
