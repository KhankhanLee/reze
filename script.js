// Import BellaAI core module / BellaAI 핵심 모듈 가져오기
import { BellaAI } from './core.js';
import { ChatInterface } from './chatInterface.js';

document.addEventListener('DOMContentLoaded', async function() {
    // --- Get all necessary DOM elements first ---
    const transcriptDiv = document.getElementById('transcript');
    const loadingScreen = document.getElementById('loading-screen');
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');
    const micButton = document.getElementById('mic-button');


    // --- AI Core Initialization ---
    let bellaAI;
    let chatInterface;
    
    // First initialize chat interface (not dependent on AI) / 먼저 채팅 인터페이스 초기화 (AI에 의존하지 않음)
    try {
        chatInterface = new ChatInterface();
        console.log('Chat interface initialized successfully / 채팅 인터페이스 초기화 성공');
        console.log('ChatInterface instance created:', chatInterface);
        console.log('Chat container element:', chatInterface.chatContainer);
        console.log('Chat container in DOM:', document.body.contains(chatInterface.chatContainer));
        
        // Auto-show chat interface (for debugging) / 자동으로 채팅 인터페이스 표시 (디버깅용)
        setTimeout(() => {
            console.log('Attempting to auto-show chat interface...');
            chatInterface.show();
            console.log('Chat interface auto-showed');
            console.log('Chat interface visibility:', chatInterface.getVisibility());
            console.log('Chat container class name:', chatInterface.chatContainer.className);
        }, 2000);
    } catch (error) {
        console.error('Chat interface initialization failed:', error);
    }
    
    // Then try to initialize AI core / 그런 다음 AI 코어 초기화 시도
    micButton.disabled = true;
    transcriptDiv.textContent = 'Awakening Bella\'s core... / 벨라의 핵심을 깨우는 중...';
    try {
        bellaAI = await BellaAI.getInstance();
        console.log('Bella AI initialized successfully / Bella AI 초기화 성공');
        
        // Set chat interface AI callback function / 채팅 인터페이스의 AI 콜백 함수 설정
        if (chatInterface) {
            chatInterface.onMessageSend = async (message) => {
                try {
                    chatInterface.showTypingIndicator();
                    const response = await bellaAI.think(message);
                    chatInterface.hideTypingIndicator();
                    chatInterface.addMessage('assistant', response);
                } catch (error) {
                    console.error('AI processing error:', error);
                    chatInterface.hideTypingIndicator();
                    chatInterface.addMessage('assistant', 'Sorry, I\'m a bit confused right now. Please try again later... / 죄송합니다, 지금 좀 혼란스러워요. 나중에 다시 시도해주세요...');
                }
            };
        }
        
        micButton.disabled = false;
        transcriptDiv.textContent = 'Bella is ready. Please click the microphone to start a conversation. / 벨라가 준비되었습니다. 마이크를 클릭하여 대화를 시작하세요.';
    } catch (error) {
        console.error('Failed to initialize Bella AI:', error);
        transcriptDiv.textContent = 'AI model loading failed, but chat interface is still available. / AI 모델 로드 실패, 하지만 채팅 인터페이스는 여전히 사용 가능합니다.';
        
        // Even if AI fails, provide basic chat functionality / AI가 실패해도 기본 채팅 기능 제공
        if (chatInterface) {
            chatInterface.onMessageSend = async (message) => {
                chatInterface.showTypingIndicator();
                setTimeout(() => {
                    chatInterface.hideTypingIndicator();
                    const fallbackResponses = [
                        'My AI core is still loading. Please try again later... / 제 AI 코어가 아직 로딩 중입니다. 나중에 다시 시도해주세요...',
                        'Sorry, I can\'t think properly right now, but I\'m learning! / 죄송합니다, 지금은 제대로 생각할 수 없지만 열심히 배우고 있어요!',
                        'My brain is still starting up. Please give me some time... / 제 두뇌가 아직 시작 중입니다. 조금만 기다려주세요...',
                        'System is updating. Unable to provide intelligent responses temporarily. / 시스템 업데이트 중. 일시적으로 지능형 응답을 제공할 수 없습니다.'
                    ];
                    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
                    chatInterface.addMessage('assistant', randomResponse);
                }, 1000);
            };
        }
        
        // Disable voice function, but keep interface available / 음성 기능 비활성화하지만 인터페이스는 사용 가능
        micButton.disabled = true;
    }

    // --- Loading screen handling ---
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        // Hide it after the animation to prevent it from blocking interactions
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Show chat control panel / 채팅 컨트롤 패널 표시
            const chatControlPanel = document.querySelector('.chat-control-panel');
            if (chatControlPanel) {
                chatControlPanel.classList.add('visible');
            }
        }, 500); // This time should match the transition time in CSS
    }, 1500); // Start fading out after 1.5 seconds

    let activeVideo = video1;
    let inactiveVideo = video2;

    // Video list / 비디오 목록
    const videoList = [
        '视频资源/3D 建模图片制作.mp4',
        '视频资源/jimeng-2025-07-16-1043-笑着优雅的左右摇晃，过一会儿手扶着下巴，保持微笑.mp4',
        '视频资源/jimeng-2025-07-16-4437-比耶，然后微笑着优雅的左右摇晃.mp4',
        '视频资源/生成加油视频.mp4',
        '视频资源/生成跳舞视频.mp4',
        '视频资源/负面/jimeng-2025-07-16-9418-双手叉腰，嘴巴一直在嘟囔，表情微微生气.mp4'
    ];

    // --- Video cross-fade playback function / 비디오 교차 페이드 재생 기능 ---
    function switchVideo() {
        // 1. Select next video / 1. 다음 비디오 선택
        const currentVideoSrc = activeVideo.querySelector('source').getAttribute('src');
        let nextVideoSrc = currentVideoSrc;
        while (nextVideoSrc === currentVideoSrc) {
            const randomIndex = Math.floor(Math.random() * videoList.length);
            nextVideoSrc = videoList[randomIndex];
        }

        // 2. Set source of inactive video element / 2. 비활성 비디오 요소의 소스 설정
        inactiveVideo.querySelector('source').setAttribute('src', nextVideoSrc);
        inactiveVideo.load();

        // 3. When inactive video can play, perform switch / 3. 비활성 비디오가 재생 가능할 때 전환 수행
        inactiveVideo.addEventListener('canplaythrough', function onCanPlayThrough() {
            // Ensure event only triggers once / 이벤트가 한 번만 트리거되도록 보장
            inactiveVideo.removeEventListener('canplaythrough', onCanPlayThrough);

            // 4. Play new video / 4. 새 비디오 재생
            inactiveVideo.play().catch(error => {
                console.error("Video play failed:", error);
            });

            // 5. Switch active class to trigger CSS transition / 5. active 클래스 전환하여 CSS 전환 트리거
            activeVideo.classList.remove('active');
            inactiveVideo.classList.add('active');

            // 6. Update roles / 6. 역할 업데이트
            [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];

            // Bind ended event for new activeVideo / 새 activeVideo에 종료 이벤트 바인딩
            activeVideo.addEventListener('ended', switchVideo, { once: true });
        }, { once: true }); // Use { once: true } to ensure event is only handled once / { once: true }를 사용하여 이벤트가 한 번만 처리되도록 보장
    }

    // Initial startup / 초기 시작
    activeVideo.addEventListener('ended', switchVideo, { once: true });
    
    // Chat control button events / 채팅 제어 버튼 이벤트
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatTestBtn = document.getElementById('chat-test-btn');
    
    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            if (chatInterface) {
                console.log('聊天按钮被点击');
                console.log('点击前聊天界面状态:', chatInterface.getVisibility());
                console.log('点击前聊天容器类名:', chatInterface.chatContainer.className);
                
                chatInterface.toggle();
                
                console.log('After click chat interface state:', chatInterface.getVisibility());
                console.log('After click chat container class name:', chatInterface.chatContainer.className);
                console.log('Chat interface toggled, current state:', chatInterface.getVisibility());
                
                // Update button state / 버튼 상태 업데이트
                const isVisible = chatInterface.getVisibility();
                chatToggleBtn.innerHTML = isVisible ? 
                    '<i class="fas fa-times"></i><span>Close / 닫기</span>' : 
                    '<i class="fas fa-comments"></i><span>Chat / 채팅</span>';
                console.log('Button text updated to:', chatToggleBtn.innerHTML);
            }
        });
    }
    
    if (chatTestBtn) {
        chatTestBtn.addEventListener('click', () => {
            if (chatInterface) {
                const testMessages = [
                    'Hello! I\'m Bella, nice to meet you! / 안녕하세요! 저는 벨라입니다, 만나서 반가워요!',
                    'Chat interface is working normally, all functions are ready. / 채팅 인터페이스가 정상 작동 중, 모든 기능이 준비되었습니다.',
                    'This is a test message to verify interface functionality. / 인터페이스 기능을 확인하는 테스트 메시지입니다.'
                ];
                const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
                chatInterface.addMessage('assistant', randomMessage);
                
                // If chat interface is not shown, auto-show / 채팅 인터페이스가 표시되지 않은 경우 자동 표시
                if (!chatInterface.getVisibility()) {
                    chatInterface.show();
                    chatToggleBtn.innerHTML = '<i class="fas fa-times"></i><span>Close / 닫기</span>';
                }
                
                console.log('Test message added:', randomMessage);
            }
        });
    }


    // --- Speech recognition core / 음성 인식 핵심 ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    // Check if browser supports speech recognition / 브라우저가 음성 인식을 지원하는지 확인
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true; // Continuous recognition / 연속 인식
        recognition.lang = 'zh-CN'; // Set language to Chinese / 언어를 중국어로 설정
        recognition.interimResults = true; // Get interim results / 임시 결과 가져오기

        recognition.onresult = async (event) => {
            const transcriptContainer = document.getElementById('transcript');
            let final_transcript = '';
            let interim_transcript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }

            // Update interim results
            transcriptContainer.textContent = `You: ${final_transcript || interim_transcript} / 당신: ${final_transcript || interim_transcript}`;

            // Once we have a final result, process it with the AI
            if (final_transcript && bellaAI) {
                const userText = final_transcript.trim();
                transcriptContainer.textContent = `You: ${userText} / 당신: ${userText}`;

                // If chat interface is open, also show in chat window / 채팅 인터페이스가 열려있으면 채팅 창에도 표시
                if (chatInterface && chatInterface.getVisibility()) {
                    chatInterface.addMessage('user', userText);
                }

                try {
                    // Let Bella think
                    const thinkingText = document.createElement('p');
                    thinkingText.textContent = 'Bella is thinking... / 벨라가 생각 중...';
                    thinkingText.style.color = '#888';
                    thinkingText.style.fontStyle = 'italic';
                    transcriptContainer.appendChild(thinkingText);
                    
                    const response = await bellaAI.think(userText);
                    
                    transcriptContainer.removeChild(thinkingText);
                    const bellaText = document.createElement('p');
                    bellaText.textContent = `Bella: ${response} / 벨라: ${response}`;
                    bellaText.style.color = '#ff6b9d';
                    bellaText.style.fontWeight = 'bold';
                    bellaText.style.marginTop = '10px';
                    transcriptContainer.appendChild(bellaText);

                    // If chat interface is open, also show in chat window / 채팅 인터페이스가 열려있으면 채팅 창에도 표시
                    if (chatInterface && chatInterface.getVisibility()) {
                        chatInterface.addMessage('assistant', response);
                    }

                    // TTS function temporarily disabled, will be activated in next phase / TTS 기능 임시 비활성화, 다음 단계에서 활성화 예정
                    // TODO: Activate voice synthesis function / 음성 합성 기능 활성화
                    // const audioData = await bellaAI.speak(response);
                    // const blob = new Blob([audioData], { type: 'audio/wav' });
                    // const audioUrl = URL.createObjectURL(blob);
                    // const audio = new Audio(audioUrl);
                    // audio.play();

                } catch (error) {
                    console.error('Bella AI processing error:', error);
                    const errorText = document.createElement('p');
                    const errorMsg = 'Bella encountered a problem, but she\'s still learning... / 벨라가 문제를 겪었지만 여전히 배우고 있어요...';
                    errorText.textContent = errorMsg;
                    errorText.style.color = '#ff9999';
                    transcriptContainer.appendChild(errorText);
                    
                    if (chatInterface && chatInterface.getVisibility()) {
                        chatInterface.addMessage('assistant', errorMsg);
                    }
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error / 음성 인식 오류:', event.error);
        };

    } else {
        console.log('Your browser does not support speech recognition. / 브라우저가 음성 인식을 지원하지 않습니다.');
        // You can provide feedback to the user on the interface / 인터페이스에서 사용자에게 피드백을 제공할 수 있습니다
    }

    // --- Microphone button interaction / 마이크 버튼 상호작용 ---
    let isListening = false;

    micButton.addEventListener('click', function() {
        if (!SpeechRecognition) return; // If not supported, do nothing / 지원하지 않으면 아무것도 하지 않음

        isListening = !isListening;
        micButton.classList.toggle('is-listening', isListening);
        const transcriptContainer = document.querySelector('.transcript-container');
        const transcriptText = document.getElementById('transcript');

        if (isListening) {
            transcriptText.textContent = 'Listening... / 듣는 중...'; // Show prompt immediately / 즉시 프롬프트 표시
            transcriptContainer.classList.add('visible');
            recognition.start();
        } else {
            recognition.stop();
            transcriptContainer.classList.remove('visible');
            transcriptText.textContent = ''; // Clear text / 텍스트 지우기
        }
    });




});