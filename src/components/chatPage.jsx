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
import toast from "react-hot-toast";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [count, setCount] = useState(0);
  const [selectedConv, setSelectedConv] = useState(null);
  const [nextpage, setNextPage]= useState(null)
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
  const [chatEnabled, setChatEnabled] = useState(true);
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
          const Assigned_teacher_status = studentData?.assigned_teacher_status;
          const studentId = studentData?.id;
          const studentActive = studentData?.status === 1;
          const teacherActive = Assigned_teacher_status == 1;
          const studentStatus = studentData?.status;
          console.log("stdactTeacAct",studentActive,teacherActive);
          console.log("hhuuuuuuuuuuuuuuuuuuuuuuuuuuuu",Assigned_teacher_status);
          
          studentStatus == 1 ? setActive(true) : setActive(false);
          setChatEnabled(studentActive && teacherActive);

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
        }  
      } catch (err) {
        console.error("Error initializing chat:", err);
      }
    };

    initChat();
  }, [currentRole, stateConvId]);

  useEffect(() => {
  const fetchStatuses = async () => {
    if (currentRole !== "teacher" || !selectedConv?.student_id) return;

    try {
      const teacherProfile = await axiosPrivate.get("/teacher/me");
      const studentRes = await axiosPrivate.get(
        `/mystudents/${selectedConv.student_id}`
      );

      const studentActive = studentRes.data?.status === 1;
      const teacherActive = teacherProfile.data?.status === 1;

      setActive(teacherActive);
      setChatEnabled(studentActive && teacherActive);
    } catch (err) {
      console.error("Error fetching statuses:", err);
    }
  };

  fetchStatuses();
}, [currentRole, selectedConv]);

 const loadMore = async () => {
  if (!nextpage) return;

  try {
    const res = await axiosPrivate.get(nextpage);
    const { results, next } = res.data;
    const older = results.reverse();
    setMessages((prev) => [...older, ...prev]);
    setNextPage(next);
    setHasMore(!!next);
  } catch (err) {
    console.error("Error loading more messages:", err);
    setHasMore(false);
  }
};


  useEffect(() => {
    if (!selectedConv?.id) return;

    const fetchFirstPage = async () => {
    try {
      const res = await axiosPrivate.get(
        `/chat/api/conversations/${selectedConv.id}/messages/`
      );

      const { results, next } = res.data;
     const inv=results.reverse()

      setMessages(inv);
      setNextPage(next);
      setHasMore(!!next);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("The user you are trying to reach is not found.");
        setSelectedConv(null);
      }
    }
  };

  fetchFirstPage();

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
      toast.error("Chat connection lost. The user may no longer exist.")
      setSelectedConv(null)
      return;
    }
    if (text.trim()) {
      try {
        socket.send(JSON.stringify({ text }));
        setText("");
      } catch (e) {
        toast.error("he user you are trying to reach is not found.")
       
      }
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
            p:2,
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
                <Typography sx={{ textAlign: "center",color:"green" ,mt:4}}>Loading...</Typography>
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
                !active
                  ? "You are inactive, you cannot chat"
                  : !chatEnabled
                  ? "The other user is inactive, you cannot chat"
                  : "Type a message..."
              }
              disabled={!chatEnabled}
            />
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={!chatEnabled}
            >
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
