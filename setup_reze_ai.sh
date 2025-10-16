#!/bin/bash
# 레제 AI 빠른 설정 스크립트
# Quick setup script for Reze AI

set -e  # 에러 발생 시 중단

echo "🎨 레제 AI 로컬 모델 설정 시작..."
echo "=========================================="

# 1. Ollama 설치 확인
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama가 설치되지 않았습니다."
    echo "📦 설치 방법:"
    echo "   brew install ollama"
    echo "   또는 https://ollama.ai/download"
    exit 1
else
    echo "✅ Ollama 설치 확인됨"
fi

# 2. Ollama 서버 실행 확인
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo "⚠️  Ollama 서버가 실행되지 않았습니다."
    echo "🚀 다음 명령어로 서버를 시작하세요:"
    echo "   ollama serve"
    echo ""
    echo "   새 터미널 창을 열고 다시 이 스크립트를 실행하세요."
    exit 1
else
    echo "✅ Ollama 서버 실행 중"
fi

# 3. 기본 모델 다운로드
echo ""
echo "📥 기본 모델 다운로드 중..."
if ollama list | grep -q "llama3.2:1b"; then
    echo "✅ llama3.2:1b 모델 이미 설치됨"
else
    echo "⏬ llama3.2:1b 다운로드 중... (약 1GB, 시간이 걸릴 수 있습니다)"
    ollama pull llama3.2:1b
    echo "✅ 모델 다운로드 완료"
fi

# 4. 레제 커스텀 모델 생성
echo ""
echo "🎭 레제 캐릭터 모델 생성 중..."
if ollama list | grep -q "^reze"; then
    echo "⚠️  'reze' 모델이 이미 존재합니다."
    read -p "다시 생성하시겠습니까? (y/N): " recreate
    if [[ $recreate =~ ^[Yy]$ ]]; then
        ollama rm reze
        ollama create reze -f Modelfile.reze
        echo "✅ 레제 모델 재생성 완료"
    else
        echo "⏭️  기존 모델 유지"
    fi
else
    ollama create reze -f Modelfile.reze
    echo "✅ 레제 모델 생성 완료"
fi

# 5. 테스트
echo ""
echo "🧪 모델 테스트 중..."
response=$(ollama run reze "안녕 레제!" --verbose 2>&1 | head -n 1)
if [ -n "$response" ]; then
    echo "✅ 모델 응답 확인: $response"
else
    echo "⚠️  응답이 없습니다. 수동으로 테스트해주세요:"
    echo "   ollama run reze"
fi

# 완료 메시지
echo ""
echo "=========================================="
echo "🎉 레제 AI 설정 완료!"
echo ""
echo "📝 다음 단계:"
echo "   1. 터미널에서 테스트:"
echo "      ollama run reze"
echo ""
echo "   2. 웹 인터페이스에서 테스트:"
echo "      npm start"
echo "      → http://127.0.0.1:8081"
echo "      → API 선택에서 'Ollama' 선택"
echo ""
echo "   3. 모델 목록 확인:"
echo "      ollama list"
echo ""
echo "   4. 레제 모델 재생성 (수정 후):"
echo "      ollama create reze -f Modelfile.reze"
echo ""
echo "📖 자세한 가이드: REZE_AI_SETUP.md"
echo "=========================================="
