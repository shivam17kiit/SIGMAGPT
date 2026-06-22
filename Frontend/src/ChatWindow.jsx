import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import {ScaleLoader} from "react-spinners";

function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat} = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // FIX: Store documentId per thread so it persists when switching chats
    const [threadDocumentMap, setThreadDocumentMap] = useState({});
    const [uploadedFileName, setUploadedFileName] = useState("");

    // Current thread's documentId
    const documentId = threadDocumentMap[currThreadId] || null;

    // Clear filename display when switching threads
    useEffect(() => {
        const existingFile = threadDocumentMap[currThreadId];
        if (!existingFile) setUploadedFileName("");
    }, [currThreadId]);

    const getReply = async () => {
        setLoading(true);
        setNewChat(false);

        console.log("message ", prompt, " threadId ", currThreadId);
        console.log("Sending documentId:", documentId);

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId,
                documentId  // will be null if no doc uploaded for this thread
            })
        };

        try {
            const response = await fetch("https://localhost:8080/api/chat", options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => ([
                ...prevChats,
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]));
        }
        setPrompt("");
    }, [reply]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("https://localhost:8080/document/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            console.log("Upload Response:", data);

            if (!data.id) {
                alert("Upload failed: no document ID returned. Check backend logs.");
                return;
            }

            // FIX: Map documentId to current thread so it persists across thread switches
            setThreadDocumentMap(prev => ({
                ...prev,
                [currThreadId]: data.id
            }));
            setUploadedFileName(file.name);
            alert("Document uploaded successfully! You can now ask questions about it.");

        } catch (err) {
            console.log(err);
            alert("Upload failed");
        }
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>SigmaGPT <i className="fa-solid fa-chevron-down"></i></span>
            </div>
            {isOpen && null}
            <Chat></Chat>
            {uploadedFileName && (
                <div className="pdfCard">
                    📄 {uploadedFileName}
                    {documentId && <span style={{color: "#4caf50", marginLeft: "8px", fontSize: "12px"}}>✓ Ready</span>}
                </div>
            )}
            <ScaleLoader color="#fff" loading={loading}></ScaleLoader>

            <div className="chatInput">
                <label className="uploadBtn">
                    +
                    <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        hidden
                    />
                </label>
                <div className="inputBox">
                    <input
                        placeholder={documentId ? "Ask about your document..." : "Ask anything"}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                    />
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    SigmaGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;
