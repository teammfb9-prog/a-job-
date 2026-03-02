import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Globe, Sparkles, Loader2, User, Bot, Settings as SettingsIcon, X, Layout, Square, Paperclip, Image as ImageIcon, Copy, Check, Mic, MicOff, Briefcase, Plus, MessageSquare, MoreVertical, Edit2, Trash2, Pin, TextSelect, Menu } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { CodeBlock } from './components/CodeBlock';
import { AuthScreen } from './components/AuthScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { StartScreen } from './components/StartScreen';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type AttachedFile = {
  data: string;
  mimeType: string;
  name: string;
};

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  attachments?: AttachedFile[];
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  isPinned?: boolean;
};

type Language = 'ar' | 'en';
type View = 'start' | 'auth' | 'chat' | 'settings';

const translations = {
  ar: {
    title: 'A Job AI',
    subtitle: 'عمل',
    startSubtitle: 'مستقبلك الإبداعي بلا حدود',
    placeholder: 'اسألني أي شيء...',
    send: 'إرسال',
    emptyState: 'مرحباً بك',
    emptyStateSub: 'أنا هنا لمساعدتك. كيف يمكنني خدمتك اليوم؟',
    languageToggle: 'English',
    settings: 'الإعدادات',
    theme: 'المظهر',
    themeDesc: 'تبديل بين الوضع الليلي والنهاري',
    canvas: 'مساحة العمل (Canvas)',
    canvasDesc: 'عرض الأكواد البرمجية (HTML/UI) في نافذة معاينة',
    appearance: 'المظهر والتخصيص',
    aiPersonality: 'شخصية الذكاء الاصطناعي',
    aiPersonalityDesc: 'اختر الطريقة التي يتحدث بها الذكاء الاصطناعي معك',
    professional: 'احترافي',
    friendly: 'ودود ولطيف',
    silly: 'مرح وساخر',
    concise: 'موجز ومباشر',
    welcomeTitle: 'مرحباً بك في A Job AI',
    welcomeSub: 'سجل دخولك للبدء في استخدام المساعد الذكي',
    newChat: 'محادثة جديدة',
    rename: 'تغيير الاسم',
    delete: 'حذف',
    pin: 'تثبيت',
    unpin: 'إلغاء التثبيت',
    copy: 'نسخ',
    selectText: 'تحديد نص',
    shortcuts: {
      summarize: 'لخص لي',
      canvas: 'مساحة العمل',
      explainCode: 'اشرح الكود',
      writeEmail: 'اكتب بريد إلكتروني',
      translate: 'ترجمة',
      brainstorm: 'عصف ذهني'
    }
  },
  en: {
    title: 'A Job AI',
    subtitle: 'Work',
    startSubtitle: 'Your limitless creative universe',
    placeholder: 'Ask me anything...',
    send: 'Send',
    emptyState: 'Welcome',
    emptyStateSub: 'I am here to help you. How can I assist you today?',
    languageToggle: 'العربية',
    settings: 'Settings',
    theme: 'Theme',
    themeDesc: 'Toggle between light and dark mode',
    canvas: 'Canvas Workspace',
    canvasDesc: 'Preview UI/HTML code in a dedicated pane',
    appearance: 'Appearance & Customization',
    aiPersonality: 'AI Personality',
    aiPersonalityDesc: 'Choose how the AI talks to you',
    professional: 'Professional',
    friendly: 'Friendly & Mild',
    silly: 'Silly & Fun',
    concise: 'Concise & Direct',
    welcomeTitle: 'Welcome to A Job AI',
    welcomeSub: 'Login to start using your smart assistant',
    newChat: 'New Chat',
    rename: 'Rename',
    delete: 'Delete',
    pin: 'Pin',
    unpin: 'Unpin',
    copy: 'Copy',
    selectText: 'Select Text',
    shortcuts: {
      summarize: 'Summarize for me',
      canvas: 'Canvas',
      explainCode: 'Explain code',
      writeEmail: 'Write an email',
      translate: 'Translate',
      brainstorm: 'Brainstorm'
    }
  }
};

export default function App() {
  const [view, setView] = useState<View>('start');
  const [userName, setUserName] = useState('');
  const [lang, setLang] = useState<Language>('ar');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number } | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [textSelectionModal, setTextSelectionModal] = useState<string | null>(null);
  const [messageMenu, setMessageMenu] = useState<{ id: string, text: string, x: number, y: number } | null>(null);
  
  const [settings, setSettings] = useState({
    theme: 'light',
    canvasEnabled: true,
    responseStyle: 'professional'
  });
  
  const [activeCanvasCode, setActiveCanvasCode] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const currentChat = chats.find(c => c.id === currentChatId);
  const messages = currentChat?.messages || [];

  // Load chat history
  useEffect(() => {
    if (userName) {
      const saved = localStorage.getItem(`ajobai_chats_${userName}`);
      if (saved) {
        try {
          const parsedChats = JSON.parse(saved);
          setChats(parsedChats);
          if (parsedChats.length > 0) {
            setCurrentChatId(parsedChats[0].id);
          } else {
            createNewChat();
          }
        } catch (e) {
          console.error("Failed to load history");
          createNewChat();
        }
      } else {
        createNewChat();
      }
    }
  }, [userName]);

  // Save chat history
  useEffect(() => {
    if (userName && chats.length > 0) {
      localStorage.setItem(`ajobai_chats_${userName}`, JSON.stringify(chats));
    }
  }, [chats, userName]);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput(prev => prev + transcript + ' ');
          } else {
            currentTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          alert(lang === 'ar' ? 'يرجى السماح بالوصول إلى الميكروفون لاستخدام هذه الميزة.' : 'Please allow microphone access to use this feature.');
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.error("Error stopping recognition", e);
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error("Error starting recognition", e);
          setIsListening(false);
        }
      } else {
        alert(isRtl ? 'التعرف على الصوت غير مدعوم في هذا المتصفح' : 'Speech recognition is not supported in this browser');
      }
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const handleLogin = (name: string) => {
    setUserName(name);
    setView('chat');
  };

  const handleLogout = () => {
    setUserName('');
    setChats([]);
    setCurrentChatId(null);
    setView('start');
  };

  const handleClearHistory = () => {
    if (userName) {
      localStorage.removeItem(`ajobai_chats_${userName}`);
      setChats([]);
      createNewChat();
    }
  };

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: isRtl ? 'محادثة جديدة' : 'New Chat',
      messages: [],
      updatedAt: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const updateCurrentChatMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = typeof newMessages === 'function' ? newMessages(chat.messages) : newMessages;
        // Auto-generate title from first message if it's still default
        let newTitle = chat.title;
        if (updatedMessages.length === 1 && updatedMessages[0].role === 'user' && chat.title === (isRtl ? 'محادثة جديدة' : 'New Chat')) {
          newTitle = updatedMessages[0].text.substring(0, 30) + (updatedMessages[0].text.length > 30 ? '...' : '');
        }
        return { ...chat, messages: updatedMessages, updatedAt: Date.now(), title: newTitle };
      }
      return chat;
    }));
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const handleShortcut = (shortcutText: string) => {
    setInput(shortcutText + ' ');
    textareaRef.current?.focus();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setMessageMenu(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, {
          data: reader.result as string,
          mimeType: file.type,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    if (isListening) {
      toggleListening();
    }

    const userText = input.trim();
    const currentAttachments = [...attachments];
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: userText, attachments: currentAttachments };
    updateCurrentChatMessages(prev => [...prev, newUserMsg]);

    const modelMsgId = (Date.now() + 1).toString();
    updateCurrentChatMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isStreaming: true }]);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const contents = messages.map(msg => {
        const parts: any[] = [];
        if (msg.attachments) {
          msg.attachments.forEach(a => {
            parts.push({
              inlineData: {
                data: a.data.split(',')[1],
                mimeType: a.mimeType
              }
            });
          });
        }
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        return { role: msg.role, parts };
      });

      const newParts: any[] = [];
      if (currentAttachments.length > 0) {
        currentAttachments.forEach(a => {
          newParts.push({
            inlineData: {
              data: a.data.split(',')[1],
              mimeType: a.mimeType
            }
          });
        });
      }
      if (userText) {
        newParts.push({ text: userText });
      }
      
      contents.push({ role: 'user', parts: newParts });

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: `You are A Job AI, a professional AI assistant. You must communicate in ${lang === 'ar' ? 'Arabic' : 'English'}.
CRITICAL RULES:
1. Answer directly and to the point. Do NOT introduce yourself unless explicitly asked.
2. Do NOT list your capabilities unless specifically asked.
3. No traditional emojis. Use clean text.
4. Provide complete, self-contained HTML/CSS/JS code blocks if the user asks for UI components.
5. Your personality and response style is currently set to: ${settings.responseStyle}. Adapt your tone accordingly.
6. You CANNOT generate, create, or output images. If asked to generate an image, you MUST reply ONLY with: "${lang === 'ar' ? 'عذراً، لا يمكنني إنشاء الصور. هل يمكنني مساعدتك بشيء آخر؟' : 'Sorry, I cannot generate images. Can I help you with something else?'}"`,
        }
      });
      
      let fullText = '';
      for await (const chunk of responseStream) {
        if (controller.signal.aborted) break;
        fullText += chunk.text;
        updateCurrentChatMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: fullText } : msg
        ));
      }
      
      updateCurrentChatMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
      ));
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error("Error generating response:", error);
        updateCurrentChatMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: "Sorry, an error occurred while processing your request.", isStreaming: false } : msg
        ));
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    setContextMenu({ id: chatId, x: e.clientX, y: e.clientY });
  };

  const handleMessageClick = (e: React.MouseEvent, msg: Message) => {
    if (msg.role === 'model' && !msg.isStreaming) {
      setMessageMenu({ id: msg.id, text: msg.text, x: e.clientX, y: e.clientY });
    }
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setMessageMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  if (view === 'start') {
    return <StartScreen onNavigate={setView} onGoogleLogin={handleLogin} t={t} isRtl={isRtl} />;
  }

  if (view === 'auth') {
    return <AuthScreen onLogin={handleLogin} onBack={() => setView('start')} t={t} isRtl={isRtl} />;
  }

  if (view === 'settings') {
    return <SettingsScreen 
      onBack={() => setView('chat')} 
      settings={settings} 
      setSettings={setSettings} 
      t={t} 
      isRtl={isRtl} 
      userName={userName}
      onLogout={handleLogout}
      onClearHistory={handleClearHistory}
    />;
  }

  return (
    <div className={cn("flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300", isRtl ? "rtl" : "ltr")} dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-none h-full bg-[var(--muted)] border-r border-[var(--border)] rtl:border-l rtl:border-r-0 flex flex-col z-30 overflow-hidden"
          >
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <button 
                onClick={createNewChat}
                className="flex-1 flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-fg)] px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                {t.newChat}
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 ml-2 lg:hidden rounded-lg hover:bg-[var(--border)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sortedChats.map(chat => (
                <div 
                  key={chat.id}
                  onContextMenu={(e) => handleContextMenu(e, chat.id)}
                  className="relative"
                >
                  {editingChatId === chat.id ? (
                    <div className="flex items-center gap-2 p-2 bg-[var(--bg)] rounded-xl border border-[var(--accent)]">
                      <input 
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => {
                          setChats(prev => prev.map(c => c.id === chat.id ? { ...c, title: editTitle || c.title } : c));
                          setEditingChatId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setChats(prev => prev.map(c => c.id === chat.id ? { ...c, title: editTitle || c.title } : c));
                            setEditingChatId(null);
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none text-sm"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => { setCurrentChatId(chat.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl text-left rtl:text-right transition-colors group",
                        currentChatId === chat.id ? "bg-[var(--bg)] shadow-sm border border-[var(--border)]" : "hover:bg-[var(--border)]/50 border border-transparent"
                      )}
                    >
                      <MessageSquare className={cn("w-4 h-4 flex-none", chat.isPinned ? "text-[var(--accent)]" : "text-[var(--muted-fg)]")} />
                      <span className="flex-1 truncate text-sm font-medium">{chat.title}</span>
                      {chat.isPinned && <Pin className="w-3 h-3 text-[var(--accent)] flex-none" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu for Sidebar */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 w-48 bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                setChats(prev => prev.map(c => c.id === contextMenu.id ? { ...c, isPinned: !c.isPinned } : c));
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--muted)] text-left rtl:text-right"
            >
              <Pin className="w-4 h-4" />
              {chats.find(c => c.id === contextMenu.id)?.isPinned ? t.unpin : t.pin}
            </button>
            <button 
              onClick={() => {
                setEditTitle(chats.find(c => c.id === contextMenu.id)?.title || '');
                setEditingChatId(contextMenu.id);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--muted)] text-left rtl:text-right"
            >
              <Edit2 className="w-4 h-4" />
              {t.rename}
            </button>
            <div className="h-px bg-[var(--border)] my-1" />
            <button 
              onClick={() => {
                setChats(prev => prev.filter(c => c.id !== contextMenu.id));
                if (currentChatId === contextMenu.id) setCurrentChatId(null);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-500/10 text-red-500 text-left rtl:text-right"
            >
              <Trash2 className="w-4 h-4" />
              {t.delete}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Context Menu */}
      <AnimatePresence>
        {messageMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: messageMenu.y, left: messageMenu.x }}
            className="fixed z-50 w-48 bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => handleCopy(messageMenu.text, messageMenu.id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--muted)] text-left rtl:text-right"
            >
              <Copy className="w-4 h-4" />
              {t.copy}
            </button>
            <button 
              onClick={() => {
                setTextSelectionModal(messageMenu.text);
                setMessageMenu(null);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--muted)] text-left rtl:text-right"
            >
              <TextSelect className="w-4 h-4" />
              {t.selectText}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Selection Modal */}
      <AnimatePresence>
        {textSelectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-[var(--bg)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h3 className="font-bold">{t.selectText}</h3>
                <button onClick={() => setTextSelectionModal(null)} className="p-2 rounded-full hover:bg-[var(--muted)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 select-text">
                <p className="whitespace-pre-wrap leading-relaxed">{textSelectionModal}</p>
              </div>
              <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)] text-sm text-[var(--muted-fg)] text-center">
                {isRtl ? 'قم بتحديد النص الذي تريده ثم انسخه' : 'Select the text you want and copy it'}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Pane */}
      <div className={cn("flex flex-col h-full transition-all duration-300", activeCanvasCode ? "w-full lg:w-1/2 border-x border-[var(--border)]" : "flex-1 w-full")}>
        {/* Header */}
        <header className="flex-none flex items-center justify-between px-4 md:px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-[var(--muted)]">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
              <Briefcase className="w-5 h-5 text-[var(--accent-fg)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--accent)]">{t.title}</h1>
              <p className="text-xs text-[var(--muted-fg)] font-medium">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('settings')}
              className="p-2 rounded-full border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] hover:bg-[var(--muted)] transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{t.languageToggle}</span>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--accent)]">{t.emptyState}, {userName}</h2>
                <p className="text-lg text-[var(--muted-fg)] max-w-md mb-12">{t.emptyStateSub}</p>
                
                <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                  {Object.entries(t.shortcuts).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleShortcut(label)}
                      className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-sm font-medium shadow-sm"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 max-w-[90%]",
                    msg.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                  )}
                >
                  <div className={cn(
                    "flex-none w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm",
                    msg.role === 'user' ? "bg-[var(--bubble-user)] text-[var(--bubble-user-fg)]" : "bg-[var(--muted)] text-[var(--accent)] border border-[var(--border)]"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  </div>
                  <div 
                    onClick={(e) => handleMessageClick(e, msg)}
                    className={cn(
                      "px-5 py-4 rounded-2xl shadow-sm flex flex-col gap-3 relative group cursor-pointer",
                      msg.role === 'user' 
                        ? "bg-[var(--bubble-user)] text-[var(--bubble-user-fg)] rounded-tr-sm" 
                        : "bg-[var(--bubble-model)] border border-[var(--border)] text-[var(--bubble-model-fg)] rounded-tl-sm hover:border-[var(--accent)]/30 transition-colors"
                    )}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.attachments.map((file, i) => (
                          <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-black/10 border border-white/10">
                            {file.mimeType.startsWith('image/') && file.data ? (
                              <img src={file.data} alt="attachment" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-mono">
                                {file.name.split('.').pop()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.role === 'model' ? (
                      msg.text === '' && msg.isStreaming ? (
                        <div className="flex items-center gap-1.5 h-6 px-2">
                          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="markdown-body" onClick={(e) => e.stopPropagation()}>
                            <Markdown
                              components={{
                                pre(props: any) {
                                  const { children } = props;
                                  const childArray = React.Children.toArray(children);
                                  if (childArray.length === 1 && React.isValidElement(childArray[0]) && childArray[0].type === 'code') {
                                    const codeElement = childArray[0];
                                    const { className, children: codeChildren } = codeElement.props as any;
                                    const match = /language-(\w+)/.exec(className || '');
                                    return (
                                      <CodeBlock 
                                        language={match ? match[1] : ''} 
                                        code={String(codeChildren).replace(/\n$/, '')}
                                        onOpenCanvas={setActiveCanvasCode}
                                        canvasEnabled={settings.canvasEnabled}
                                      />
                                    );
                                  }
                                  return <pre {...props} />;
                                },
                                code({ className, children, ...props }: any) {
                                  return <code className={cn("bg-[var(--border)] text-[var(--fg)] px-1.5 py-0.5 rounded font-mono text-sm", className)} {...props}>{children}</code>;
                                },
                                img(props: any) {
                                  return <img {...props} className="rounded-xl max-w-full h-auto shadow-md my-4" referrerPolicy="no-referrer" />;
                                }
                              }}
                            >
                              {msg.text}
                            </Markdown>
                            {msg.isStreaming && <span className="inline-block w-2 h-4 bg-[var(--accent)] ml-1 animate-pulse" />}
                          </div>
                          {!msg.isStreaming && (
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(msg.text, msg.id);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--muted)] text-xs text-[var(--muted-fg)] transition-colors"
                              >
                                {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedId === msg.id ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الرد' : 'Copy Response')}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer className="flex-none p-4 md:p-6 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent">
          <div className="max-w-4xl mx-auto relative">
            <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 bg-[var(--muted)] border border-[var(--border)] rounded-3xl p-2 shadow-lg focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
              
              {attachments.length > 0 && (
                <div className="flex gap-2 p-2 overflow-x-auto border-b border-[var(--border)]">
                  {attachments.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg bg-[var(--bg)] border border-[var(--border)] overflow-hidden flex-none">
                      {file.mimeType.startsWith('image/') && file.data ? (
                        <img src={file.data} alt="attachment" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted-fg)] text-xs font-mono">
                          {file.name.split('.').pop()}
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={() => setAttachments(prev => prev.filter((_, index) => index !== i))}
                        className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2 w-full">
                <div className="flex items-center gap-1 px-2 pb-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    multiple 
                  />
                  <input 
                    type="file" 
                    ref={imageInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/*" 
                    className="hidden" 
                    multiple 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-[var(--muted-fg)] hover:text-[var(--accent)] hover:bg-[var(--border)] rounded-full transition-colors"
                    title={isRtl ? "إرفاق ملف" : "Attach file"}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 text-[var(--muted-fg)] hover:text-[var(--accent)] hover:bg-[var(--border)] rounded-full transition-colors"
                    title={isRtl ? "إرفاق صورة" : "Attach image"}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={toggleListening}
                    className={cn("p-2 rounded-full transition-colors", isListening ? "text-red-500 bg-red-500/10 animate-pulse" : "text-[var(--muted-fg)] hover:text-[var(--accent)] hover:bg-[var(--border)]")}
                    title={isRtl ? "إدخال صوتي" : "Voice input"}
                  >
                    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={isListening ? (isRtl ? 'جاري الاستماع...' : 'Listening...') : t.placeholder}
                  className="w-full max-h-32 min-h-[44px] bg-transparent border-none outline-none resize-none py-3 px-2 text-sm md:text-base placeholder:text-[var(--muted-fg)]"
                  rows={1}
                  dir="auto"
                />
                
                {isLoading ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex-none w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-md mb-1 mr-1"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={(!input.trim() && attachments.length === 0) || isListening}
                    className="flex-none w-11 h-11 rounded-full bg-[var(--send-btn)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-md mb-1 mr-1"
                  >
                    <Send className={cn("w-5 h-5", isRtl ? "rotate-180" : "")} />
                  </button>
                )}
              </div>
            </form>
            <div className="text-center mt-3">
              <p className="text-[10px] text-[var(--muted-fg)] font-mono tracking-wider uppercase">Powered by Gemini 3 Flash</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Canvas Pane */}
      {activeCanvasCode && (
        <div className="hidden lg:flex w-1/2 h-full flex-col bg-[var(--muted)] border-l border-[var(--border)] shadow-2xl z-20">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg)]">
            <h3 className="font-medium flex items-center gap-2 text-sm text-[var(--accent)]">
              <Layout className="w-4 h-4" />
              {t.canvas}
            </h3>
            <button 
              onClick={() => setActiveCanvasCode(null)}
              className="p-1.5 rounded-full hover:bg-[var(--border)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-hidden bg-[var(--bg)]">
            <div className="w-full h-full bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
              <iframe 
                srcDoc={activeCanvasCode} 
                className="w-full h-full border-none" 
                sandbox="allow-scripts allow-same-origin"
                title="Canvas Preview"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
