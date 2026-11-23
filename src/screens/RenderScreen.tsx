import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');

interface RenderScreenProps {
  navigation: any;
  route: any;
}

export default function RenderScreen({ navigation, route }: RenderScreenProps) {
  const { captions, templateId, videoFormat } = route.params;
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Preparing...');
  const [done, setDone] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const stages = [
    { label: '⚙️ Caption engine চালু হচ্ছে...', pct: 10 },
    { label: '🎨 Template load হচ্ছে...', pct: 25 },
    { label: '🔊 Sound effects যোগ হচ্ছে...', pct: 40 },
    { label: '🖼️ Logo overlay হচ্ছে...', pct: 55 },
    { label: '🎬 Motion graphics render হচ্ছে...', pct: 70 },
    { label: '✂️ Frames compose হচ্ছে...', pct: 85 },
    { label: '📦 MP4 encode হচ্ছে...', pct: 95 },
    { label: '✅ Video তৈরি!', pct: 100 },
  ];

  useEffect(() => {
    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Simulate render stages
    let i = 0;
    const interval = setInterval(() => {
      if (i < stages.length) {
        const s = stages[i];
        setStage(s.label);
        setProgress(s.pct);
        Animated.timing(progressAnim, {
          toValue: s.pct / 100,
          duration: 400,
          useNativeDriver: false,
        }).start();
        i++;
        if (s.pct === 100) {
          clearInterval(interval);
          setTimeout(() => setDone(true), 600);
        }
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    Alert.alert(
      '🎉 Video Ready!',
      'Video আপনার Gallery-তে save হয়েছে। Share করুন!',
      [
        { text: 'নতুন Video', onPress: () => navigation.navigate('Home') },
        { text: 'OK' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Background animated gradient */}
      <LinearGradient
        colors={['#0A0A0F', '#13102A', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {!done ? (
          <>
            {/* Animated icon */}
            <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.iconGrad}>
                <Text style={styles.icon}>🎬</Text>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.title}>Rendering হচ্ছে...</Text>
            <Text style={styles.subtitle}>{captions.length}টা caption • {videoFormat.toUpperCase()}</Text>

            {/* Progress bar */}
            <View style={styles.progressWrap}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            <Text style={styles.percentage}>{progress}%</Text>
            <Text style={styles.stage}>{stage}</Text>

            <View style={styles.infoCards}>
              {[
                { icon: '🎨', label: 'Template', val: templateId.replace(/_/g, ' ') },
                { icon: '📐', label: 'Format', val: videoFormat === 'reel' ? '9:16 Reel' : '16:9 YouTube' },
                { icon: '📝', label: 'Captions', val: `${captions.length}টা` },
              ].map((item, i) => (
                <View key={i} style={styles.infoCard}>
                  <Text style={styles.infoIcon}>{item.icon}</Text>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoVal}>{item.val}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Done state */}
            <View style={styles.doneIcon}>
              <Text style={{ fontSize: 72 }}>🎉</Text>
            </View>
            <Text style={styles.doneTitle}>Video তৈরি!</Text>
            <Text style={styles.doneSub}>
              আপনার motion graphics video ready। Gallery-তে save হয়েছে।
            </Text>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.shareBtnGrad}>
                <Text style={styles.shareBtnText}>📤 Gallery-তে দেখো</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.newBtnText}>+ নতুন Video বানাও</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap: { marginBottom: 28 },
  iconGrad: { width: 100, height: 100, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 48 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.whiteAlpha40, marginBottom: 40 },
  progressWrap: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  percentage: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginBottom: 8 },
  stage: { fontSize: 14, color: COLORS.whiteAlpha40, textAlign: 'center', marginBottom: 40 },
  infoCards: { flexDirection: 'row', gap: 12 },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIcon: { fontSize: 22, marginBottom: 6 },
  infoLabel: { fontSize: 11, color: COLORS.whiteAlpha40, marginBottom: 4 },
  infoVal: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  doneIcon: { marginBottom: 24 },
  doneTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginBottom: 12 },
  doneSub: { fontSize: 15, color: COLORS.whiteAlpha40, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  shareBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  shareBtnGrad: { padding: 18, alignItems: 'center' },
  shareBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  newBtn: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  newBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.whiteAlpha80 },
});
