# Ollama 설치 및 사용 가이드 | Ollama Installation & Usage Guide

Ollama를 사용하면 로컬에서 강력한 LLM 모델을 쉽게 실행할 수 있습니다.  
Use Ollama to easily run powerful LLM models locally.

---

## 🚀 설치 | Installation

### macOS / Linux
```bash
# Homebrew로 설치 (추천)
brew install ollama

# 또는 공식 스크립트 사용
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
[Ollama 공식 웹사이트](https://ollama.com/download)에서 설치 프로그램을 다운로드하세요.

---

## 📦 추천 모델 | Recommended Models

### 1️⃣ Llama 3.2 1B (가장 추천!)
- **크기**: ~1.3GB
- **속도**: 매우 빠름
- **품질**: LaMini-77M보다 월등히 우수
- **설치**:
```bash
ollama pull llama3.2:1b
```

### 2️⃣ Qwen2.5 0.5B
- **크기**: ~0.5GB
- **속도**: 초고속
- **품질**: 작지만 효율적
- **설치**:
```bash
ollama pull qwen2.5:0.5b
```

### 3️⃣ Llama 3.2 3B (강력함)
- **크기**: ~3GB
- **속도**: 빠름
- **품질**: 매우 우수
- **설치**:
```bash
ollama pull llama3.2:3b
```

---

## ⚙️ Ollama 실행 | Running Ollama

### 1. Ollama 서버 시작
```bash
# 백그라운드에서 실행
ollama serve
```

### 2. 모델 다운로드
```bash
# Llama 3.2 1B 모델 다운로드 (추천)
ollama pull llama3.2:1b
```

### 3. 테스트
```bash
# 모델이 제대로 작동하는지 테스트
ollama run llama3.2:1b "Hello, introduce yourself briefly"
```

### 4. Reze 앱 실행
```bash
# Reze 프로젝트 디렉토리에서
npm start
```

---

## 🎯 Reze에서 사용하기 | Using in Reze

### 자동 감지 | Auto Detection
- Reze는 시작 시 자동으로 Ollama를 감지합니다
- Ollama가 실행 중이고 모델이 설치되어 있으면 자동으로 사용합니다
- Ollama가 없으면 자동으로 transformers.js로 폴백됩니다

### 로그 확인 | Check Logs
브라우저 콘솔에서 다음 메시지를 확인하세요:
```
✓ Ollama is available! Using Ollama for local inference.
Available Ollama models: llama3.2:1b
```

### 모델 전환 | Switch Models
브라우저 콘솔에서:
```javascript
// Ollama 모델 변경
await rezeAI.setOllamaModel('llama3.2:3b');

// 클라우드 API로 전환
await rezeAI.switchProvider('gemini');

// 로컬로 다시 전환
await rezeAI.switchProvider('local');
```

---

## 🔧 문제 해결 | Troubleshooting

### Ollama 서버가 실행되지 않음
```bash
# Ollama 상태 확인
ps aux | grep ollama

# Ollama 다시 시작
killall ollama
ollama serve
```

### 모델이 다운로드되지 않음
```bash
# 설치된 모델 목록 확인
ollama list

# 모델 다시 다운로드
ollama pull llama3.2:1b
```

### "Ollama not available" 메시지
1. Ollama가 설치되어 있는지 확인: `which ollama`
2. Ollama 서버가 실행 중인지 확인: `ollama serve`
3. 방화벽에서 포트 11434가 열려있는지 확인

---

## 📊 성능 비교 | Performance Comparison

| 모델 | 크기 | 품질 | 속도 | 추천 |
|------|------|------|------|------|
| LaMini-Flan-T5-77M | 300MB | ⭐⭐ | ⭐⭐⭐⭐ | ❌ |
| Qwen2.5 0.5B | 500MB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| Llama 3.2 1B | 1.3GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ 최고 추천 |
| Llama 3.2 3B | 3GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ |

---

## 💡 팁 | Tips

### 1. 자동 시작 설정
macOS에서 Ollama를 자동으로 시작하려면:
```bash
# LaunchAgent 생성
cat > ~/Library/LaunchAgents/com.ollama.server.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ollama.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/ollama</string>
        <string>serve</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# LaunchAgent 로드
launchctl load ~/Library/LaunchAgents/com.ollama.server.plist
```

### 2. 여러 모델 설치
다양한 상황에 맞는 모델을 준비하세요:
```bash
# 빠른 응답용
ollama pull qwen2.5:0.5b

# 일반적인 대화용
ollama pull llama3.2:1b

# 복잡한 작업용
ollama pull llama3.2:3b
```

### 3. GPU 가속
- Ollama는 자동으로 GPU를 감지하고 사용합니다
- Apple Silicon (M1/M2/M3): Metal 자동 활성화
- NVIDIA GPU: CUDA 자동 활성화

---

## 🔗 참고 링크 | References

- [Ollama 공식 웹사이트](https://ollama.com)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [사용 가능한 모델 목록](https://ollama.com/library)

---

## 🎉 시작하기 | Get Started

```bash
# 1. Ollama 설치
brew install ollama

# 2. Ollama 서버 시작
ollama serve &

# 3. 모델 다운로드
ollama pull llama3.2:1b

# 4. Reze 실행
cd /path/to/reze
npm start

# 5. 브라우저에서 http://localhost:8081 접속
```

이제 Ollama로 훨씬 더 자연스러운 Reze와 대화할 수 있습니다! 💣🌙
