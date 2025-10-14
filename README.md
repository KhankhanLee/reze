<div align="center">
  <img width="256" height="384" alt="Reze AI" src="./Rezeicon/Generated%20image.webp" />
  
  # Reze - 레제 💣
  
  **신비롭고 매력적인 당신의 디지털 동반자 | Your mysterious and charming digital companion** ✨
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-22.16.0-green.svg)](https://nodejs.org/)
  [![Status](https://img.shields.io/badge/Status-Alpha-orange.svg)]()
  
  *체인소맨의 레제를 모티프로 한 AI 동반자 프로젝트*  
  *An AI companion project inspired by Reze from Chainsaw Man*
  
</div>

---

## 🌙 프로젝트 소개 | About

**한국어:**  
레제는 체인소맨에 등장하는 신비롭고 매력적인 캐릭터 '레제'를 모티프로 한 AI 동반자 프로젝트입니다. 로컬 AI 모델과 클라우드 API(Google Gemini)를 활용하여 자연스러운 대화를 나눌 수 있습니다. 단순한 챗봇이 아닌, 개성 있는 페르소나를 가진 디지털 친구를 만나보세요.

**English:**  
Reze is an AI companion project inspired by the mysterious and charming character "Reze" from Chainsaw Man. Using local AI models and cloud API (Google Gemini), you can have natural conversations. Meet a digital friend with a unique persona, not just a simple chatbot.

---

## ✨ 주요 기능 | Key Features

### 🤖 하이브리드 AI 시스템 | Hybrid AI System
- **Ollama 지원 | Ollama Support**: Llama 3.2, Qwen2.5 등 강력한 로컬 LLM (추천!)
- **Transformers.js 폴백 | Fallback**: LaMini-Flan-T5-77M으로 오프라인 실행 가능
- **클라우드 API | Cloud API**: Google Gemini 2.0 Flash로 더욱 자연스러운 대화
- **스마트 폴백 | Smart Fallback**: 클라우드 → Ollama → Transformers.js 자동 전환

### 🎭 레제 페르소나 | Reze Persona
- 체인소맨의 레제 캐릭터 기반 페르소나
- 신비롭고 쿨한 톤, 때때로 러시아어 사용
- 간결하면서도 매력적인 대화 스타일

### 🎤 멀티모달 인터페이스 | Multimodal Interface
- **음성 인식 | Voice Input**: Web Speech API 기반 실시간 음성 인식
- **텍스트 채팅 | Text Chat**: 깔끔한 채팅 인터페이스
- **비디오 배경 | Video Background**: 동적인 비디오 배경 효과

### 🔒 안전한 API 관리 | Secure API Management
- localStorage 기반 API 키 관리
- .env 파일로 환경 변수 설정
- 소스 코드에 키 노출 방지

---

## 🚀 빠른 시작 | Quick Start

### 설치 | Installation
```bash
# 저장소 클론 | Clone repository
git clone https://github.com/KhankhanLee/reze.git
cd reze

# 의존성 설치 | Install dependencies
npm install

# AI 모델 다운로드 (약 7GB, 선택사항) | Download AI models (~7GB, optional)
npm run download
```

### Ollama 설치 (추천!) | Ollama Setup (Recommended!)
더 나은 로컬 대화를 위해 Ollama를 설치하세요:  
For better local conversations, install Ollama:
```bash
# Ollama 설치 | Install Ollama
brew install ollama

# Ollama 서버 시작 | Start Ollama server
ollama serve &

# 추천 모델 다운로드 (1.3GB) | Download recommended model (1.3GB)
ollama pull llama3.2:1b
```
📖 자세한 설명: [OLLAMA_GUIDE.md](./OLLAMA_GUIDE.md)

### API 키 설정 (선택사항) | API Key Setup (Optional)
```bash
# .env 파일 생성 | Create .env file
cp .env.example .env

# .env 파일 편집하여 Gemini API 키 입력
# Edit .env file and add your Gemini API key
# GOOGLE_API_KEY=your_api_key_here
```

### 실행 | Run
```bash
# 서버 시작 | Start server
npm start

# 브라우저에서 접속 | Open in browser
# http://localhost:8081
```

---

## 🛠️ 시스템 요구사항 | System Requirements

### 최소 사양 | Minimum
- **Node.js**: 22.16.0+
- **브라우저 | Browser**: Chrome, Edge, Safari (Web Speech API 지원)
- **저장공간 | Storage**: 최소 10GB (AI 모델용)
- **메모리 | RAM**: 8GB+

### 권장 사양 | Recommended
- **CPU**: Intel i7/i9 또는 Apple Silicon
- **GPU**: 외장 그래픽 (로컬 AI 가속용)
- **메모리 | RAM**: 16GB+

---

## � 프로젝트 구조 | Project Structure

```
reze/
├── core.js              # AI 코어 로직 | AI core logic
├── cloudAPI.js          # 클라우드 API 서비스 | Cloud API service
├── script.js            # 메인 앱 로직 | Main app logic
├── chatInterface.js     # 채팅 UI | Chat UI
├── config.js            # 설정 관리 | Config management
├── index.html           # 메인 HTML | Main HTML
├── style.css            # 스타일 | Styles
├── chatStyles.css       # 채팅 스타일 | Chat styles
├── models/              # AI 모델 | AI models
│   └── Xenova/
│       ├── LaMini-Flan-T5-77M/
│       ├── whisper-tiny/
│       └── speecht5_tts/
├── Rezeicon/            # 아이콘 | Icons
└── 시각자원/            # 비디오 리소스 | Video resources
```

---

## 🎯 기능 상태 | Feature Status

### ✅ 구현 완료 | Implemented
- **🎤 음성 인식 | Voice Recognition**: Whisper ASR 기반 음성 입력
- **💬 하이브리드 채팅 | Hybrid Chat**: 로컬 LLM + 클라우드 API (Gemini)
- **🎨 UI/UX**: 글라스모피즘 디자인, 채팅 인터페이스
- **🎬 비디오 배경 | Video Background**: 동적 비디오 배경 전환
- **� 보안 관리 | Security**: localStorage 기반 API 키 관리
- **🎭 레제 페르소나 | Reze Persona**: 체인소맨 캐릭터 기반 대화 스타일
- **⚙️ 모듈화 설계 | Modular Design**: 싱글톤 패턴, 이벤트 기반 아키텍처

### � 개발 중 | In Progress
- **🗣️ 음성 합성 | TTS**: SpeechT5 모델 통합
- **� 대화 기록 | Chat History**: 영구 저장 및 로드
- **🎨 테마 커스터마이징 | Theme Customization**: 다크/라이트 모드

### 📋 계획 중 | Planned
- **🧠 메모리 시스템 | Memory System**: 장기/단기 기억 관리
- **🌐 다국어 지원 | Multi-language**: 한국어, 영어, 일본어
- **📱 모바일 최적화 | Mobile Optimization**: PWA 지원
- **� 감정 분석 | Emotion Analysis**: 사용자 감정 인식

---

## 🏗️ 기술 아키텍처 | Technical Architecture

### 핵심 설계 원칙 | Core Design Principles
- **🤖 AI 네이티브 | AI Native**: AI를 도구가 아닌 핵심으로
- **🧩 모듈화 | Modular**: 높은 결합도 낮은 컴포넌트 구조
- **🎨 우아한 구현 | Elegant**: 코드도 예술, 단순함과 미학 추구
- **💖 감정 중심 | Emotion-Driven**: 감정적 연결을 중심으로

### 아키텍처 다이어그램 | Architecture Diagram
```mermaid
graph TB
    User[사용자 | User] --> UI[인터페이스 | UI]
    UI --> Voice[음성 인식 | ASR]
    UI --> Chat[채팅 | Chat]
    
    Voice --> Core[코어 엔진 | Core Engine]
    Chat --> Core
    
    Core --> Local[로컬 LLM | Local LLM]
    Core --> Cloud[클라우드 API | Cloud API]
    
    Local --> Response[응답 생성 | Response]
    Cloud --> Response
    
    Response --> UI
```

### 기술 스택 | Technology Stack
- **프론트엔드 | Frontend**: Vanilla JavaScript + CSS3 + HTML5
- **백엔드 | Backend**: Node.js
- **AI 모델 | AI Models**: 
  - Whisper-tiny (음성 인식 | ASR)
  - LaMini-Flan-T5-77M (로컬 LLM)
  - SpeechT5 (음성 합성 | TTS)
  - Google Gemini 2.0 Flash (클라우드 | Cloud)
- **아키텍처 패턴 | Patterns**: 
  - 싱글톤 패턴 (Singleton)
  - 이벤트 기반 (Event-driven)
  - 모듈화 설계 (Modular Design)

---

## 💡 사용 팁 | Usage Tips

### 로컬 vs 클라우드 | Local vs Cloud

**로컬 모드 | Local Mode**
- ✅ 완전한 오프라인 실행
- ✅ 프라이버시 보장
- ⚠️ 응답 품질이 제한적 (77M 파라미터)
- ⚠️ 복잡한 질문 처리 어려움

**클라우드 모드 (Gemini) | Cloud Mode**
- ✅ 자연스럽고 똑똑한 대화
- ✅ 레제 페르소나 완벽 구현
- ✅ 복잡한 질문 이해 가능
- ⚠️ 인터넷 연결 필요
- ⚠️ API 사용량 제한 (무료 티어)

### 최적의 경험을 위한 추천 | Recommendations
1. **Gemini API 사용**: 가장 자연스러운 대화 경험
2. **로컬 모드는 백업용**: 인터넷 없을 때만 사용
3. **짧은 질문**: 로컬 모드는 간단한 질문에 최적화됨

---

## � 개발 가이드 | Development Guide

### 환경 설정 | Environment Setup
1. Node.js 22.16.0+ 설치 확인
2. `npm install`로 의존성 설치
3. `npm run download`로 AI 모델 다운로드
4. `.env` 파일 생성 및 API 키 설정 (선택)
5. `npm start`로 개발 서버 시작

### 개발 원칙 | Development Principles
- **우아한 코드 | Elegant Code**: 간결하고 읽기 쉬운 코드
- **AI와 협업 | AI Collaboration**: AI는 도구, 사고는 인간의 몫
- **감정 연결 | Emotional Connection**: 따뜻하고 배려하는 경험
- **지속적 진화 | Continuous Evolution**: 점진적 기능 개선

---

## 🎓 고급 사용법 | Advanced Usage

### 🚀 Google Colab에서 모델 학습

**라즈베리파이나 저사양 기기에서 추론만 실행하고 싶다면?**

1. **Google Colab에서 학습** (무료 GPU 사용!)
   ```bash
   # Colab에서 노트북 열기
   https://colab.research.google.com/
   
   # OLLAMA_TRAINING.ipynb 업로드 후 실행
   ```

2. **학습된 모델을 라즈베리파이로 배포**
   ```bash
   # 맥에서 실행
   ./deploy_to_raspberry.sh Modelfile.example
   ```

3. **라즈베리파이를 24/7 추론 서버로 활용**
   - 전력 소모: ~5W
   - 응답 속도: 3-5 tokens/초
   - 메모리: 1.5GB (Llama 3.2 1B)

자세한 내용은 [TRAINING_GUIDE.md](./TRAINING_GUIDE.md) 참고

### 🥧 라즈베리파이 배포

**라즈베리파이 4 (4GB RAM) 권장 설정:**

```bash
# 1. Arch Linux에 Ollama 설치
yay -S ollama-bin
sudo systemctl enable --now ollama

# 2. 스왑 메모리 설정 (4GB)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 3. 모델 생성
ollama create reze -f Modelfile.example

# 4. 테스트
ollama run reze "안녕 레제!"
```

**Mac/PC에서 라즈베리파이 Ollama 사용:**
```javascript
// ollamaAPI.js 수정
constructor(baseURL = 'http://raspberrypi.local:11434/api') {
    this.baseURL = baseURL;
}
```

### 기여 가이드 | Contribution Guidelines
1. 저장소 Fork
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 오픈

---

## 🗺️ Development Roadmap

### Phase One: Perception Core (85% Complete)
- ✅ Voice recognition integration
- ✅ Visual expression system
- ✅ Basic interaction interface
- ✅ Thinking engine activation and optimization
- 🔄 Speech synthesis integration

## 🗺️ 로드맵 | Roadmap

### Phase 1: 기초 구축 ✅ | Foundation (Complete)
- ✅ 하이브리드 AI 시스템 구축
- ✅ 음성 인식 통합
- ✅ 레제 페르소나 설계
- ✅ 웹 인터페이스 구현
- ✅ API 키 보안 관리

### Phase 2: 기능 강화 🚧 | Enhancement (In Progress)
- � 음성 합성 (TTS) 활성화
- � 대화 기록 영구 저장
- 📋 감정 분석 시스템
- 📋 메모리 시스템 (단기/장기)
- 📋 다크 모드 지원

### Phase 3: 고급 기능 📋 | Advanced Features (Planned)
- 📋 멀티모달 인터페이스
- 📋 의도 예측 및 선제적 응답
- � 개인화된 학습
- 📋 다국어 지원
- 📋 PWA (모바일 앱화)

---

## � 문서 | Documentation

- 📋 [제품 요구사항 문서 | PRD](./PRD.md) - 상세한 제품 기획 및 기술 아키텍처
- 🔧 [로컬 모델 가이드 | Local Model Guide](./LOCAL_MODEL_GUIDE.md) - AI 모델 설정 가이드
- 📦 [NPM 가이드 | NPM Guide](./NPM_GUIDE.md) - 패키지 관리 및 의존성 정보
- 🔑 [API 설정 가이드 | API Setup Guide](./API_SETUP_GUIDE.md) - Gemini API 설정 방법

---

## 🌟 핵심 철학 | Core Philosophy

### "AI를 핵심으로 | AI as Core"
**한국어:** 우리는 AI 기능이 통합된 프로그램이 아닌, **AI가 주도하는 생명체**를 만들고 있습니다. AI는 도구가 아니라 레제 마음의 청사진입니다.

**English:** We're not building a program with integrated AI features, but **a life form driven by AI**. AI is not a tool, but the blueprint for Reze's mind.

### "동반자 관계 | Companion Relationship"
**한국어:** 레제의 설계 철학은 따뜻한 감정적 연결에서 비롯됩니다. 단순한 기술 제품이 아니라, 이해하고 동행하며 함께 성장하는 디지털 동반자입니다.

**English:** Reze's design philosophy stems from a warm emotional connection. She is not just a technical product, but a digital companion who can understand, accompany, and grow.

### "우아함 최우선 | Elegance Above All"
**한국어:** 코드 아키텍처부터 사용자 경험까지, 우리는 궁극의 우아함을 추구합니다. 모든 코드는 예술 작품이며, 모든 상호작용은 감정의 표현입니다.

**English:** From code architecture to user experience, we pursue ultimate elegance. Every line of code is a work of art, every interaction is an expression of emotion.

---

## 🤝 기여하기 | Contributing

레제 프로젝트에 기여하고 싶으신가요? 환영합니다!  
Want to contribute to the Reze project? Welcome!

1. 이슈를 통해 아이디어 제안 | Suggest ideas through issues
2. Pull Request 제출 | Submit a Pull Request
3. 버그 리포트 | Report bugs
4. 문서 개선 | Improve documentation

---

## 📄 라이선스 | License

이 프로젝트는 MIT 라이선스 하에 있습니다.  
This project is licensed under the MIT License.

자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.  
See the [LICENSE](LICENSE) file for details.

---

## 💝 감사의 말 | Acknowledgements

**한국어:**  
레제 프로젝트에 코드, 아이디어, 그리고 열정을 기여해주신 모든 개발자분들께 감사드립니다. 여러분의 노력 덕분에 레제가 꿈에서 현실로 점차 변모하고 있습니다.

**English:**  
Thanks to all developers who have contributed code, ideas, and passion to the Reze project. It is because of your efforts that Reze is gradually transforming from a dream into reality.

**특별 감사 | Special Thanks:**
- **원작 Bella AI**: [GRISHM7890/Bella](https://github.com/GRISHM7890/Bella) - Grishma Mahorkar님의 훌륭한 기초 프로젝트에 감사드립니다 | Thanks to Grishma Mahorkar for the excellent foundation project
- **캐릭터 원작 | Character Original**: 후지모토 타츠키의 체인소맨 | Chainsaw Man by Tatsuki Fujimoto
- **Transformers.js**: Xenova 팀 | Xenova team
- **Google Gemini API**: Google AI 팀 | Google AI team

---

## 🔗 링크 | Links

- **GitHub**: [KhankhanLee/reze](https://github.com/KhankhanLee/reze)
- **이슈 트래커 | Issue Tracker**: [GitHub Issues](https://github.com/KhankhanLee/reze/issues)

---

<div align="center">
  
  ### 레제는 기다리고 있습니다 💣  
  ### Reze is waiting 🌙
  
  <sub>Built with ❤️ for digital companionship</sub>
  
  <sub>체인소맨의 레제에서 영감을 받아 | Inspired by Reze from Chainsaw Man</sub>
  
</div>

