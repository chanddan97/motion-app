import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  // Animated gradient orbs
  const orb1Y = useSharedValue(0);
  const orb2Y = useSharedValue(0);
  const logoScale = useSharedValue(1);

  React.useEffect(() => {
    orb1Y.value = withRepeat(
      withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    orb2Y.value = withRepeat(
      withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb1Y.value }],
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb2Y.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View style={styles.container}>
      

      {/* Background Orbs */}
      <Animated.View style={[styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb2, orb2Style]} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoIcon}>M</Text>
            </LinearGradient>
          </Animated.View>
          <Text style={styles.appName}>Motion</Text>
          <Text style={styles.tagline}>Audio থেকে সুন্দর Video বানাও</Text>
        </View>

        {/* Main CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Input')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#7C3AED', '#4F46E5']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaIcon}>🎬</Text>
            <Text style={styles.ctaText}>নতুন Project শুরু করো</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Feature Cards */}
        <Text style={styles.sectionTitle}>কী কী করা যাবে</Text>
        <View style={styles.featuresGrid}>
          {features.map((f) => (
            <View key={f.id} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Template Preview */}
        <Text style={styles.sectionTitle}>20 Motion Templates</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateRow}>
          {templatePreviews.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.templatePreview, { backgroundColor: t.bg }]}
              onPress={() => navigation.navigate('Input')}
            >
              <Text style={styles.templateEmoji}>{t.emoji}</Text>
              <Text style={[styles.templateName, { color: t.text }]}>{t.name}</Text>
              <Text style={[styles.templateSample, { color: t.text }]}>Sample Text</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Start */}
        <View style={styles.quickStart}>
          <Text style={styles.quickTitle}>⚡ কিভাবে শুরু করবে</Text>
          {steps.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const features = [
  { id: 1, icon: '🎙️', title: 'Voice → SRT', desc: 'Audio record করো বা SRT upload করো' },
  { id: 2, icon: '🔄', title: 'Auto JSON', desc: 'AI ছাড়াই caption convert হয়' },
  { id: 3, icon: '🎨', title: '20 Templates', desc: '5 ক্যাটাগরিতে 20 unique style' },
  { id: 4, icon: '🖼️', title: 'Logo Add', desc: 'নিজের logo যেকোনো জায়গায়' },
  { id: 5, icon: '🔊', title: 'Sound Effects', desc: 'Auto SFX বা manual choice' },
  { id: 6, icon: '📤', title: 'Export', desc: 'Reel (9:16) বা YouTube (16:9)' },
];

const steps = [
  { title: 'Audio/SRT দাও', desc: 'Voice record করো বা SRT file upload করো' },
  { title: 'Template বেছে নাও', desc: '20টা motion design থেকে পছন্দেরটা নাও' },
  { title: 'Customize করো', desc: 'Logo, font, color, sound effects যোগ করো' },
  { title: 'Export করো', desc: 'MP4 video gallery-তে save হবে' },
];

const templatePreviews = [
  { id: 'fire', emoji: '🔥', name: 'Fire Punch', bg: '#1A0505', text: '#FF4500' },
  { id: 'gold', emoji: '✨', name: 'Gold Rush', bg: '#050300', text: '#FFD700' },
  { id: 'neon', emoji: '👾', name: 'Neon Cyber', bg: '#000308', text: '#FF00FF' },
  { id: 'cinema', emoji: '🎬', name: 'Cinema', bg: '#000000', text: '#FFFFFF' },
  { id: 'glitch', emoji: '🌀', name: 'Glitch', bg: '#050005', text: '#00FFFF' },
  { id: 'minimal', emoji: '⬜', name: 'Pure White', bg: '#FFFFFF', text: '#111111' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 20, paddingBottom: 60 },
  orb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    top: -100,
    right: -100,
  },
  orb2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    bottom: 100,
    left: -80,
  },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 32 },
  logoContainer: { marginBottom: 16 },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 36, fontWeight: '900', color: '#FFFFFF' },
  appName: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  tagline: { fontSize: 14, color: COLORS.whiteAlpha40, marginTop: 8, textAlign: 'center' },
  ctaButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 32 },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  ctaIcon: { fontSize: 22 },
  ctaText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  featureDesc: { fontSize: 12, color: COLORS.whiteAlpha40, lineHeight: 18 },
  templateRow: { marginBottom: 32 },
  templatePreview: {
    width: 140,
    height: 200,
    borderRadius: 16,
    marginRight: 12,
    padding: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  templateEmoji: { fontSize: 32, marginBottom: 8 },
  templateName: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  templateSample: { fontSize: 11, opacity: 0.7 },
  quickStart: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 14 },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  stepDesc: { fontSize: 13, color: COLORS.whiteAlpha40, lineHeight: 18 },
});
