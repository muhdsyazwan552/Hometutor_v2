import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function Lobby({ conversations: initialConversations, friends, user }) {
    const [conversations, setConversations] = useState(initialConversations || []);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState('chats');
    const messagesEndRef = useRef(null);
    const echoChannelRef = useRef(null);

    // Helper function for avatar initials
    const getAvatarInitials = (name) => {
        return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
    };

    // Load messages when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            loadMessages(activeConversation.id);
            setupEchoListener(activeConversation.id);
        }

        // Cleanup Echo listener
        return () => {
            if (echoChannelRef.current) {
                echoChannelRef.current.stopListening('MessageSent');
                if (window.Echo && window.Echo.leave) {
                    window.Echo.leave(`chat.${activeConversation?.id}`);
                }
                echoChannelRef.current = null;
            }
        };
    }, [activeConversation]);

    // Setup Echo listener for real-time messages
    const setupEchoListener = (conversationId) => {
        if (!window.Echo || !window.Echo.join) {
            console.warn('Echo not available for real-time messaging');
            return;
        }

        try {
            // Clean up previous listener
            if (echoChannelRef.current) {
                echoChannelRef.current.stopListening('MessageSent');
                window.Echo.leave(`chat.${conversationId}`);
            }

            // Join the presence channel
            echoChannelRef.current = window.Echo.join(`chat.${conversationId}`)
                .here((users) => {
                    console.log('Users online:', users.length);
                })
                .joining((user) => {
                    console.log('User joined:', user.name);
                })
                .leaving((user) => {
                    console.log('User left:', user.name);
                })
                .listen('MessageSent', (e) => {
                    console.log('Real-time message received:', e);
                    handleNewMessage(e.message);
                })
                .error((error) => {
                    console.error('Echo channel error:', error);
                });

        } catch (error) {
            console.error('Error setting up Echo listener:', error);
        }
    };

    // Handle incoming real-time messages
    const handleNewMessage = (messageData) => {
        if (messageData.sender_id === user.id) {
            return;
        }

        const formattedMessage = {
            id: messageData.id,
            sender_id: messageData.sender_id,
            sender_name: messageData.sender?.name || 'Unknown',
            sender_avatar: getAvatarInitials(messageData.sender?.name || 'Unknown'),
            message: messageData.message,
            is_read: messageData.is_read || false,
            created_at: messageData.created_at,
            time_ago: 'Just now',
            is_own: messageData.sender_id === user.id,
        };

        setMessages(prev => [...prev, formattedMessage]);

        setConversations(prev => 
            prev.map(conv => 
                conv.id === messageData.conversation_id 
                    ? { 
                        ...conv, 
                        lastMessage: messageData.message,
                        lastMessageTime: 'Just now',
                        unreadCount: conv.id === activeConversation?.id ? 0 : conv.unreadCount + 1
                      }
                    : conv
            )
        );
    };

    // Load messages for a conversation
    const loadMessages = async (conversationId) => {
        try {
            setLoading(true);
            const response = await fetch(`/chat/conversation/${conversationId}/messages`);
            if (response.ok) {
                const messagesData = await response.json();
                setMessages(messagesData);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Send message
    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !activeConversation || sending) {
            return;
        }

        try {
            setSending(true);
            
            await router.post('/chat/send-message', {
                conversation_id: activeConversation.id,
                message: newMessage.trim(),
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setNewMessage('');
                },
                onError: (errors) => {
                    alert('Failed to send message: ' + (errors.message || 'Unknown error'));
                }
            });

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    // Start conversation
    const startConversationSimple = async (friendId) => {
        try {
            setLoading(true);
            
            const response = await router.post('/chat/start-conversation', {
                friend_id: friendId
            }, {
                onSuccess: () => {
                    // Refresh the page to show the new conversation
                    router.reload();
                }
            });

        } catch (error) {
            console.error('Error starting conversation:', error);
            alert('Failed to start conversation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Quick chat action - starts conversation and focuses on chat
    const quickChat = async (friendId, friendName) => {
        try {
            setLoading(true);
            
            const response = await router.post('/chat/start-conversation', {
                friend_id: friendId
            }, {
                onSuccess: () => {
                    // Switch to chats tab and reload to show new conversation
                    setActiveTab('chats');
                    router.reload();
                }
            });

        } catch (error) {
            console.error('Error starting quick chat:', error);
            alert('Failed to start chat. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Format message time
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = (now - date) / (1000 * 60);
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
        if (diffInMinutes < 1440) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <DashboardLayout>
            <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">

                {/* LEFT SIDEBAR – Conversations & Friends */}
                <div className="w-96 bg-white/80 backdrop-blur-xl border-r border-gray-200/60 flex flex-col shadow-xl">

                    {/* Header with Tabs */}
                    <div className="p-6 border-b border-gray-200/60 bg-white/60">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Messages
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {conversations.length}
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('chats')}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
                                    activeTab === 'chats'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Chats
                            </button>
                            <button
                                onClick={() => setActiveTab('friends')}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
                                    activeTab === 'friends'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Friends ({friends.length})
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {activeTab === 'chats' ? (
                            /* CONVERSATIONS LIST */
                            <div className="space-y-1 p-2">
                                {conversations.map((conversation) => (
                                    <div
                                        key={conversation.id}
                                        className={`p-4 cursor-pointer transition-all duration-300 group rounded-xl mx-2
                                            ${activeConversation?.id === conversation.id
                                                ? "bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-500 shadow-sm"
                                                : "hover:bg-gray-50/80 hover:border-l-4 hover:border-gray-300"
                                            }
                                        `}
                                        onClick={() => setActiveConversation(conversation)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`relative ${conversation.avatarColor} w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-transform group-hover:scale-105`}>
                                                {conversation.avatar}
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                                                    <span className="text-xs text-gray-400 whitespace-nowrap">{conversation.lastMessageTime}</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-600 truncate flex-1">{conversation.lastMessage}</p>
                                                    {conversation.unreadCount > 0 && (
                                                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center shadow-sm">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* FRIENDS LIST */
                            <div className="space-y-1 p-2">
                                {friends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className="group p-4 cursor-pointer transition-all duration-300 rounded-xl mx-2 hover:bg-gray-50/80 border-l-4 border-transparent hover:border-blue-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={`${friend.avatarColor} w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-transform group-hover:scale-105`}>
                                                    {friend.avatar}
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">{friend.name}</h3>
                                                    <span className="text-xs text-green-600 font-medium">Online</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-600 truncate flex-1">{friend.school}</p>
                                                    <button 
                                                        onClick={() => quickChat(friend.id, friend.name)}
                                                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-lg font-medium"
                                                    >
                                                        Chat
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {friends.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-4xl mb-3 text-gray-300">👥</div>
                                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Friends Yet</h3>
                                        <p className="text-gray-500 text-sm">Add friends to start chatting</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE – Chat Area */}
                <div className="flex-1 flex flex-col">

                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`relative ${activeConversation.avatarColor} w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg`}>
                                        {activeConversation.avatar}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900">{activeConversation.name}</h3>
                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            Online
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* MESSAGES */}
                            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50/50 custom-scrollbar">
                                {loading ? (
                                    <div className="flex justify-center items-center h-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message, index) => {
                                            const showAvatar = !message.is_own && 
                                                (index === 0 || messages[index - 1].sender_id !== message.sender_id);
                                            
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex gap-3 ${message.is_own ? "flex-row-reverse" : "flex-row"}`}
                                                >
                                                    {showAvatar && !message.is_own && (
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${activeConversation.avatarColor} flex-shrink-0`}>
                                                            {activeConversation.avatar}
                                                        </div>
                                                    )}
                                                    
                                                    {!message.is_own && !showAvatar && (
                                                        <div className="w-8 flex-shrink-0"></div>
                                                    )}
                                                    
                                                    <div
                                                        className={`max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md
                                                            ${message.is_own
                                                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                                                                : "bg-white text-gray-800 border border-gray-200/60 rounded-bl-none"
                                                            }
                                                            ${message.is_own ? "ml-12" : "mr-12"}
                                                        `}
                                                    >
                                                        <p className="text-sm leading-relaxed">{message.message}</p>
                                                        <p className={`text-xs mt-2 ${message.is_own ? "text-blue-100" : "text-gray-400"} text-right`}>
                                                            {formatMessageTime(message.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* MESSAGE INPUT */}
                            <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200/60">
                                <form onSubmit={sendMessage} className="flex items-end gap-3">
                                    <div className="flex-1 bg-white border border-gray-300/60 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message…"
                                            rows="1"
                                            className="w-full resize-none border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-sm max-h-32"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage(e);
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg transition-all duration-300"
                                    >
                                        {sending ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        /* NO CONVERSATION SELECTED */
                        <div className="flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-br from-white to-blue-50/30">
                            <div className="relative mb-8">
                                <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-2xl">
                                    <div className="text-4xl">💬</div>
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                    {conversations.length}
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-3">
                                {activeTab === 'chats' ? 'Welcome to Messages' : 'Start a Conversation'}
                            </h3>
                            <p className="text-gray-600 text-lg max-w-md mb-8">
                                {activeTab === 'chats' 
                                    ? 'Select a conversation from the sidebar to start chatting with your friends and colleagues.'
                                    : 'Choose a friend from the sidebar to start a new conversation.'
                                }
                            </p>
                            <div className="flex gap-3">
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </DashboardLayout>
    );
}