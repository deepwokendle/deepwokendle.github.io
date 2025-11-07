let connection = null;
let sendQueue = [];
let isStarting = false;
let lastMessageTime = 0;

function getToken() {
    return localStorage.getItem('token') || null;
}

function escapeHtml(unsafe) {
    if (!unsafe && unsafe !== 0) return "";
    return String(unsafe)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function appendMessage(user, message, meta = '') {
    var savedUsername = localStorage.getItem("username");
    const chatBox = document.getElementById("chat");
    if (!chatBox) return;
    const p = document.createElement('p');
    p.innerHTML = `<b style="${user == savedUsername ? "color:darkgreen" : ""}">${escapeHtml(user)}:</b> ${escapeHtml(message)} ${meta}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function flushQueue() {
    if (!connection) return;
    while (sendQueue.length > 0 && connection.state === signalR.HubConnectionState.Connected) {
        const item = sendQueue.shift();
        try {
            await connection.invoke("SendMessage", item.user, item.message);
        } catch (err) {
            console.error("Failed at sending from queue, reattempting:", err);
            sendQueue.unshift(item);
            break;
        }
    }
}

async function ensureConnected() {
    if (!connection) throw new Error("Connection not initialized.");
    if (connection.state === signalR.HubConnectionState.Connected) return;
    if (isStarting) {
        const timeout = 1000;
        const startedAt = Date.now();
        while (Date.now() - startedAt < timeout) {
            if (connection.state === signalR.HubConnectionState.Connected) return;
            await new Promise(r => setTimeout(r, 200));
        }
        throw new Error("Timed out.");
    }
    try {
        isStarting = true;
        await connection.start();
    } finally {
        isStarting = false;
    }
}

async function sendMessage() {
    const now = Date.now();
    if (now - lastMessageTime < cooldownMs) {
        return;
    }

    lastMessageTime = now;
    const messageEl = document.getElementById("message");
    const sendBtn = document.getElementById("sendBtn");
    var savedUsername = localStorage.getItem("username");
    if (!messageEl) {
        return;
    }
    const message = messageEl.value?.trim();

    if (!message) {
        return;
    }
    if (!savedUsername) {
        Swal.fire({
            title: 'Error!',
            text: 'Please Login before sending a message.',
            icon: 'error',
            confirmButtonText: 'Okay!',
            denyButtonText: `Cancel`,
            showCloseButton: true
        });
        return;
    }

    if (sendBtn) sendBtn.disabled = true;
    var element = document.getElementById('message');
    try {
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            sendQueue.push({ savedUsername, message });

            try {
                await ensureConnected();
                await flushQueue();
            } catch (err) {
                console.warn("Couldn't connect to queue at the moment, queueing:", err);
            }
        } else {
            await connection.invoke("SendMessage", savedUsername, message);
        }

        messageEl.value = "";
        messageEl.focus();
    } catch (err) {
        console.error("Failed to send message:", err);
    } finally {
        if (sendBtn) sendBtn.disabled = false;
        validateMaxInputLength(200, element, 'txtCharactersRemaining')
    }
}

function initSignalRHandlers(conn) {
    conn.on("ReceiveMessage", (user, message) => {
        appendMessage(user, message);
    });

    conn.onclose(async (err) => {
        console.warn("Connection lost:", err);
        appendMessage("SYSTEM", "Connection Lost. Attempting to reconnect...");
    });

    conn.onreconnecting((err) => {
        console.warn("Reconnecting:", err);
        appendMessage("SYSTEM", "Reconnecting to the server...");
    });

    conn.onreconnected((connectionId) => {
        console.info("Reconnected. ConnectionId:", connectionId);
        appendMessage("SYSTEM", "Reconnected to the server.");
        flushQueue().catch(e => console.error("Failed to flush queue after reconnecting:", e));
    });
}

async function init() {
    if (connection) {
        console.warn("SignalR already initialized.");
        return;
    }

    const token = getToken();
    const urlOptions = token
        ? { accessTokenFactory: () => token }
        : undefined;

    connection = new signalR.HubConnectionBuilder()
        .withUrl(getApiUrl() + "/chatHub", urlOptions)
        .withAutomaticReconnect()
        .build();

    initSignalRHandlers(connection);

    try {
        await ensureConnected();
        appendMessage("SYSTEM", "Connected to chat.");
        await flushQueue();
    } catch (err) {
        appendMessage("SYSTEM", "Connection failed, messages will be lined up.");
    }

    const messageEl = document.getElementById("message");
    if (messageEl) {
        messageEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    const sendBtn = document.getElementById("sendBtn");
    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
}

document.addEventListener("DOMContentLoaded", () => {
    init().catch(err => console.error("Erro no init:", err));
});