"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatIcon, CloseIcon, SendIcon } from "./icons";

type Msg = { from: "bot" | "me"; text: string };

/**
 * Floating "Skye" AI assistant. Talks to the n8n Chat Trigger through
 * /api/skye (server-side proxy, so the webhook URL never reaches the browser).
 */
export default function SkyeChat({
  slug,
  company,
  quoteWord,
  tel,
  greeting,
}: {
  slug: string;
  company: string;
  quoteWord: string;
  tel?: string;
  greeting?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text:
        greeting ??
        `Hi, I'm Skye, the assistant for ${company}. Ask me about a job, or I can help you get a ${quoteWord} or book a time.`,
    },
  ]);
  const session = useRef<string>("");
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launchRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    try {
      const k = `skye:${slug}`;
      session.current = sessionStorage.getItem(k) ?? crypto.randomUUID();
      sessionStorage.setItem(k, session.current);
    } catch {
      session.current = Math.random().toString(36).slice(2);
    }
  }, [slug]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [msgs, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = inputRef.current;
    const text = input?.value.trim();
    if (!text || busy) return;
    input!.value = "";
    setMsgs((m) => [...m, { from: "me", text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/skye", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, sessionId: session.current, message: text }),
      });
      if (res.status === 501) {
        setMsgs((m) => [
          ...m,
          { from: "bot", text: `Live chat switches on when this site launches. For now, use the ${quoteWord} form below${tel ? " or call" : ""}.` },
        ]);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { output?: string };
      if (!res.ok || !data.output) throw new Error();
      setMsgs((m) => [...m, { from: "bot", text: data.output! }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { from: "bot", text: `Sorry, I couldn't reply just now. You can use the ${quoteWord} form below${tel ? " or call" : ""}.` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            id={panelId}
            className="chat"
            role="dialog"
            aria-label={`Chat with Skye, assistant for ${company}`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ transformOrigin: "bottom right" }}
          >
            <header className="chat__head">
              <span className="chat-launch__dot" aria-hidden="true">
                <ChatIcon size={18} />
              </span>
              <div>
                <strong>Skye</strong>
                <span>AI assistant · {company}</span>
              </div>
              <button
                type="button"
                className="chat__close"
                aria-label="Close chat"
                onClick={() => {
                  setOpen(false);
                  launchRef.current?.focus();
                }}
              >
                <CloseIcon />
              </button>
            </header>
            <div className="chat__log" ref={logRef} aria-live="polite">
              {msgs.map((m, i) => (
                <p key={i} className={`msg msg--${m.from}`}>
                  {m.text}
                </p>
              ))}
              {busy && <p className="msg msg--bot muted">Skye is typing…</p>}
              {msgs.length === 1 && (
                <div className="chat__chips">
                  <a className="chip" href="#quote" onClick={() => setOpen(false)}>
                    Get a {quoteWord}
                  </a>
                  <a className="chip" href="#quote" onClick={() => setOpen(false)}>
                    Book a time
                  </a>
                  {tel && (
                    <a className="chip" href={tel}>
                      Call now
                    </a>
                  )}
                </div>
              )}
            </div>
            <form className="chat__form" onSubmit={send}>
              <label htmlFor={`${panelId}-in`} className="sr-only">
                Message to Skye
              </label>
              <input
                ref={inputRef}
                id={`${panelId}-in`}
                autoComplete="off"
                placeholder="Type your question"
              />
              <button type="submit" aria-label="Send message" disabled={busy}>
                <SendIcon />
              </button>
            </form>
            <p className="chat__note">Skye is an AI assistant and can get things wrong.</p>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        ref={launchRef}
        type="button"
        className="chat-launch"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close chat" : "Ask Skye, the AI assistant"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="chat-launch__dot" aria-hidden="true">
          {open ? <CloseIcon size={18} /> : <ChatIcon size={20} />}
        </span>
        <span className="chat-launch__label">{open ? "Close chat" : "Ask Skye"}</span>
      </button>
    </>
  );
}
