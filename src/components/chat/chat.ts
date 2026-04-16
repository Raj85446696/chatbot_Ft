import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../environment.js';

declare var webkitSpeechRecognition: any;

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text?: string;
  html?: string;
  timestamp: Date;
  error?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  private readonly CHAT_STORAGE_KEY = 'umang_chat_history_v1';

  messages: Message[] = [];
  userInput = '';
  isLoading = false;
  errorMessage = '';
  isTypingEffectActive = false;
  pendingBotMessageId: number | null = null;

  /* Voice */
  recognition: any;
  isRecording = false;

  /* UI state */
  showScrollFab = false;
  isCopied: { [id: number]: boolean } = {};
  isFooterFocused = false;

  /* Suggestions */
  suggestedPrompts = [
    'What is umang?',
    'How do I Download my Aadhaar?',
    'Check PF balance status',
    'How to check my 12th result of cbse board examination?',
  ];

  private messageIdCounter = 0;
  private destroy$ = new Subject<void>();

  private readonly API_URL = `${environment.BASE_API_URL}${environment.ENDPOINTS.CHAT}`;
  private readonly TYPING_SPEED = 5;
  private readonly MAX_INPUT_LENGTH = 500;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    this.configureMarked();
  }

  // ---------------- INIT / DESTROY ----------------

  ngOnInit() {
    this.loadChatFromLocal();
    if (this.messages.length === 0) {
      this.addWelcomeMessage();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-IN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.userInput = transcript;
        this.isRecording = false;
        this.cdr.detectChanges();
      };

      this.recognition.onerror = () => {
        this.isRecording = false;
        this.cdr.detectChanges();
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.cdr.detectChanges();
      };
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------- LOCAL STORAGE ----------------

  private saveChatToLocal() {
    localStorage.setItem(this.CHAT_STORAGE_KEY, JSON.stringify(this.messages));
  }

  private loadChatFromLocal() {
    const saved = localStorage.getItem(this.CHAT_STORAGE_KEY);
    if (saved) {
      try {
        this.messages = JSON.parse(saved);
      } catch {
        this.messages = [];
      }
    }
  }

  // ---------------- MARKDOWN CONFIG ----------------

  private configureMarked() {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }

  // ---------------- MESSAGE HELPERS ----------------

  private generateMessageId(): number {
    return ++this.messageIdCounter;
  }

  private addWelcomeMessage() {
    this.messages.push({
      id: this.generateMessageId(),
      sender: 'bot',
      html: `<p>Hello! I'm <strong>UMANG Assistant</strong>. How can I help you today?</p>`,
      timestamp: new Date(),
    });
  }

  // ---------------- SEND MESSAGE ----------------

  sendMessage() {
    const message = this.userInput.trim();

    if (!message) {
      this.showError('Please enter a message');
      return;
    }

    if (message.length > this.MAX_INPUT_LENGTH) {
      this.showError(`Message too long (max ${this.MAX_INPUT_LENGTH} characters)`);
      return;
    }

    this.errorMessage = '';

    this.messages.push({
      id: this.generateMessageId(),
      sender: 'user',
      text: message,
      timestamp: new Date(),
    });
    this.saveChatToLocal();

    const botMessageId = this.generateMessageId();
    this.messages.push({
      id: botMessageId,
      sender: 'bot',
      html: '',
      timestamp: new Date(),
    });
    this.saveChatToLocal();

    this.isLoading = true;
    this.isTypingEffectActive = true;
    this.pendingBotMessageId = botMessageId;
    this.userInput = '';

    this.http
      .post<any>(this.API_URL, { question: message })
      .pipe(
        takeUntil(this.destroy$),
        catchError(() =>
          of({
            error: true,
            message: 'Server error. Please try again later.',
          }),
        ),
      )
      .subscribe((response) => {
        if (response.error) {
          this.updateBotMessage(botMessageId, `<p>${response.message}</p>`, false, true);
          return;
        }

        const parsedHtml = this.parseMarkdown(response.answer || 'No response received.');
        this.typeWriterEffect(parsedHtml, botMessageId);
      });
  }

  sendSuggestion(text: string) {
    this.userInput = text;
    this.sendMessage();
  }

  private parseMarkdown(text: string): string {
    try {
      return marked.parse(text) as string;
    } catch {
      return `<p>${text}</p>`;
    }
  }

  private typeWriterEffect(html: string, messageId: number) {
    let index = 0;
    let output = '';
    const chars = html.split('');

    const type = () => {
      if (index < chars.length) {
        output += chars[index++];
        this.updateBotMessage(messageId, output, true);
        setTimeout(type, this.TYPING_SPEED);
      } else {
        this.isLoading = false;
        this.isTypingEffectActive = false;
        if (this.pendingBotMessageId === messageId) {
          this.pendingBotMessageId = null;
        }
        this.cdr.detectChanges();
        this.openLinksInNewTab();
      }
    };

    setTimeout(type, 100);
  }

  private updateBotMessage(id: number, html: string, loading: boolean, isError = false) {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) {
      msg.html = html;
      if (isError) {
        msg.error = true;
      }
      this.saveChatToLocal();
      if (!loading) {
        this.isLoading = false;
        this.isTypingEffectActive = false;
        if (this.pendingBotMessageId === id) {
          this.pendingBotMessageId = null;
        }
      }
      this.cdr.detectChanges();
    }
  }

  isPendingBotMessage(msg: Message): boolean {
    const hasText = Boolean(msg.html?.trim() || msg.text?.trim());
    return (
      this.isLoading &&
      this.isTypingEffectActive &&
      this.pendingBotMessageId === msg.id &&
      !hasText
    );
  }

  // ---------------- LINK HANDLING ----------------

  openLinksInNewTab() {
    setTimeout(() => {
      document.querySelectorAll('.chat-messages a').forEach((link) => {
        const anchor = link as HTMLAnchorElement;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      });
    });
  }

  // ---------------- COPY MESSAGE ----------------

  copyMessage(text: string, id: number) {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.isCopied[id] = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          delete this.isCopied[id];
          this.cdr.detectChanges();
        }, 1500);
      })
      .catch(() => this.showError('Failed to copy text'));
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  clearChat() {
    this.messages = [];
    localStorage.removeItem(this.CHAT_STORAGE_KEY);
    this.pendingBotMessageId = null;
    this.isLoading = false;
    this.isTypingEffectActive = false;
    this.addWelcomeMessage();
    this.cdr.detectChanges();
  }

  toggleVoiceInput() {
    if (!this.recognition) {
      this.showError('Voice input not supported in this browser');
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    } else {
      this.recognition.start();
      this.isRecording = true;
    }
  }

  // ---------------- KEYBOARD HANDLER ----------------

  onEnterKey(event: Event) {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.sendMessage();
    }
  }

  // ---------------- TEXTAREA AUTO-RESIZE ----------------

  autoResizeTextarea(event: Event) {
    const ta = event.target as HTMLTextAreaElement;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }
}
