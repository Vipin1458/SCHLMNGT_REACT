import { useState, useEffect, useRef } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  TextField,
  IconButton,
  Paper,
  Avatar
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import axiosPrivate from "../api/axiosPrivate";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const accessToken = localStorage.getItem("access");
  const currentUserId = Number(localStorage.getItem("id"));
  const currentRole = localStorage.getItem("role");

  // Always scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 // Fetch conversations & auto-create for students
useEffect(() => {
  const initChat = async () => {
    try {
      console.log("Initializing chat...");

      let convRes = await axiosPrivate.get("/chat/api/conversations/");
      let convs = convRes.data.results || [];
      setConversations(convs);

      if (currentRole === "student") {
        const profileRes = await axiosPrivate.get("/student/profile");
        const studentData = profileRes.data;

        const assignedTeacherId = studentData?.assigned_teacher;
        const studentId = studentData?.id; // student model id (not user id)

        if (assignedTeacherId && studentId) {
          const exists = convs.some(
            c =>
              Number(c.teacher_id) === Number(assignedTeacherId) &&
              Number(c.student_id) === Number(studentId)
          );

          if (!exists) {
            const createRes = await axiosPrivate.post(
              "/chat/api/conversations/",
              {
                teacher_id: assignedTeacherId,
                student_id: studentId
              }
            );
            setConversations(prev => [createRes.data, ...prev]);
          }
        }
      }
    } catch (err) {
      console.error("Error initializing chat:", err);
    }
  };

  initChat();
}, [currentRole]);


  // Load messages & WebSocket
  useEffect(() => {
    if (!selectedConv || !selectedConv.id) return;

    axiosPrivate
      .get(`/chat/api/conversations/${selectedConv.id}/messages/`)
      .then(res => {
        setMessages(res.data.results || []);
      });

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${selectedConv.id}/?token=${accessToken}`
    );

    ws.onmessage = e => {
      const data = JSON.parse(e.data);
      if (data.type === "chat.message") {
        setMessages(prev => [...prev, data.message]);
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConv.id
              ? { ...c, last_message: data.message }
              : c
          )
        );
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, [selectedConv]);

  const sendMessage = () => {
    if (socket && text.trim()) {
      socket.send(JSON.stringify({ text }));
      setText("");
    }
  };

  const handleSelectConversation = conv => {
    setSelectedConv(conv);
  };

  return (
    <Box sx={{ display: "flex", height: "80vh" }}>
      {/* Sidebar */}
      <Box sx={{ width: "30%", borderRight: "1px solid #ddd", overflowY: "auto" }}>
        <Typography variant="h6" sx={{ p: 2 }}>Conversations</Typography>
        <Divider />
        <List>
          {conversations.map(conv => (
            <ListItemButton
              key={`${conv.teacher_id}-${conv.student_id}`}
              selected={selectedConv?.id === conv.id}
              onClick={() => handleSelectConversation(conv)}
            >
              <ListItemText
                primary={
                  currentUserId === conv.teacher_id
                    ? conv.student_name || conv.student_id
                    : conv.teacher_name || conv.teacher_id
                }
                secondary={conv.last_message?.text || "No messages yet"}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Chat Window */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {selectedConv && (
          <Box sx={{ p: 2, borderBottom: "1px solid #ddd", bgcolor: "#fff" }}>
            <Typography variant="h6">
              {currentUserId === selectedConv.teacher_id
                ? selectedConv.student_name || selectedConv.student_id
                : selectedConv.teacher_name || selectedConv.teacher_id}
            </Typography>
          </Box>
        )}

        <Box
          ref={messagesContainerRef}
          sx={{ flexGrow: 1, p: 2, overflowY: "auto", background: "#fafafa" }}
        >
          {selectedConv ? (
            messages.map(msg => {
              const isOwn =
                Number(msg.sender_id) === currentUserId ||
                Number(msg.sender?.id) === currentUserId;

              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent: isOwn ? "flex-end" : "flex-start",
                    mb: 1,
                    gap: 1
                  }}
                >
                  {!isOwn && (
                    <Avatar sx={{ bgcolor: "#1976d2" }}>
                      {msg.sender_name?.charAt(0)}
                    </Avatar>
                  )}
                  <Paper
                    sx={{
                      p: 1.2,
                      maxWidth: "60%",
                      bgcolor: isOwn ? "#1976d2" : "#e0e0e0",
                      color: isOwn ? "#fff" : "#000",
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {isOwn ? "Me" : ""}
                    </Typography>
                    <Typography>{msg.text}</Typography>
                  </Paper>
                </Box>
              );
            })
          ) : (
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "text.secondary" }}>
              <ChatIcon sx={{ fontSize: 50, opacity: 0.3 }} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />
        {selectedConv && (
          <Box sx={{ display: "flex", p: 1 }}>
            <TextField
              fullWidth
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <IconButton color="primary" onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
