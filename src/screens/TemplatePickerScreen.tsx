import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'react-native-linear-gradient';
import { TEMPLATES, TEMPLATE_CATEGORIES, COLORS } from '../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

interface TemplatePickerProps {
  navigation: any;
  route: any;
}

export default function TemplatePicker({ navigation, route }: TemplatePickerProps) {
  const { captions } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('fire_punch');

  const filtered =
    selectedCategory === 'all'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleSelect = (id: string) => {
    setSelectedTemplate(id);
  };

  const handleNext = () => {
    navigation.navigate('Customize', {
      captions,
      templateId: selectedTemplate,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Template বেছে নাও</Text>
          <Text style={styles.headerSub}>{captions.length}টা caption ready</Text>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.nextGrad}>
            <Text style={styles.nextText}>পরের →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View>
        <FlatList
          data={TEMPLATE_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, selectedCategory === item.id && styles.tabActive]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={styles.tabEmoji}>{item.emoji}</Text>
              <Text style={[styles.tabLabel, selectedCategory === item.id && styles.tabLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Templates Grid */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TemplateCard
            template={item}
            selected={selectedTemplate === item.id}
            onSelect={() => handleSelect(item.id)}
          />
        )}
      />
    </View>
  );
}

function TemplateCard({ template, selected, onSelect }: any) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onSelect();
  };

  return (
    <Animated.View style={[animStyle, { width: CARD_WIDTH }]}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.card,
          { backgroundColor: template.preview.bg },
          selected && styles.cardSelected,
        ]}
        activeOpacity={0.9}
      >
        {selected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedCheck}>✓</Text>
          </View>
        )}
        <Text style={styles.cardEmoji}>{template.emoji}</Text>
        <View style={styles.cardBottom}>
          <Text style={[styles.cardName, { color: template.preview.text }]}>
            {template.name}
          </Text>
          <Text style={[styles.cardSample, { color: template.preview.text }]}>
            Caption Text
          </Text>
          <Text style={styles.cardDesc}>{template.description}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: COLORS.whiteAlpha40, marginTop: 2 },
  nextBtn: { borderRadius: 12, overflow: 'hidden' },
  nextGrad: { paddingHorizontal: 18, paddingVertical: 10 },
  nextText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  tabs: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabEmoji: { fontSize: 14 },
  tabLabel: { fontSize: 13, color: COLORS.whiteAlpha40, fontWeight: '600' },
  tabLabelActive: { color: '#FFFFFF' },
  grid: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { gap: 12, marginBottom: 12 },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: { borderColor: COLORS.primaryLight },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  selectedCheck: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  cardEmoji: { fontSize: 36 },
  cardBottom: {},
  cardName: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  cardSample: { fontSize: 13, fontWeight: '600', marginBottom: 6, opacity: 0.8 },
  cardDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 15 },
});
