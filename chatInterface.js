// chatInterface.js - Bella's Chat Interface Component
// 벨라의 채팅 인터페이스 컴포넌트  
// This module is responsible for creating and managing the elegant chat interface, reflecting Bella's warm personality

class ChatInterface {
    constructor() {
        this.isVisible = false;
        this.messages = [];
        this.maxMessages = 50; // Maximum 50 messages to display / 최대 50개 메시지 표시
        this.chatContainer = null;
        this.messageContainer = null;
        this.inputContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.toggleButton = null;
        this.settingsPanel = null;
        this.isSettingsVisible = false;
        
        this.init();
    }

    // Initialize chat interface / 채팅 인터페이스 초기화
    init() {
        this.createChatContainer();
        this.createToggleButton();
        this.createSettingsPanel();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    // Create chat container / 채팅 컨테이너 생성
    createChatContainer() {
        // Main chat container / 메인 채팅 컨테이너
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'bella-chat-container';
        this.chatContainer.innerHTML = `
            <div class="bella-chat-header">
                <div class="bella-chat-title">
                    <div class="bella-avatar">💝</div>
                    <div class="bella-title-text">
                        <h3>Bella / 벨라</h3>
                        <span class="bella-status">Online / 온라인</span>
                    </div>
                </div>
                <div class="bella-chat-controls">
                    <button class="bella-settings-btn" title="Settings / 설정">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="bella-minimize-btn" title="Minimize / 최소화">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            <div class="bella-chat-messages"></div>
            <div class="bella-chat-input-container">
                <div class="bella-input-wrapper">
                    <input type="text" class="bella-message-input" placeholder="Chat with Bella... / 벨라와 대화하기..." maxlength="500">
                    <button class="bella-send-btn" title="Send / 전송">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="bella-input-hint">
                    Press Enter to send, Shift + Enter for new line / Enter 전송, Shift + Enter 줄바꿈
                </div>
            </div>
        `;

        // Get key element references / 주요 요소 참조 가져오기
        this.messageContainer = this.chatContainer.querySelector('.bella-chat-messages');
        this.inputContainer = this.chatContainer.querySelector('.bella-chat-input-container');
        this.messageInput = this.chatContainer.querySelector('.bella-message-input');
        this.sendButton = this.chatContainer.querySelector('.bella-send-btn');
        
        document.body.appendChild(this.chatContainer);
    }

    // Create toggle button / 토글 버튼 생성
    createToggleButton() {
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'bella-chat-toggle';
        this.toggleButton.innerHTML = `
            <div class="bella-toggle-icon">
                <i class="fas fa-comments"></i>
            </div>
            <div class="bella-toggle-text">Chat with Bella / 벨라와 채팅</div>
        `;
        this.toggleButton.title = 'Open chat window / 채팅 창 열기';
        
        document.body.appendChild(this.toggleButton);
    }

    // Create settings panel / 설정 패널 생성
    createSettingsPanel() {
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.className = 'bella-settings-panel';
        this.settingsPanel.innerHTML = `
            <div class="bella-settings-header">
                <h4>Chat Settings / 채팅 설정</h4>
                <button class="bella-settings-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="bella-settings-content">
                <div class="bella-setting-group">
                    <label>AI Service Provider / AI 서비스 제공자</label>
                    <select class="bella-provider-select">
                        <option value="local">Local Model / 로컬 모델</option>
                        <option value="openai">OpenAI GPT</option>
                        <option value="qwen">Qwen / 통의천문</option>
                        <option value="ernie">ERNIE Bot / 원신일언</option>
                        <option value="glm">Zhipu AI / 지푸 AI</option>
                    </select>
                </div>
                <div class="bella-setting-group bella-api-key-group" style="display: none;">
                    <label>API Key / API 키</label>
                    <input type="password" class="bella-api-key-input" placeholder="Enter API Key / API 키 입력">
                    <button class="bella-api-key-save">Save / 저장</button>
                </div>
                <div class="bella-setting-group">
                    <label>Chat Mode / 채팅 모드</label>
                    <select class="bella-mode-select">
                        <option value="casual">Casual Chat / 가벼운 대화</option>
                        <option value="assistant">Smart Assistant / 스마트 어시스턴트</option>
                        <option value="creative">Creative Partner / 창의적 파트너</option>
                    </select>
                </div>
                <div class="bella-setting-group">
                    <button class="bella-clear-history">Clear Chat History / 채팅 기록 삭제</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.settingsPanel);
    }

    // Bind events / 이벤트 바인딩
    bindEvents() {
        // Toggle chat window / 채팅 창 토글
        this.toggleButton.addEventListener('click', () => {
            this.toggle();
        });

        // Minimize button / 최소화 버튼
        this.chatContainer.querySelector('.bella-minimize-btn').addEventListener('click', () => {
            this.hide();
        });

        // Settings button / 설정 버튼
        this.chatContainer.querySelector('.bella-settings-btn').addEventListener('click', () => {
            this.toggleSettings();
        });

        // Send message / 메시지 전송
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Input field events / 입력 필드 이벤트
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-adjust input field height / 입력 필드 높이 자동 조정
        this.messageInput.addEventListener('input', () => {
            this.adjustInputHeight();
        });

        // Settings panel events / 설정 패널 이벤트
        this.bindSettingsEvents();
    }

    // Bind settings panel events / 설정 패널 이벤트 바인딩
    bindSettingsEvents() {
        // Close settings panel / 설정 패널 닫기
        this.settingsPanel.querySelector('.bella-settings-close').addEventListener('click', () => {
            this.hideSettings();
        });

        // Provider selection / 제공자 선택
        const providerSelect = this.settingsPanel.querySelector('.bella-provider-select');
        const apiKeyGroup = this.settingsPanel.querySelector('.bella-api-key-group');
        
        providerSelect.addEventListener('change', (e) => {
            const provider = e.target.value;
            if (provider === 'local') {
                apiKeyGroup.style.display = 'none';
            } else {
                apiKeyGroup.style.display = 'block';
            }
            
            // Trigger provider change event / 제공자 변경 이벤트 트리거
            this.onProviderChange?.(provider);
        });

        // Save API key / API 키 저장
        this.settingsPanel.querySelector('.bella-api-key-save').addEventListener('click', () => {
            const provider = providerSelect.value;
            const apiKey = this.settingsPanel.querySelector('.bella-api-key-input').value;
            
            if (apiKey.trim()) {
                this.onAPIKeySave?.(provider, apiKey.trim());
                this.showNotification('API key saved / API 키 저장됨', 'success');
            }
        });

        // Clear chat history / 채팅 기록 삭제
        this.settingsPanel.querySelector('.bella-clear-history').addEventListener('click', () => {
            this.clearMessages();
            this.onClearHistory?.();
            this.hideSettings();
        });
    }

    // Add welcome message / 환영 메시지 추가
    addWelcomeMessage() {
        this.addMessage('assistant', 'Hello! I\'m Bella, your AI companion. Nice to meet you! What would you like to talk about? / 안녕하세요! 저는 벨라, 당신의 AI 파트너입니다. 만나서 반가워요! 무엇에 대해 이야기하고 싶으세요?', true);
    }

    // Toggle chat window visibility / 채팅 창 표시/숨기기 토글
    toggle() {
        console.log('ChatInterface.toggle() called');
        console.log('Before toggle isVisible:', this.isVisible);
        
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
        
        console.log('After toggle isVisible:', this.isVisible);
    }

    // Show chat window / 채팅 창 표시
    show() {
        console.log('ChatInterface.show() called');
        console.log('Before show isVisible:', this.isVisible);
        console.log('Before show chatContainer.className:', this.chatContainer.className);
        
        this.isVisible = true;
        this.chatContainer.classList.add('visible');
        
        console.log('After show isVisible:', this.isVisible);
        console.log('After show chatContainer.className:', this.chatContainer.className);
        console.log('chatContainer computed style opacity:', window.getComputedStyle(this.chatContainer).opacity);
        console.log('chatContainer computed style transform:', window.getComputedStyle(this.chatContainer).transform);
        
        this.toggleButton.classList.add('active');
        this.messageInput.focus();
        this.scrollToBottom();
    }

    // Hide chat window / 채팅 창 숨기기
    hide() {
        this.isVisible = false;
        this.chatContainer.classList.remove('visible');
        this.toggleButton.classList.remove('active');
        this.hideSettings();
    }

    // Toggle settings panel / 설정 패널 토글
    toggleSettings() {
        if (this.isSettingsVisible) {
            this.hideSettings();
        } else {
            this.showSettings();
        }
    }

    // Show settings panel / 설정 패널 표시
    showSettings() {
        this.isSettingsVisible = true;
        this.settingsPanel.classList.add('visible');
    }

    // Hide settings panel / 설정 패널 숨기기
    hideSettings() {
        this.isSettingsVisible = false;
        this.settingsPanel.classList.remove('visible');
    }

    // Send message / 메시지 전송
    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        // Add user message / 사용자 메시지 추가
        this.addMessage('user', text);
        
        // Clear input field / 입력 필드 초기화
        this.messageInput.value = '';
        this.adjustInputHeight();
        
        // Trigger message send event / 메시지 전송 이벤트 트리거
        this.onMessageSend?.(text);
    }

    // Add message to chat interface / 채팅 인터페이스에 메시지 추가
    addMessage(role, content, isWelcome = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `bella-message bella-message-${role}`;
        
        if (isWelcome) {
            messageElement.classList.add('bella-welcome-message');
        }

        const timestamp = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="bella-message-avatar">
                ${role === 'user' ? '👤' : '💝'}
            </div>
            <div class="bella-message-content">
                <div class="bella-message-text">${this.formatMessage(content)}</div>
                <div class="bella-message-time">${timestamp}</div>
            </div>
        `;

        this.messageContainer.appendChild(messageElement);
        this.messages.push({ role, content, timestamp: Date.now() });

        // Limit message count / 메시지 수 제한
        if (this.messages.length > this.maxMessages) {
            const oldMessage = this.messageContainer.firstChild;
            if (oldMessage) {
                this.messageContainer.removeChild(oldMessage);
            }
            this.messages.shift();
        }

        // Scroll to bottom / 하단으로 스크롤
        this.scrollToBottom();

        // Add animation effect / 애니메이션 효과 추가
        setTimeout(() => {
            messageElement.classList.add('bella-message-appear');
        }, 10);
    }

    // Format message content / 메시지 내용 포맷
    formatMessage(content) {
        // Simple text formatting with line break support / 줄바꿈을 지원하는 간단한 텍스트 포맷
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    // Show typing indicator / 타이핑 표시기 표시
    showTypingIndicator() {
        const existingIndicator = this.messageContainer.querySelector('.bella-typing-indicator');
        if (existingIndicator) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'bella-typing-indicator';
        typingElement.innerHTML = `
            <div class="bella-message-avatar">💝</div>
            <div class="bella-message-content">
                <div class="bella-typing-dots">
                    <span class="bella-typing-dot"></span>
                    <span class="bella-typing-dot"></span>
                    <span class="bella-typing-dot"></span>
                </div>
            </div>
        `;

        this.messageContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        // Add display animation / 표시 애니메이션 추가
        setTimeout(() => {
            typingElement.classList.add('bella-typing-show');
        }, 10);
    }

    // Hide typing indicator / 타이핑 표시기 숨기기
    hideTypingIndicator() {
        const indicator = this.messageContainer.querySelector('.bella-typing-indicator');
        if (indicator) {
            this.messageContainer.removeChild(indicator);
        }
    }

    // Clear all messages / 모든 메시지 삭제
    clearMessages() {
        this.messageContainer.innerHTML = '';
        this.messages = [];
        this.addWelcomeMessage();
    }

    // Scroll to bottom / 하단으로 스크롤
    scrollToBottom() {
        setTimeout(() => {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }, 10);
    }

    // Adjust input field height / 입력 필드 높이 조정
    adjustInputHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    // Show notification / 알림 표시
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `bella-notification bella-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('bella-notification-show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('bella-notification-show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Check if chat window is visible / 채팅 창 표시 여부 확인
    getVisibility() {
        return this.isVisible;
    }

    // Set callback functions / 콜백 함수 설정
    onMessageSend = null;
    onProviderChange = null;
    onAPIKeySave = null;
    onClearHistory = null;
}

// ES6 module export / ES6 모듈 내보내기
export { ChatInterface };
