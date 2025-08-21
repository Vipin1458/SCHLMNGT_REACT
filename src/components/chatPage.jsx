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
  Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import axiosPrivate from "../api/axiosPrivate";
import { useLocation } from "react-router-dom";
import { Phone } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [count, setCount] = useState(0);
  const [selectedConv, setSelectedConv] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const accessToken = localStorage.getItem("access");
  const currentUserId = Number(localStorage.getItem("id"));
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const currentRole = user?.role || null;
  const location = useLocation();
  const stateConvId = location.state?.convId;
  const myStatus = location.state?.myStatus;
  const [active, setActive] = useState(true);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (stateConvId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === Number(stateConvId));
      if (conv) {
        setSelectedConv(conv);
      }
    }
  }, [stateConvId, conversations]);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const convRes = await axiosPrivate.get("/chat/api/conversations/");
        const convs = convRes.data.results || [];
        setConversations(convs);
        setCount(convRes.data.count);

        if (stateConvId) {
          const conv = convs.find((c) => c.id === Number(stateConvId));
          if (conv) setSelectedConv(conv);
        }

        if (currentRole === "student") {
          const profileRes = await axiosPrivate.get("/api/student/profile");
          const studentData = profileRes.data;
          const assignedTeacherId = studentData?.assigned_teacher;
          const studentId = studentData?.id;
          const studentStatus = studentData?.status;
          studentStatus == 1 ? setActive(true) : setActive(false);

          if (assignedTeacherId && studentId && convRes.data.count === 0) {
            const createRes = await axiosPrivate.post(
              "/chat/api/conversations/",
              {
                teacher_id: assignedTeacherId,
                student_id: studentId,
              }
            );
            setConversations((prev) => {
              const exists = prev.some((conv) => conv.id === createRes.data.id);
              if (exists) return prev;
              return [createRes.data, ...prev];
            });
          }
        } else if (currentRole === "teacher") {
          const teacherprofile = await axiosPrivate.get("/teacher/me");
          const status = teacherprofile.data.status;
          if (status !== undefined && status !== null) {
            setActive(status === 1);
          } else {
            setActive(myStatus === 1);
          }
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
      }
    };

    initChat();
  }, [currentRole, stateConvId]);

  const loadMore = () => {
    const currentLength = messages.length;
    const nextLength = currentLength + PAGE_SIZE;

    if (nextLength >= allMessages.length) {
      setMessages(allMessages);
      setHasMore(false);
    } else {
      setMessages(allMessages.slice(-nextLength));
    }
  };

  useEffect(() => {
    if (!selectedConv?.id) return;

    axiosPrivate
      .get(`/chat/api/conversations/${selectedConv.id}/messages/`)
      .then((res) => {
        const all = res.data.results || [];
        const sorted = all.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setAllMessages(sorted);
        setMessages(sorted.slice(-PAGE_SIZE));
        setHasMore(sorted.length > PAGE_SIZE);
      });

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${selectedConv.id}/?token=${accessToken}`
    );

    ws.onopen = () => {
      console.log("Conversation socket connected");
      setSocket(ws);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat.message") {
        setMessages((prev) => [...prev, data.message]);
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === selectedConv.id);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], last_message: data.message };
            const [moved] = updated.splice(idx, 1);
            return [moved, ...updated];
          }
          return prev;
        });
      }
    };

    ws.onclose = () => {
      console.log("Conversation socket closed");
    };

    return () => ws.close();
  }, [selectedConv, accessToken]);

  const sendMessage = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("Socket is not open");
      return;
    }
    if (text.trim()) {
      socket.send(JSON.stringify({ text }));
      setText("");
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConv(conv);
  };

  return (
    <Box sx={{ display: "flex", height: "88vh" }}>
      <Box
        sx={{ width: "20%", borderRight: "1px solid #ddd", overflowY: "auto" }}
      >
        <Typography variant="h6" sx={{ p: 1 }}>
          Chats
        </Typography>
        <Divider />
        <List>
          {conversations.map((conv) => (
            <ListItemButton
              sx={{
                borderBottom: "1px solid #cec8c8ff",
                borderRadius: 2,
                gap: 2,
                paddingLeft: 1,
                "&:hover": {
                  borderColor: "green",
                  backgroundColor: "#f5f5f5",
                },
              }}
              key={conv.id}
              selected={selectedConv?.id === conv.id}
              onClick={() => handleSelectConversation(conv)}
            >
              <Avatar
                sx={{ bgcolor: "#1976d2", width: 40, height: 40, fontSize: 14 }}
              ></Avatar>
              <ListItemText
                primary={
                  currentUserId === conv.teacher_id
                    ? conv.student_name || conv.student_id
                    : conv.teacher_name || conv.teacher_id
                }
                secondary={
                  conv.last_message?.text
                    ? conv.last_message.text.slice(0, 18) +
                      (conv.last_message.text.length > 10 ? "..." : "")
                    : "No messages yet"
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {selectedConv && (
          <Box
            sx={{
              p: 0.5,
              pl: 2,
              borderBottom: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#fff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ bgcolor: "#1976d2" }}>
                {currentUserId === selectedConv.teacher_id
                  ? selectedConv.student_name?.charAt(0)
                  : selectedConv.teacher_name?.charAt(0)}
              </Avatar>
              <Typography variant="h6">
                {currentUserId === selectedConv.teacher_id
                  ? selectedConv.student_name || selectedConv.student_id
                  : selectedConv.teacher_name || selectedConv.teacher_id}
              </Typography>
            </Box>
            <Phone color="green" />
          </Box>
        )}
        <Box
          id="scrollableDiv"
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: "auto",
            background: "#fafafa",
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          {selectedConv ? (
            <InfiniteScroll
              dataLength={messages.length}
              next={loadMore}
              hasMore={hasMore}
              inverse={true}
              loader={
                <Typography sx={{ textAlign: "center" }}>Loading...</Typography>
              }
              scrollableTarget="scrollableDiv"
              style={{ display: "flex", flexDirection: "column-reverse" }}
            >
              {[...messages].reverse().map((msg) => {
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
                      gap: 1,
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
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {isOwn ? "Me" : ""}
                      </Typography>
                      <Typography
                        sx={{
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.text}
                      </Typography>
                    </Paper>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </InfiniteScroll>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <ChatIcon sx={{ fontSize: 50, opacity: 0.3 }} />
              <Typography>Start chatting</Typography>
            </Box>
          )}
        </Box>

        <Divider />
        {selectedConv && (
          <Box sx={{ display: "flex", p: 1 }}>
            <TextField
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                active
                  ? "Type a message..."
                  : "You are inactive you cannot chat"
              }
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={!active}
            />
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={!active}
            >
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
