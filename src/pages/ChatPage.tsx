import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, HelpCircle, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { conversationTopics } from '../data/mockData';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  pronunciation?: string;
}

const ChatPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiResponses: Record<string, string[]> = {
    'ordering-food': [
      "Bore da! Beth hoffech chi archebu heddiw? (Good morning! What would you like to order today?)",
      "Ardderchog! Hoffech chi rywbeth i yfed hefyd? (Excellent! Would you like something to drink as well?)",
      "Mae'r bwyd yn flasus iawn yma. (The food is very delicious here.)",
      "Faint yw'r bil, os gwelwch yn dda? (How much is the bill, please?)",
    ],
    'asking-directions': [
      "Croeso! Sut alla i'ch helpu chi? (Welcome! How can I help you?)",
      "Mae'r siop yn syth ymlaen ac yna i'r dde. (The shop is straight ahead and then to the right.)",
      "Ydych chi'n gwybod pa mor bell yw e? (Do you know how far it is?)",
      "Mae'n cymryd tua deg munud i gerdded yno. (It takes about ten minutes to walk there.)",
    ],
    'casual-chat': [
      "Helo! Sut mae pethau heddiw? (Hello! How are things today?)",
      "Mae'r tywydd yn braf heddiw, on'd yw e? (The weather is nice today, isn't it?)",
      "Beth ydych chi'n hoffi wneud yn eich amser rhydd? (What do you like to do in your free time?)",
      "Mae'n braf siarad Cymraeg gyda chi! (It's nice to speak Welsh with you!)",
    ],
    'default': [
      "Ardderchog! Rydych chi'n gwneud yn dda. (Excellent! You're doing well.)",
      "Da iawn! Mae eich Cymraeg yn gwella. (Very good! Your Welsh is improving.)",
      "Beth am roi cynnig ar frawddeg arall? (How about trying another sentence?)",
      "Rwy'n falch o'ch gweld chi'n dysgu Cymraeg! (I'm pleased to see you learning Welsh!)",
    ]
  };

  const startConversation = (topicId: string) => {
    setSelectedTopic(topicId);
    setMessages([]);
    
    const topic = conversationTopics.find(t => t.id === topicId);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: `Croeso! Let's practice ${topic?.title.toLowerCase()}. I'll help you learn through conversation. Feel free to ask questions anytime!`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
    };
    
    setMessages([welcomeMessage]);
    
    // Add first scenario message
    setTimeout(() => {
      const responses = aiResponses[topicId] || aiResponses.default;
      const firstResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[0],
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, firstResponse]);
    }, 1000);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responses = selectedTopic ? aiResponses[selectedTopic] || aiResponses.default : aiResponses.default;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Update conversation minutes
      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: { conversationMinutes: state.userProgress.conversationMinutes + 1 }
      });
    }, 1500);
  };

  const playPronunciation = (text: string) => {
    console.log(`Playing pronunciation for: ${text}`);
    // In real app would use Text-to-Speech API
  };

  const resetConversation = () => {
    setMessages([]);
    setSelectedTopic(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (!selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Conversation Practice</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a topic to start practicing Welsh conversation with our AI tutor
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {conversationTopics.map(topic => {
            const IconComponent = ({ className }: { className?: string }) => {
              // Simple icon mapping for the mock data
              const iconMap: Record<string, string> = {
                'utensils': '🍽️',
                'map-pin': '📍',
                'shopping-bag': '🛍️',
                'coffee': '☕',
                'castle': '🏰',
                'briefcase': '💼',
              };
              return <span className={className}>{iconMap[topic.icon] || '💬'}</span>;
            };

            return (
              <button
                key={topic.id}
                onClick={() => startConversation(topic.id)}
                className="bg-white dark:bg-welsh-slate-800 border border-gray-200 dark:border-welsh-slate-700 rounded-xl p-6 text-left hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      <IconComponent />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {topic.title}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                        {topic.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {topic.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-12 bg-gradient-to-br from-welsh-green-50 to-welsh-orange-50 dark:from-welsh-green-900/20 dark:to-welsh-orange-900/20 rounded-xl p-6 border border-welsh-green-200 dark:border-welsh-green-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            How AI Conversation Works
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-center space-x-3">
              <span className="text-welsh-green-600">✓</span>
              <span>Adaptive difficulty based on your responses</span>
            </li>  
            <li className="flex items-center space-x-3">
              <span className="text-welsh-green-600">✓</span>
              <span>Real-time grammar corrections and suggestions</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="text-welsh-green-600">✓</span>
              <span>Cultural context and pronunciation guidance</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="text-welsh-green-600">✓</span>
              <span>Progress tracking and personalized feedback</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-welsh-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-welsh-green-500 to-welsh-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Welsh Tutor</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {conversationTopics.find(t => t.id === selectedTopic)?.title}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {/* Help modal would open */}}
            className="p-2 hover:bg-gray-100 dark:hover:bg-welsh-slate-700 rounded-lg transition-colors"
          >
            <HelpCircle size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={resetConversation}
            className="p-2 hover:bg-gray-100 dark:hover:bg-welsh-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-welsh-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-welsh-slate-700 p-4 mb-4">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-welsh-green-600 text-white'
                    : 'bg-gray-100 dark:bg-welsh-slate-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.sender === 'ai' && (
                  <div className="flex items-center justify-end mt-2 space-x-2">
                    <button
                      onClick={() => playPronunciation(message.text)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-welsh-slate-600 rounded transition-colors"
                    >
                      <Volume2 size={14} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-welsh-slate-700 px-4 py-3 rounded-2xl max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-welsh-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-welsh-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-welsh-slate-700 rounded-lg transition-colors">
            <Mic size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message in Welsh or English..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="p-2 bg-welsh-green-600 hover:bg-welsh-green-700 disabled:bg-gray-300 dark:disabled:bg-welsh-slate-600 text-white rounded-lg transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;