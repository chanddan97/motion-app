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
import { parseSRT, srtToMotionJSON } from '../utils/srtParser';
import { COLORS } from '../constants';

interface InputScreenProps {
  navigation: any;
}

export default function InputScreen({ navigation }: InputScreenProps) {
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<{ uri: string; name: string } | null>(null);
  const [srtFile, setSrtFile] = useState<{ name: string; content: string } | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState<'srt' | 'json'>('srt');

  // 1. Pick Audio
  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setAudioFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name,
        });
      }
    } catch (e) {
      Alert.alert('Error', 'অডিও সিলেক্ট করা যায়নি।');
    }
  };

  // 2. Pick SRT File
  const pickSRTFile = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets) {
        setLoading(false);
        return;
      }

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const parsed = parseSRT(content);

      if (parsed.length === 0) {
        Alert.alert('⚠️ Error', 'SRT ফাইলে সঠিক ক্যাপশন টাইমলাইন পাওয়া যায়নি।');
        setLoading(false);
        return;
      }

      setSrtFile({
        name: file.name,
        content,
      });
    } catch (e) {
      Alert.alert('Error', 'SRT ফাইল লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // 3. Process & Start Studio Preview
  const handleProceed = () => {
    let captions = [];

    if (activeTab === 'srt') {
      if (!srtFile) {
        Alert.alert('⚠️ SRT ফাইল প্রয়োজন', 'অনুগ্রহ করে একটি .srt ফাইল আপলোড করুন অথবা ডেমো টেস্ট করুন।');
        return;
      }
      const parsed = parseSRT(srtFile.content);
      captions = srtToMotionJSON(parsed);
    } else {
      // Direct Claude JSON
      if (!jsonInput.trim()) {
        Alert.alert('⚠️ JSON প্রয়োজন', 'Claude থেকে জেনারেট করা Motion JSON পেস্ট করুন।');
        return;
      }
      try {
        const parsed = JSON.parse(jsonInput);
        captions = Array.isArray(parsed) ? parsed : parsed.captions || [];
      } catch (err) {
        Alert.alert('⚠️ ভুল JSON', 'JSON ফরম্যাট সঠিক নয়। অনুগ্রহ করে কোডটি ঠিকমতো কপি করে পেস্ট করুন।');
        return;
      }
    }

    if (captions.length === 0) {
      Alert.alert('⚠️ কোনো ক্যাপশন নেই', 'কমপক্ষে ১টি ক্যাপশন প্রয়োজন।');
      return;
    }

    // Navigate to Live Studio Player
    navigation.navigate('LiveStudio', {
      captions,
      audioUri: audioFile?.uri || null,
      audioName: audioFile?.name || 'Demo Audio Sync',
    });
  };

  // 4. Quick Demo Setup
  const handleDemo = () => {
    const demoSRT = `1
00:00:00,500 --> 00:00:02,800
আমি আজকে তোমাদের দেখাব!

2
00:00:03,000 --> 00:00:05,800
কিভাবে ফোনে মোশন গ্রাফিক্স ক্যাপশন ভিডিও বানাবে?

3
00:00:06,000 --> 00:00:08,500
Alex Hormozi স্টাইলে অটো ওয়ার্ড হাইলাইট হবে।

4
00:00:08,800 --> 00:00:11,500
সাথে ব্যাকগ্রাউন্ড মিউজিক আর দারুণ সাউন্ড ইফেক্ট!

5
00:00:11,800 --> 00:00:14,200
এখনই নিজের ব্রাউজার থেকে লাইভ প্রিভিউ প্লে করে দেখো!`;

    const parsed = parseSRT(demoSRT);
    const captions = srtToMotionJSON(parsed);

    navigation.navigate('LiveStudio', {
      captions,
      audioUri: null,
      audioName: 'Auto Studio Demo Audio',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Studio Input</Text>
        <TouchableOpacity style={styles.demoHeaderBtn} onPress={handleDemo}>
          <Text style={styles.demoHeaderText}>Demo Test ✨</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Step 1: Audio Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.stepBadge}>১</Text>
            <Text style={styles.cardTitle}>ভয়েস / অডিও ফাইল (ঐচ্ছিক)</Text>
          </View>
          <Text style={styles.cardDesc}>
            তোমার ভয়েস রেকর্ড (.mp3/.m4a/.wav) আপলোড করো যাতে লাইভ প্লেয়ারে অডিওর সাথে ক্যাপশন সিঙ্ক হয়।
          </Text>

          <TouchableOpacity style={styles.uploadBtn} onPress={pickAudioFile}>
            <Text style={styles.uploadBtnIcon}>{audioFile ? '🎵' : '➕'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadBtnText}>
                {audioFile ? audioFile.name : 'অডিও ফাইল সিলেক্ট করো (.mp3, .wav)'}
              </Text>
              {audioFile && <Text style={styles.uploadBtnSub}>অডিও সফলভাবে সিলেক্ট হয়েছে</Text>}
            </View>
          </TouchableOpacity>
        </View>

        {/* Step 2: SRT or Claude JSON Tab */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.stepBadge}>২</Text>
            <Text style={styles.cardTitle}>ক্যাপশন সোর্স নির্বাচন করো</Text>
          </View>

          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'srt' && styles.tabBtnActive]}
              onPress={() => setActiveTab('srt')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'srt' && styles.tabBtnTextActive]}>
                📄 SRT ফাইল আপলোড
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'json' && styles.tabBtnActive]}
              onPress={() => setActiveTab('json')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'json' && styles.tabBtnTextActive]}>
                🤖 Claude JSON পেস্ট
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'srt' ? (
            <View>
              <TouchableOpacity style={styles.srtDropZone} onPress={pickSRTFile} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <>
                    <Text style={{ fontSize: 32, marginBottom: 8 }}>📄</Text>
                    <Text style={styles.srtDropTitle}>
                      {srtFile ? srtFile.name : 'SRT ফাইল নির্বাচন করো'}
                    </Text>
                    <Text style={styles.srtDropSub}>
                      {srtFile ? 'সরাসরি ভিডিও মোশন JSON-এ কনভার্ট হবে' : '.srt ফাইল দিন'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TextInput
                style={styles.jsonInput}
                multiline
                placeholder='Claude-এর দেওয়া JSON এখানে পেস্ট করো... e.g. [{"start": 0.5, "end": 2.5, "text": "Hello"}]'
                placeholderTextColor={COLORS.whiteAlpha40}
                value={jsonInput}
                onChangeText={setJsonInput}
              />
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleProceed}>
          <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.actionGrad}>
            <Text style={styles.actionText}>🎬 লাইভ প্রিভিউ স্টুডিও ওপেন করো ➔</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24, color: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  demoHeaderBtn: { backgroundColor: 'rgba(124,58,237,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  demoHeaderText: { color: COLORS.primaryLight, fontSize: 13, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 60 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '800',
    lineHeight: 24,
    fontSize: 13,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  cardDesc: { fontSize: 13, color: COLORS.whiteAlpha40, marginBottom: 14, lineHeight: 18 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadBtnIcon: { fontSize: 22 },
  uploadBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  uploadBtnSub: { color: COLORS.success, fontSize: 11, marginTop: 2 },
  tabsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(124,58,237,0.25)' },
  tabBtnText: { color: COLORS.whiteAlpha40, fontSize: 12, fontWeight: '700' },
  tabBtnTextActive: { color: '#FFF' },
  srtDropZone: {
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  srtDropTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  srtDropSub: { color: COLORS.whiteAlpha40, fontSize: 12, marginTop: 4 },
  jsonInput: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    padding: 14,
    height: 140,
    color: '#A78BFA',
    fontFamily: 'monospace',
    fontSize: 12,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  actionGrad: { padding: 18, alignItems: 'center' },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
