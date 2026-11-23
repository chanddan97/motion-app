import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { parseSRT, srtToMotionJSON, generateSampleSRT } from '../utils/srtParser';
import { COLORS } from '../constants';

interface InputScreenProps {
  navigation: any;
}

export default function InputScreen({ navigation }: InputScreenProps) {
  const [loading, setLoading] = useState(false);
  const [srtPreview, setSrtPreview] = useState('');
  const [captionCount, setCaptionCount] = useState(0);

  const pickSRTFile = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) { setLoading(false); return; }

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);

      const parsed = parseSRT(content);
      if (parsed.length === 0) {
        Alert.alert('⚠️ Error', 'SRT file parse করা যায়নি। Format ঠিক আছে কিনা দেখো।');
        setLoading(false);
        return;
      }

      const json = srtToMotionJSON(parsed);
      setCaptionCount(json.length);
      setSrtPreview(content.slice(0, 300) + '...');

      navigation.navigate('TemplatePicker', { captions: json });
    } catch (e) {
      Alert.alert('Error', 'File read করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const useSampleSRT = () => {
    const sample = generateSampleSRT();
    const parsed = parseSRT(sample);
    const json = srtToMotionJSON(parsed);
    setSrtPreview(sample);
    setCaptionCount(json.length);
    navigation.navigate('TemplatePicker', { captions: json });
  };

  return (
    <View style={styles.container}>
      

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Input</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>📄 SRT File Upload</Text>
        <Text style={styles.subtitle}>
          Audio থেকে SRT বানাও (যেকোনো transcription app দিয়ে), তারপর এখানে upload করো।
        </Text>

        {/* Upload Button */}
        <TouchableOpacity style={styles.uploadCard} onPress={pickSRTFile} disabled={loading}>
          <LinearGradient
            colors={['rgba(124,58,237,0.2)', 'rgba(79,70,229,0.1)']}
            style={styles.uploadGradient}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.primary} size="large" />
            ) : (
              <>
                <Text style={styles.uploadIcon}>📂</Text>
                <Text style={styles.uploadTitle}>SRT File বেছে নাও</Text>
                <Text style={styles.uploadSub}>.srt format</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* OR divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>অথবা</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sample */}
        <TouchableOpacity style={styles.sampleBtn} onPress={useSampleSRT}>
          <Text style={styles.sampleIcon}>✨</Text>
          <View>
            <Text style={styles.sampleTitle}>Sample দিয়ে দেখো</Text>
            <Text style={styles.sampleSub}>Demo captions দিয়ে template test করো</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* SRT Format Guide */}
        <View style={styles.guide}>
          <Text style={styles.guideTitle}>📝 SRT Format কেমন হয়?</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>{`1\n00:00:01,000 --> 00:00:03,500\nতোমার caption এখানে\n\n2\n00:00:04,000 --> 00:00:06,000\nপরের caption এখানে`}</Text>
          </View>

          <Text style={styles.guideTitle}>🎙️ SRT কোথা থেকে পাবে?</Text>
          <View style={styles.tipList}>
            {srtSources.map((s, i) => (
              <View key={i} style={styles.tip}>
                <Text style={styles.tipIcon}>{s.icon}</Text>
                <View>
                  <Text style={styles.tipTitle}>{s.name}</Text>
                  <Text style={styles.tipDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const srtSources = [
  { icon: '🤖', name: 'Claude / ChatGPT', desc: 'Audio transcript দাও, SRT চাও' },
  { icon: '🎥', name: 'CapCut', desc: 'Auto caption export করো' },
  { icon: '📱', name: 'Whisper App', desc: 'Free speech-to-SRT app' },
  { icon: '✏️', name: 'নিজে লেখো', desc: 'Notepad-এ SRT format-এ লেখো' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24, color: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  scroll: { padding: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.whiteAlpha40, lineHeight: 20, marginBottom: 24 },
  uploadCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  uploadGradient: {
    padding: 48,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  uploadIcon: { fontSize: 48, marginBottom: 12 },
  uploadTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  uploadSub: { fontSize: 13, color: COLORS.whiteAlpha40 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 14, color: COLORS.whiteAlpha40 },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
  },
  sampleIcon: { fontSize: 28 },
  sampleTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  sampleSub: { fontSize: 12, color: COLORS.whiteAlpha40, marginTop: 2 },
  arrow: { marginLeft: 'auto', fontSize: 20, color: COLORS.primary },
  guide: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  guideTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  codeBlock: { backgroundColor: '#0D0D15', borderRadius: 12, padding: 14 },
  code: { fontFamily: 'monospace', fontSize: 12, color: '#A78BFA', lineHeight: 20 },
  tipList: { gap: 12 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipIcon: { fontSize: 22, marginTop: 2 },
  tipTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  tipDesc: { fontSize: 12, color: COLORS.whiteAlpha40, marginTop: 2 },
});
