import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Fab,
    Paper,
    Typography,
    IconButton,
    TextField,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Fade,
    Avatar,
    InputAdornment
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

import { authFetch } from '@/services/authService';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hallo! Ik ben de Veiling AI Assistent. Hoe kan ik je vandaag helpen?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userSnapshot = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userSnapshot }]);
        setIsLoading(true);

        try {
            const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
            const response = await authFetch(`${apiBase}/api/Chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userSnapshot })
            });

            if (!response.ok) {
                // handle error
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Oeps, er ging iets mis met de verbinding. Probeer het later opnieuw.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
                <Fab
                    color="primary"
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                >
                    {isOpen ? <CloseIcon /> : <ChatIcon />}
                </Fab>
            </Box>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        sx={{
                            position: 'fixed',
                            bottom: 90,
                            right: 24,
                            width: { xs: 'calc(100% - 48px)', sm: 360 },
                            height: 500,
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Paper
                            elevation={10}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 4,
                                overflow: 'hidden'
                            }}
                        >
                            {/* Header */}
                            <Box sx={{
                                p: 2,
                                bgcolor: 'primary.main',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                background: 'linear-gradient(45deg, #1B5E20 30%, #2E7D32 90%)'
                            }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <SmartToyIcon />
                                </Avatar>
                                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                                    Veiling AI
                                </Typography>
                            </Box>

                            {/* Messages */}
                            <Box
                                ref={scrollRef}
                                sx={{
                                    flexGrow: 1,
                                    p: 2,
                                    overflowY: 'auto',
                                    bgcolor: '#f5f5f5',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5
                                }}
                            >
                                {messages.map((msg, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '85%'
                                        }}
                                    >
                                        <Paper sx={{
                                            p: 1.5,
                                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                            bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                                            color: msg.role === 'user' ? 'white' : 'text.primary',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}>
                                            <Typography variant="body2" component="div">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </Typography>
                                        </Paper>
                                    </Box>
                                ))}
                                {isLoading && (
                                    <Box sx={{ alignSelf: 'flex-start', p: 1, px: 2, bgcolor: 'white', borderRadius: 4 }}>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                            Aan het typen...
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Input */}
                            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Stel een vraag..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton color="primary" onClick={handleSend} disabled={isLoading}>
                                                        <SendIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Box>
                        </Paper>
                    </Box>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
