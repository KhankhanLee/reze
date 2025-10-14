#!/bin/bash
# 🥧 Reze AI - 라즈베리파이 배포 스크립트

set -e

# 설정
RASPBERRY_PI_HOST="${RASPBERRY_PI_HOST:-pi@raspberrypi.local}"
MODELFILE="${1:-Modelfile.example}"

echo "🚀 Reze AI 모델 배포 시작..."
echo "📡 타겟: $RASPBERRY_PI_HOST"
echo "📄 Modelfile: $MODELFILE"
echo ""

# 1. Modelfile 존재 확인
if [ ! -f "$MODELFILE" ]; then
    echo "❌ 오류: $MODELFILE 파일을 찾을 수 없습니다."
    exit 1
fi

# 2. 라즈베리파이 연결 확인
echo "🔍 라즈베리파이 연결 확인 중..."
if ! ssh -o ConnectTimeout=5 "$RASPBERRY_PI_HOST" "echo '✅ 연결 성공'" 2>/dev/null; then
    echo "❌ 오류: 라즈베리파이에 연결할 수 없습니다."
    echo "   확인사항:"
    echo "   1. 라즈베리파이 전원이 켜져 있나요?"
    echo "   2. 같은 네트워크에 있나요?"
    echo "   3. SSH 키가 등록되어 있나요?"
    exit 1
fi

# 3. Modelfile 전송
echo "📤 Modelfile 전송 중..."
scp "$MODELFILE" "$RASPBERRY_PI_HOST:/tmp/Modelfile"

# 4. 라즈베리파이에서 모델 생성
echo "🔨 모델 생성 중 (시간이 걸릴 수 있습니다)..."
ssh "$RASPBERRY_PI_HOST" << 'ENDSSH'
    set -e
    
    # 기존 모델 삭제 (있다면)
    echo "🗑️  기존 모델 삭제 중..."
    ollama rm reze 2>/dev/null || echo "   (기존 모델 없음)"
    
    # 새 모델 생성
    echo "🤖 새 모델 생성 중..."
    ollama create reze -f /tmp/Modelfile
    
    # 테스트
    echo ""
    echo "🧪 모델 테스트:"
    ollama run reze "안녕 레제!" --verbose
    
    # Ollama 서비스 재시작 (systemd 사용 시)
    if systemctl is-active --quiet ollama 2>/dev/null; then
        echo ""
        echo "🔄 Ollama 서비스 재시작 중..."
        sudo systemctl restart ollama
        echo "✅ 서비스 재시작 완료"
    fi
    
    # 임시 파일 삭제
    rm /tmp/Modelfile
ENDSSH

echo ""
echo "✅ 배포 완료!"
echo ""
echo "🎯 다음 단계:"
echo "   1. 라즈베리파이 IP 확인: ssh $RASPBERRY_PI_HOST 'hostname -I'"
echo "   2. 브라우저에서 테스트: http://raspberrypi.local:11434"
echo "   3. API 테스트: curl http://raspberrypi.local:11434/api/generate -d '{\"model\":\"reze\",\"prompt\":\"안녕\"}'"
echo ""
echo "📱 ollamaAPI.js 설정:"
echo "   constructor(baseURL = 'http://raspberrypi.local:11434/api') {"
