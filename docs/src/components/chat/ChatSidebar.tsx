import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import type { ChatMessage } from '../../hooks/useSignalR';
import { confirm } from '../common/ConfirmDialog';
import { apiReportChatMessage } from '../../services/api';
import { showToast } from '../../utils/toast';
import Tooltip from '../common/Tooltip';

interface Props {
  open: boolean;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  loadOlderMessages: () => Promise<boolean>;
  hasMoreHistory: boolean;
}

const MAX_LENGTH = 200;

const escapeHtml = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default function ChatSidebar({ open, messages, onSendMessage, loadOlderMessages, hasMoreHistory }: Props) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState(MAX_LENGTH);
  const [agreed, setAgreed] = useState(() => localStorage.getItem('chat_agreed') === '1');
  const chatRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const loadingHistoryRef = useRef(false);
  const username = localStorage.getItem('username') ?? '';

  // Scroll handler: restore position after history prepend, or auto-scroll for new messages
  useLayoutEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    if (prevScrollHeightRef.current > 0) {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    } else {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleScroll = useCallback(async () => {
    const el = chatRef.current;
    if (!el || loadingHistoryRef.current || !hasMoreHistory) return;
    if (el.scrollTop <= 30) {
      loadingHistoryRef.current = true;
      prevScrollHeightRef.current = el.scrollHeight;
      await loadOlderMessages();
      loadingHistoryRef.current = false;
    }
  }, [hasMoreHistory, loadOlderMessages]);

  const handleAgree = () => {
    localStorage.setItem('chat_agreed', '1');
    setAgreed(true);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_LENGTH);
    setText(val);
    setRemaining(MAX_LENGTH - val.length);
  };

  const handleSend = async () => {
    const msg = text.trim();
    if (!msg) return;
    if (!username) {
      Swal.fire({
        title: 'Error!',
        text: 'Please Login before sending a message.',
        icon: 'error',
        confirmButtonText: 'Okay!',
        showCloseButton: true,
      });
      return;
    }
    setSending(true);
    try {
      await onSendMessage(msg);
      setText('');
      setRemaining(MAX_LENGTH);
    } catch {
      console.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReport = async (id: string, reportedUser: string) => {
    const ok = await confirm({
      title: 'Report message',
      message: `Are you sure you want to report this user's message?`,
      confirmText: 'Report',
      cancelText: 'Cancel',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await apiReportChatMessage(id);
      if (res.ok) {
        showToast.success(`Message from ${reportedUser} reported.`);
      } else if (res.status === 409) {
        showToast.info('You already reported this message.');
      } else if (res.status === 401) {
        showToast.error('You must be logged in to report messages.');
      } else {
        showToast.error('Could not report this message.');
      }
    } catch {
      showToast.error('Could not report this message.');
    }
  };

  return (
    <aside id="chatSidebar" className={open ? 'open border' : ''}>
      <div className="chatContainer" style={{ position: 'relative' }}>
        {/* First-time agreement overlay */}
        {!agreed && (
          <div className="chatAgreementOverlay">
            <div className="chatAgreementBox">
              <p className="chatAgreementTitle">Community Chat</p>
              <p className="chatAgreementText">
                By participating in this chat, you agree to follow community rules.
                If you receive a valid report, your account <strong>will be banned</strong> from the platform
                and your <strong>streak will be reset</strong>.
              </p>
              <button className="border chatAgreementBtn" onClick={handleAgree}>
                I Agree
              </button>
            </div>
          </div>
        )}

        <div id="messagesContainer">
          {hasMoreHistory && (
            <div className="chatHistoryHint">Scroll up to load older messages</div>
          )}
          <div id="chat" className="customizedScrollbar" ref={chatRef} onScroll={handleScroll}>
            {messages.map((msg, i) => (
              <div key={msg.id ?? i} className={`chat-msg${msg.isSystem ? ' chat-msg-system' : ''}`}>
                <p>
                  <b
                    style={{ color: msg.isSystem ? 'gray' : (msg.user === username ? 'darkgreen' : undefined) }}
                    dangerouslySetInnerHTML={{ __html: escapeHtml(msg.user) + ':' }}
                  />
                  <span dangerouslySetInnerHTML={{ __html: ' ' + escapeHtml(msg.message) }} />
                </p>
                {!msg.isSystem && msg.user !== username && msg.id && (
                  <Tooltip content="Report" placement="left">
                    <button
                      className="chat-report-btn"
                      onClick={() => handleReport(msg.id!, msg.user)}
                      aria-label="Report message"
                    >
                      <i className="fas fa-flag" />
                    </button>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </div>

        <div id="userActionsContainer">
          <div className="chatBoxContainer">
            <span
              id="txtCharactersRemaining"
              style={{ color: remaining === MAX_LENGTH ? 'black' : remaining <= 100 ? 'orange' : 'gray' }}
            >
              {remaining} characters left.
            </span>
            <textarea
              id="message"
              className="border"
              autoComplete="off"
              placeholder="Type your message here!"
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            id="btnSendMessage"
            className="border"
            onClick={handleSend}
            disabled={sending}
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
