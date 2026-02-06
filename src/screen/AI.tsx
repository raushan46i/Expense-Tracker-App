import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
  FlatList, Modal, LayoutAnimation, UIManager, StyleSheet, Animated, Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Contexts
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

// Services & Hooks
import { useSpendingPrediction } from '../hooks/useSpendingPrediction';
import { generateInsights } from '../services/insightsService';
import { detectAnomalies } from '../utils/anomalyDetector';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import HistoryModal from '../components/HistoryModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- 🔑 API CONFIGURATION ---
const API_KEY = 'your_api_key_here';
const MODEL_NAME = 'gemini-flash-latest';

interface Message { id: string; type: 'user' | 'ai'; text: string; }
interface HistoryEntry { id: number; question: string; answer: string; timestamp: string; }

// --- TYPING INDICATOR ---
const TypingIndicator = ({ color }: { color: string }) => {
  const [dot1] = useState(new Animated.Value(0.3));
  const [dot2] = useState(new Animated.Value(0.3));
  const [dot3] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 600, useNativeDriver: true, delay }),
          Animated.timing(dot, { toValue: 0.3, duration: 600, useNativeDriver: true })
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.dot, { backgroundColor: color, opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { backgroundColor: color, opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { backgroundColor: color, opacity: dot3 }]} />
    </View>
  );
};

// --- MAIN AI COMPONENT ---
const AI: React.FC = () => {
  const { expenses } = useExpenses();
  const { theme } = useTheme();
  const { formatAmount, currencies, baseCurrency } = useCurrency();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  type AIStatus = 'idle' | 'chat' | 'insights' | 'anomalies';
  const [aiStatus, setAiStatus] = useState<AIStatus>('idle');
  const [typingDots, setTypingDots] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: "Hey! I’m your spending assistant. Ask me anything about your expenses 👋"
    }
  ]);

  const { prediction } = useSpendingPrediction(expenses);
  const currencySymbol = currencies[baseCurrency].symbol;

  // --- TYPING DOT ANIMATION ---
  useEffect(() => {
    if (aiStatus === 'idle') {
      setTypingDots('');
      return;
    }

    const interval = setInterval(() => {
      setTypingDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(interval);
  }, [aiStatus]);

  // --- KEYBOARD SLIDE ANIMATION ---
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: false
      }).start();
    });

    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // --- GEMINI FETCH (unchanged logic) ---
  const fetchGeminiResponse = async (userQuestion: string) => {
    try {
      const expenseDataString = expenses.map(e => {
        const catName =
          typeof e.category === 'object' && e.category !== null && 'name' in e.category
            ? (e.category as { name: string }).name
            : e.category;

        return `- ${e.date}: ${e.title} (${catName}) - ${e.amount}`;
      }).join('\n');


      const prompt = `
You are a chill, funny financial buddy — keep it short and human.

User Currency: ${currencySymbol}
Expenses:
${expenseDataString}

User asked: "${userQuestion}"

Reply in 3–5 short lines max, casual tone, light emojis.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Couldn't get a response right now.";
    } catch {
      return "Network error — check your connection.";
    }
  };

  const handleSend = async () => {
    if (!query.trim()) return;
    const userText = query;
    setQuery('');

    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: userText }]);
    setLoading(true);
    setAiStatus('chat');

    const aiReply = await fetchGeminiResponse(userText);

    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'ai', text: aiReply }]);
    setLoading(false);
    setAiStatus('idle');
  };

  const handleQuickAction = async (type: string) => {
    if (loading) return;
    setLoading(true);

    let userQ = '';
    let aiA = '';

    if (type === 'insights') {
      userQ = 'Generate spending insights.';
      setAiStatus('insights');
      const tips = await generateInsights(expenses);
      aiA = tips.length ? tips.join('\n') : 'Your spending looks healthy!';
    } else {
      userQ = 'Check for anomalies.';
      setAiStatus('anomalies');
      const anomalies = await detectAnomalies(expenses);
      aiA = anomalies.length
        ? `⚠️ Unusual activity:\n${anomalies.join('\n')}`
        : '✅ No suspicious transactions.';
    }

    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: userQ }]);
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'ai', text: aiA }]);
    setLoading(false);
    setAiStatus('idle');
  };

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => scrollToBottom(), [messages, loading]);

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.type === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          {
            backgroundColor: isUser
              ? theme.colors.primary.start
              : theme.colors.background.secondary,
            alignSelf: isUser ? 'flex-end' : 'flex-start'
          }
        ]}
      >
        <Text style={[styles.messageText, { color: isUser ? '#fff' : theme.colors.text.primary }]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>

      {/* HEADER */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
              Financial AI
            </Text>

            {/* STATUS ROW */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={styles.statusDot} />
              <Text style={[styles.aiStatus, { color: theme.colors.text.tertiary, marginLeft: 6 }]}>
                {aiStatus === 'idle' && 'Online • ready to help'}
                {aiStatus === 'chat' && `Online • typing${typingDots}`}
                {aiStatus === 'insights' && `Online • analyzing insights${typingDots}`}
                {aiStatus === 'anomalies' && `Online • checking anomalies${typingDots}`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={[styles.historyBtn, { backgroundColor: theme.colors.background.secondary }]}
          >
            <Icon name="history" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[theme.colors.primary.start, theme.colors.primary.end]}
          style={styles.predictionCard}
        >
          <View>
            <Text style={styles.predictionLabel}>Projected Spend</Text>
            <Text style={styles.predictionAmount}>{formatAmount(prediction)}</Text>
          </View>
          <View style={styles.predictionIcon}>
            <Icon name="auto-graph" size={24} color="white" />
          </View>
        </LinearGradient>
      </View>

      {/* CHAT AREA */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 140
        }}
        ListFooterComponent={loading ? <TypingIndicator color={theme.colors.text.tertiary} /> : null}
      />

      {/* FLOATING INPUT BAR (WHATSAPP STYLE) */}
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border,
            transform: [{ translateY: keyboardOffset }]
          }
        ]}
      >
        <View style={styles.quickActions}>
          <TouchableOpacity
            onPress={() => handleQuickAction('insights')}
            style={[styles.quickChip, { borderColor: theme.colors.primary.start }]}
          >
            <Text style={{ color: theme.colors.primary.start }}>✨ Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleQuickAction('anomalies')}
            style={[styles.quickChip, { borderColor: theme.colors.danger.start }]}
          >
            <Text style={{ color: theme.colors.danger.start }}>⚠️ Anomalies</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <View
            style={[
              styles.textInputContainer,
              { backgroundColor: theme.colors.background.primary }
            ]}
          >
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Ask anything..."
              placeholderTextColor={theme.colors.text.tertiary}
              style={[styles.textInput, { color: theme.colors.text.primary }]}
            />
          </View>

          <TouchableOpacity onPress={handleSend} disabled={loading || !query.trim()}>
            <LinearGradient
              colors={[theme.colors.primary.start, theme.colors.primary.end]}
              style={styles.sendButton}
            >
              <Icon name="arrow-upward" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <HistoryModal visible={modalVisible} onClose={() => setModalVisible(false)} expenses={[]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  historyBtn: { padding: 8, borderRadius: 20 },

  predictionCard: {
    marginTop: 10,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  predictionLabel: { color: '#dbeafe', fontSize: 12, fontWeight: 'bold' },
  predictionAmount: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  predictionIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 20 },

  messageBubble: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '85%',
    borderRadius: 16
  },
  userBubble: { borderTopRightRadius: 2 },
  aiBubble: { borderTopLeftRadius: 2 },
  messageText: { fontSize: 16, lineHeight: 22 },

  typingContainer: { flexDirection: 'row', padding: 16, width: 60 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderTopWidth: 1,
    elevation: 10
  },
  quickActions: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  quickChip: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  textInputContainer: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12
  },
  textInput: { fontSize: 16 },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },

  aiStatus: { fontSize: 12 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C853'
  }
});

export default AI;
