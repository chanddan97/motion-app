import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TEMPLATES, LOGO_POSITIONS, VIDEO_FORMATS, FONTS } from '../constants';
import { CaptionJSON } from '../types';

interface CustomizeScreenProps {
  navigation: any;
  route: any;
}

const SFX_CATEGORIES = [
  { id: 'whoosh', label: '💨 Whoosh' },
  { id: 'impact', label: '💥 Impact' },
  { id: 'transition', label: '🔄 Transition' },
  { id: 'cinematic', label: '🎬 Cinematic' },
  { id: 'upbeat', label: '🎵 Upbeat' },
  { id: 'none', label: '🔇 No SFX' },
];

export default function CustomizeScreen({ navigation, route }: CustomizeScreenProps) {
  const { captions, templateId } = route.params;
  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState('bot_right');
  const [logoOpacity, setLogoOpacity] = useState(0.8);
  const [logoSize, setLogoSize] = useState(20);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [sfxCategory, setSfxCategory] = useState('whoosh');
  const [videoFormat, setVideoFormat] = useState('reel');
  const [selectedFont, setSelectedFont] = useState(FONTS.english[0].value);
  const [loading, setLoading] = useState(false);

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const handleRender = () => {
    navigation.navigate('Render', {
      captions,
      templateId,
      logoUri,
      logoPosition,
      logoOpacity,
      logoSize,
      sfxEnabled,
      sfxCategory,
      videoFormat,
      fontFamily: selectedFont,
    });
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize</Text>
        <TouchableOpacity style={styles.renderBtn} onPress={handleRender}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.renderGrad}>
            <Text style={styles.renderText}>Render ▶</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Selected Template */}
        <View style={[styles.previewCard, { backgroundColor: template.preview.bg }]}>
          <Text style={styles.previewEmoji}>{template.emoji}</Text>
          <View>
            <Text style={[styles.previewName, { color: template.preview.text }]}>{template.name}</Text>
            <Text style={[styles.previewDesc, { color: template.preview.text }]}>{template.description}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changeBtn}>
            <Text style={styles.changeText}>বদলাও</Text>
          </TouchableOpacity>
        </View>

        {/* Video Format */}
        <Section title="📐 Video Format">
          <View style={styles.row}>
            {VIDEO_FORMATS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.formatBtn, videoFormat === f.id && styles.formatBtnActive]}
                onPress={() => setVideoFormat(f.id)}
              >
                <Text style={styles.formatRatio}>{f.ratio}</Text>
                <Text style={styles.formatLabel}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Logo */}
        <Section title="🖼️ Logo / Watermark">
          <TouchableOpacity style={styles.logoPickBtn} onPress={pickLogo}>
            <Text style={styles.logoPickIcon}>{logoUri ? '✅' : '📂'}</Text>
            <Text style={styles.logoPickText}>
              {logoUri ? 'Logo selected — tap to change' : 'Logo image বেছে নাও'}
            </Text>
          </TouchableOpacity>
          {logoUri && (
            <>
              <Text style={styles.subLabel}>Position:</Text>
              <View style={styles.positionGrid}>
                {LOGO_POSITIONS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.posBtn, logoPosition === p.id && styles.posBtnActive]}
                    onPress={() => setLogoPosition(p.id)}
                  >
                    <Text style={[styles.posBtnText, logoPosition === p.id && { color: '#FFFFFF' }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </Section>

        {/* Sound Effects */}
        <Section title="🔊 Sound Effects">
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Auto SFX চালু রাখো</Text>
            <Switch
              value={sfxEnabled}
              onValueChange={setSfxEnabled}
              trackColor={{ false: COLORS.bgElevated, true: COLORS.primary }}
              thumbColor={sfxEnabled ? COLORS.primaryLight : '#888'}
            />
          </View>
          {sfxEnabled && (
            <View style={styles.sfxGrid}>
              {SFX_CATEGORIES.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.sfxBtn, sfxCategory === s.id && styles.sfxBtnActive]}
                  onPress={() => setSfxCategory(s.id)}
                >
                  <Text style={[styles.sfxLabel, sfxCategory === s.id && { color: '#FFFFFF' }]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Section>

        {/* Font */}
        <Section title="🖋️ Font Style">
          <Text style={styles.subLabel}>English Fonts:</Text>
          <View style={styles.fontGrid}>
            {FONTS.english.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.fontBtn, selectedFont === f.value && styles.fontBtnActive]}
                onPress={() => setSelectedFont(f.value)}
              >
                <Text style={[styles.fontLabel, selectedFont === f.value && { color: '#FFFFFF' }]}>
                  {f.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.subLabel, { marginTop: 12 }]}>Bengali Fonts:</Text>
          <View style={styles.fontGrid}>
            {FONTS.bengali.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.fontBtn, selectedFont === f.value && styles.fontBtnActive]}
                onPress={() => setSelectedFont(f.value)}
              >
                <Text style={[styles.fontLabel, selectedFont === f.value && { color: '#FFFFFF' }]}>
                  {f.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Caption Summary */}
        <Section title={`📄 Captions (${captions.length}টা)`}>
          {captions.slice(0, 4).map((c: CaptionJSON) => (
            <View key={c.id} style={styles.captionRow}>
              <Text style={styles.captionTime}>{c.start.toFixed(1)}s</Text>
              <Text style={styles.captionText}>{c.text}</Text>
            </View>
          ))}
          {captions.length > 4 && (
            <Text style={styles.moreText}>+{captions.length - 4}টা আরো...</Text>
          )}
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24, color: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  renderBtn: { borderRadius: 12, overflow: 'hidden' },
  renderGrad: { paddingHorizontal: 18, paddingVertical: 10 },
  renderText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  scroll: { padding: 20, paddingBottom: 60 },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  previewEmoji: { fontSize: 32 },
  previewName: { fontSize: 15, fontWeight: '800' },
  previewDesc: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  changeBtn: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  section: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  subLabel: { fontSize: 13, color: COLORS.whiteAlpha40, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  formatBtn: {
    flex: 1,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(124,58,237,0.2)' },
  formatRatio: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  formatLabel: { fontSize: 11, color: COLORS.whiteAlpha40 },
  logoPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: 14,
  },
  logoPickIcon: { fontSize: 24 },
  logoPickText: { fontSize: 14, color: COLORS.whiteAlpha80 },
  positionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  posBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  posBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  posBtnText: { fontSize: 12, color: COLORS.whiteAlpha40, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  switchLabel: { fontSize: 14, color: COLORS.whiteAlpha80 },
  sfxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sfxBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sfxBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sfxLabel: { fontSize: 13, color: COLORS.whiteAlpha40, fontWeight: '600' },
  fontGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fontBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fontBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fontLabel: { fontSize: 13, color: COLORS.whiteAlpha40 },
  captionRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  captionTime: { fontSize: 12, color: COLORS.primary, fontWeight: '700', minWidth: 40 },
  captionText: { flex: 1, fontSize: 13, color: COLORS.whiteAlpha80, lineHeight: 18 },
  moreText: { fontSize: 13, color: COLORS.whiteAlpha40, textAlign: 'center', marginTop: 4 },
});
