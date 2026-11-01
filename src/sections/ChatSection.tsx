import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChatContact,
  ChatMessage,
  ChatGroup,
  FriendRequest,
  MessageType,
} from '../types';
import {
  MessageCircle,
  Send,
  Phone,
  Video,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  ChevronLeft,
  Search,
  UserPlus,
  Users,
  ShieldCheck,
  X,
  FileText,
  Play,
  Pause,
  PhoneOff,
  VideoOff,
  Sparkles,
  AlertCircle,
  MapPin,
  Lock,
} from 'lucide-react';

const COUNTRY_DIAL_CODES = [
  { code: '+242', country: 'Congo-Brazzaville' },
  { code: '+243', country: 'RDC (Kinshasa)' },
  { code: '+237', country: 'Cameroun' },
  { code: '+241', country: 'Gabon' },
  { code: '+33', country: 'France' },
  { code: '+1', country: 'États-Unis / Canada' },
  { code: '+225', country: 'Côte d’Ivoire' },
  { code: '+221', country: 'Sénégal' },
];

export const ChatSection: React.FC = () => {
  const {
    userProfile,
    verifyPhoneNumber,
    updateUserPhone,
    contacts,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    chatGroups,
    createChatGroup,
    activeContactId,
    setActiveContactId,
    messages,
    sendMessage,
    activeCall,
    startCall,
    endCall,
    toggleCallMute,
    toggleCallVideo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'contacts'>('chats');
  const [showConversationMobile, setShowConversationMobile] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Modals
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showSmsVerificationModal, setShowSmsVerificationModal] = useState(false);

  // Add friend form
  const [addMethod, setAddMethod] = useState<'phone' | 'handle'>('phone');
  const [dialCode, setDialCode] = useState('+242');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [handleInput, setHandleInput] = useState('');
  const [addFeedback, setAddFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Group creation form
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Phone SMS verification form
  const [smsPhone, setSmsPhone] = useState(userProfile.phone || '+242 06 912 34 56');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [smsError, setSmsError] = useState('');

  // Voice note recording with MediaRecorder
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Active call camera stream
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find active contact or group
  const activeContact = contacts.find((c) => c.id === activeContactId);
  const activeGroup = chatGroups.find((g) => g.id === activeContactId);
  const currentMessages = messages[activeContactId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Handle local video camera feed during video calls
  useEffect(() => {
    if (activeCall.isActive && activeCall.type === 'video' && !activeCall.isVideoOff) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setCameraStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Accès caméra limité :', err);
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeCall.isActive, activeCall.type, activeCall.isVideoOff]);

  // Voice Recording Functions
  const handleStartVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const voiceUrl = URL.createObjectURL(audioBlob);
        sendMessage(activeContactId, {
          text: 'Message vocal',
          type: 'voice',
          mediaUrl: voiceUrl,
          voiceDuration: recordingSeconds || 3,
        });
        stream.getTracks().forEach((track) => track.stop());
        setIsRecordingVoice(false);
        setRecordingSeconds(0);
      };

      recorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Veuillez autoriser l’accès au microphone pour envoyer un message vocal.');
    }
  };

  const handleStopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current.stop();
    }
  };

  const handleCancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecordingVoice(false);
      setRecordingSeconds(0);
    }
  };

  // Media file send handler (photo, video, document)
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: MessageType) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      sendMessage(activeContactId, {
        text: file.name,
        type,
        mediaUrl: fileUrl,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' Mo',
      });
      setShowAttachmentMenu(false);
    }
  };

  // Text message send
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(activeContactId, {
      text: inputMessage.trim(),
      type: 'text',
    });
    setInputMessage('');
  };

  // Add friend handler
  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = addMethod === 'phone' ? `${dialCode} ${phoneNumberInput}` : handleInput;
    const res = sendFriendRequest(target);
    if (res.success) {
      setAddFeedback({ type: 'success', msg: res.message });
      setPhoneNumberInput('');
      setHandleInput('');
      setTimeout(() => {
        setAddFeedback(null);
        setShowAddFriendModal(false);
      }, 1800);
    } else {
      setAddFeedback({ type: 'error', msg: res.message });
    }
  };

  // Create Group handler
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    const newG = createChatGroup(groupName.trim(), selectedMemberIds, groupDescription.trim());
    setActiveContactId(newG.id);
    setShowConversationMobile(true);
    setShowCreateGroupModal(false);
    setGroupName('');
    setGroupDescription('');
    setSelectedMemberIds([]);
  };

  // SMS Verification
  const handleRequestSmsCode = () => {
    updateUserPhone(smsPhone);
    setSmsSent(true);
    setSmsCode('242789'); // Demo instantaneous SMS code
    setSmsError('');
  };

  const handleVerifySmsCode = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyPhoneNumber(smsCode);
    if (success) {
      setShowSmsVerificationModal(false);
      setSmsSent(false);
    } else {
      setSmsError('Code à 6 chiffres invalide. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] px-4 pt-2 pb-4 animate-fade-in relative">
      {/* If viewing active conversation on mobile */}
      {showConversationMobile ? (
        <div className="flex flex-col h-full">
          {/* Conversation Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-sky-500/20 bg-[#030817]">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setShowConversationMobile(false)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                aria-label="Retour"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <img
                  src={activeGroup ? activeGroup.avatar : activeContact?.avatar || userProfile.avatar}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-sky-400"
                />
                {!activeGroup && (
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#030817] ${
                      activeContact?.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white font-brand truncate">
                  {activeGroup ? activeGroup.name : activeContact?.name || 'Contact'}
                </h3>
                <span className="text-[10px] text-emerald-400 block truncate">
                  {activeGroup
                    ? `${activeGroup.memberIds.length + 1} membres`
                    : activeContact?.city ? `${activeContact.city} · En ligne` : 'En ligne'}
                </span>
              </div>
            </div>

            {/* Audio & Video Call buttons */}
            <div className="flex items-center gap-1.5 text-slate-300 shrink-0">
              {activeContact && (
                <>
                  <button
                    onClick={() => startCall(activeContact, 'audio')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 hover:bg-[#1677FF] hover:text-white transition-all shadow-sm active:scale-95"
                    title="Appel Audio"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startCall(activeContact, 'video')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-slate-950 transition-all shadow-sm active:scale-95"
                    title="Appel Vidéo"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1 py-1">
            {currentMessages.map((m) => {
              const isSelf = m.isSelf;
              return (
                <div key={m.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                  {!isSelf && activeGroup && (
                    <span className="text-[9px] text-slate-400 ml-2 mb-0.5">{m.senderName}</span>
                  )}

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isSelf
                        ? 'bg-gradient-to-r from-[#1677FF] to-[#0284C7] text-white rounded-br-xs shadow-md'
                        : 'bg-slate-900/90 text-slate-100 rounded-bl-xs border border-sky-500/20'
                    }`}
                  >
                    {/* Voice Message rendering */}
                    {m.type === 'voice' && m.mediaUrl ? (
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <audio src={m.mediaUrl} controls className="w-48 h-8 rounded-lg" />
                        <span className="text-[10px] font-mono">{m.voiceDuration || 3}s</span>
                      </div>
                    ) : m.type === 'image' && m.mediaUrl ? (
                      /* Image Message */
                      <div className="space-y-1">
                        <img
                          src={m.mediaUrl}
                          alt="Image partagée"
                          className="rounded-xl max-h-52 w-full object-cover"
                        />
                        {m.text && <p className="text-[11px] mt-1">{m.text}</p>}
                      </div>
                    ) : m.type === 'video' && m.mediaUrl ? (
                      /* Video Message */
                      <video src={m.mediaUrl} controls className="rounded-xl max-h-48 w-full" />
                    ) : m.type === 'document' ? (
                      /* Document Message */
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/30">
                        <FileText className="w-5 h-5 text-sky-300" />
                        <div className="truncate">
                          <span className="font-semibold block truncate text-[11px]">
                            {m.fileName || m.text}
                          </span>
                          <span className="text-[9px] text-slate-300 font-mono">{m.fileSize}</span>
                        </div>
                      </div>
                    ) : (
                      /* Standard Text Message */
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    )}

                    {/* Timestamp & Read Receipts */}
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        isSelf ? 'text-sky-200' : 'text-slate-400'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {isSelf && (
                        m.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Emoji Reactions */}
          <div className="flex items-center gap-1.5 py-1">
            {['✨', '🇨🇬', '🚀', '🔥', '👍', '📚', '💡'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setInputMessage((prev) => prev + emoji)}
                className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-xs transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Voice Recording Active Bar */}
          {isRecordingVoice ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-950/70 border border-rose-500/50 animate-pulse">
              <div className="flex items-center gap-2 text-rose-300 text-xs">
                <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
                <span className="font-bold">Enregistrement vocal : {recordingSeconds}s</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelVoiceRecording}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-300 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleStopVoiceRecording}
                  className="px-3 py-1 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md"
                >
                  Envoyer
                </button>
              </div>
            </div>
          ) : (
            /* Standard Input Bar */
            <form onSubmit={handleSendText} className="relative flex items-center gap-1.5 mt-1">
              {/* Attachment Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sky-400 hover:text-white transition-colors"
                  title="Joindre un fichier"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {showAttachmentMenu && (
                  <div className="absolute bottom-12 left-0 w-44 bg-[#071330] border border-sky-500/40 rounded-2xl p-2 shadow-2xl z-40 space-y-1">
                    <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-xs text-white cursor-pointer">
                      <ImageIcon className="w-4 h-4 text-sky-400" />
                      <span>Photo / Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleMediaUpload(e, 'image')}
                      />
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-xs text-white cursor-pointer">
                      <Video className="w-4 h-4 text-purple-400" />
                      <span>Vidéo courte</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleMediaUpload(e, 'video')}
                      />
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-xs text-white cursor-pointer">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Document (PDF)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => handleMediaUpload(e, 'document')}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 px-3 py-2.5 bg-slate-900/90 text-white rounded-2xl border border-sky-500/30 focus:border-[#00F0FF] focus:outline-none text-xs placeholder-slate-400"
              />

              {/* Voice Note Button or Send Button */}
              {inputMessage.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 rounded-2xl bg-[#1677FF] hover:bg-[#00F0FF] text-white hover:text-slate-950 transition-all shadow-[0_0_10px_#1677FF] shrink-0"
                  aria-label="Envoyer"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartVoiceRecording}
                  className="p-2.5 rounded-2xl bg-slate-900 border border-sky-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shrink-0"
                  title="Enregistrer un message vocal"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </form>
          )}
        </div>
      ) : (
        /* MAIN CHAT HUB (Tabs: Discussions, Groupes, Contacts) */
        <div className="flex flex-col h-full">
          {/* Top Bar with Registration Status & Actions */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-sky-500/20">
            <div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white font-brand">NOVA CHAT</h2>
              </div>
              <p className="text-[11px] text-slate-400">
                Pointe-Noire · Brazzaville & Monde
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Phone verification indicator */}
              <button
                onClick={() => setShowSmsVerificationModal(true)}
                className={`px-2 py-1 rounded-xl text-[10px] font-mono flex items-center gap-1 border transition-colors ${
                  userProfile.isPhoneVerified
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
                title="Vérification SMS"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{userProfile.isPhoneVerified ? 'Vérifié' : 'Vérifier SMS'}</span>
              </button>

              {/* Add friend button */}
              <button
                onClick={() => setShowAddFriendModal(true)}
                className="p-2 rounded-xl bg-sky-500/20 border border-sky-400/30 text-[#00F0FF] hover:bg-[#1677FF] hover:text-white transition-all shadow-sm"
                title="Ajouter un ami à distance"
              >
                <UserPlus className="w-4 h-4" />
              </button>

              {/* Create Group button */}
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title="Créer un groupe"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pending Invitations Banner if any */}
          {friendRequests.length > 0 && (
            <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-sky-950/70 to-slate-900 border border-sky-400/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={friendRequests[0].fromUser.avatar}
                  alt="Ami"
                  className="w-8 h-8 rounded-full object-cover border border-sky-400"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{friendRequests[0].fromUser.name}</h4>
                  <span className="text-[10px] text-sky-300">{friendRequests[0].fromUser.novaId}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => acceptFriendRequest(friendRequests[0].id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px]"
                >
                  Accepter
                </button>
                <button
                  onClick={() => rejectFriendRequest(friendRequests[0].id)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une discussion, un ami..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Hub Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-2xl border border-sky-500/20 mb-3">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'chats' ? 'bg-[#1677FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Discussions
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'groups' ? 'bg-[#1677FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Groupes ({chatGroups.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'contacts' ? 'bg-[#1677FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Amis ({contacts.length})
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {activeTab === 'chats' && (
              <>
                {contacts
                  .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => {
                        setActiveContactId(contact.id);
                        setShowConversationMobile(true);
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer border border-slate-800 bg-slate-900/60 hover:border-sky-500/40 hover:bg-slate-800/50 transition-all"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-sky-400/40"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#071330] ${
                            contact.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-white truncate font-brand">{contact.name}</h4>
                          <span className="text-[10px] text-slate-400">{contact.lastMessageTime}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate">{contact.lastMessage}</p>
                        <span className="text-[9px] text-sky-400/80 font-mono">
                          {contact.city} · {contact.novaId}
                        </span>
                      </div>

                      {contact.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-[0_0_8px_#1677FF]">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
              </>
            )}

            {activeTab === 'groups' && (
              <>
                {chatGroups.map((grp) => (
                  <div
                    key={grp.id}
                    onClick={() => {
                      setActiveContactId(grp.id);
                      setShowConversationMobile(true);
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer border border-slate-800 bg-slate-900/60 hover:border-purple-400/40 hover:bg-slate-800/50 transition-all"
                  >
                    <img
                      src={grp.avatar}
                      alt={grp.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-purple-400/40 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate font-brand">{grp.name}</h4>
                        <span className="text-[10px] text-purple-300 font-mono">
                          {grp.memberIds.length + 1} membres
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">{grp.description}</p>
                      <span className="text-[9px] text-slate-400">Créé par {grp.createdBy}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'contacts' && (
              <>
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-800 bg-slate-900/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover border border-sky-400/40" />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                        <span className="text-[10px] text-sky-300 font-mono block">{c.novaId}</span>
                        {!userProfile.hidePhone && (
                          <span className="text-[9px] text-slate-400 font-mono">{c.phone}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setActiveContactId(c.id);
                          setShowConversationMobile(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-sky-500/20 text-[#00F0FF] text-xs font-semibold hover:bg-sky-500/30"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: AJOUTER UN AMI PAR NUMÉRO OU IDENTIFIANT NOVA */}
      {showAddFriendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#071330] border border-sky-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00F0FF]" />
                <h3 className="text-sm font-bold text-white font-brand">Ajouter un ami</h3>
              </div>
              <button onClick={() => setShowAddFriendModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tabs: Phone or Handle */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl mb-3 border border-slate-800">
              <button
                type="button"
                onClick={() => setAddMethod('phone')}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                  addMethod === 'phone' ? 'bg-[#1677FF] text-white' : 'text-slate-400'
                }`}
              >
                Par Numéro
              </button>
              <button
                type="button"
                onClick={() => setAddMethod('handle')}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                  addMethod === 'handle' ? 'bg-[#1677FF] text-white' : 'text-slate-400'
                }`}
              >
                Par Identifiant NOVA
              </button>
            </div>

            {addFeedback && (
              <div
                className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  addFeedback.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{addFeedback.msg}</span>
              </div>
            )}

            <form onSubmit={handleAddFriendSubmit} className="space-y-3">
              {addMethod === 'phone' ? (
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    Numéro de téléphone avec indicatif
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={dialCode}
                      onChange={(e) => setDialCode(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-xl px-2 py-2 text-xs focus:outline-none"
                    >
                      {COUNTRY_DIAL_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} ({item.country.slice(0, 10)})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={phoneNumberInput}
                      onChange={(e) => setPhoneNumberInput(e.target.value)}
                      placeholder="06 123 45 67"
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00F0FF]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    Identifiant NOVA unique (@pseudo)
                  </label>
                  <input
                    type="text"
                    required
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    placeholder="ex: @mariam_kin ou @bruno242"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1677FF] to-[#00F0FF] text-white font-bold text-xs shadow-md mt-2"
              >
                Envoyer l'invitation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CRÉER UN GROUPE */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#071330] border border-purple-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-brand">Nouveau Groupe</h3>
              </div>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Nom du groupe</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="ex: Classe Terminale C Pointe-Noire"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Objectif du groupe..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Ajouter des amis</label>
                <div className="max-h-28 overflow-y-auto space-y-1.5 no-scrollbar">
                  {contacts.map((c) => {
                    const isChecked = selectedMemberIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer"
                      >
                        <span>{c.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedMemberIds((prev) => [...prev, c.id]);
                            else setSelectedMemberIds((prev) => prev.filter((id) => id !== c.id));
                          }}
                          className="accent-purple-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md mt-2"
              >
                Créer le Groupe
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VÉRIFICATION NUMÉRO PAR SMS */}
      {showSmsVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#071330] border border-sky-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-brand">Vérification du Numéro</h3>
              </div>
              <button onClick={() => setShowSmsVerificationModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {smsError && (
              <div className="mb-3 p-2 rounded-xl bg-rose-500/15 text-rose-300 text-xs">
                {smsError}
              </div>
            )}

            {!smsSent ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Un code SMS à 6 chiffres va être expédié pour certifier votre identifiant NOVA.
                </p>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Votre numéro</label>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRequestSmsCode}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Envoyer le code SMS
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifySmsCode} className="space-y-3">
                <p className="text-xs text-emerald-300">
                  Code SMS généré : <strong className="font-mono text-white">242789</strong>
                </p>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Saisir le code à 6 chiffres</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="242789"
                    className="w-full text-center tracking-widest font-mono text-base px-3 py-2 bg-slate-900 border border-emerald-500/50 rounded-xl text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Confirmer et Certifier
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: APPEL AUDIO & VIDÉO COMPATIBLE WEBRTC */}
      {activeCall.isActive && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#030817]/95 backdrop-blur-2xl">
          {/* Top Call Info */}
          <div className="flex flex-col items-center mt-6 text-center">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-sky-500/20 text-[#00F0FF] border border-sky-400/30 uppercase mb-3">
              Appel {activeCall.type === 'video' ? 'Vidéo' : 'Audio'} Chiffré NOVA
            </span>

            {/* Remote Contact Avatar or Video */}
            <div className="relative my-4">
              <img
                src={activeCall.contact?.avatar}
                alt="Correspondant"
                className="w-24 h-24 rounded-full border-4 border-sky-400 shadow-[0_0_30px_#1677FF] object-cover animate-pulse"
              />
            </div>

            <h3 className="text-lg font-bold text-white font-brand">{activeCall.contact?.name}</h3>
            <p className="text-xs text-sky-300/80 mt-1">
              {activeCall.status === 'connecting'
                ? 'Connexion sécurisée en cours...'
                : 'En communication · 00:24'}
            </p>
          </div>

          {/* Local Camera Video Feed if video call */}
          {activeCall.type === 'video' && !activeCall.isVideoOff && (
            <div className="w-36 h-48 rounded-2xl overflow-hidden border-2 border-[#00F0FF] shadow-2xl relative bg-black">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-2 text-[9px] text-white font-mono bg-black/60 px-1 rounded">
                Moi
              </span>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={toggleCallMute}
              className={`p-4 rounded-full border transition-all ${
                activeCall.isMuted
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {activeCall.type === 'video' && (
              <button
                onClick={toggleCallVideo}
                className={`p-4 rounded-full border transition-all ${
                  activeCall.isVideoOff
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {activeCall.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}

            {/* Hangup */}
            <button
              onClick={endCall}
              className="p-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] active:scale-95 transition-all"
              title="Raccrocher"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
