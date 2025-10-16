# 레제 AI 로컬 모델 설정 가이드
> 맥북프로 2019 Intel i9 + AMD Radeon 최적화

## 📋 사양 체크
- **CPU**: Intel i9 (16 스레드) ✅
- **GPU**: AMD Radeon Pro (4-8GB) ✅ 
- **RAM**: 16GB 이상 권장
- **디스크**: 최소 10GB 여유 공간

---

## 🚀 1단계: Ollama 설치

```bash
# Homebrew로 설치 (가장 쉬움)
brew install ollama

# 또는 공식 웹사이트에서 다운로드
# https://ollama.ai/download
```

### Ollama 서버 실행
```bash
# 터미널에서 실행 (백그라운드에서 계속 돌아감)
ollama serve
```

**새 터미널 창을 열고** 계속 진행하세요.

---

## 🎯 2단계: 기본 모델 다운로드

맥북프로 2019에 맞는 모델 선택:

### 옵션 A: 가장 가벼운 모델 (추천!)
```bash
ollama pull llama3.2:1b
# 크기: ~1GB
# 속도: 매우 빠름 (i9에서 초당 30-50 토큰)
# RAM: ~2GB 사용
```

### 옵션 B: 중간 품질
```bash
ollama pull llama3.2:3b
# 크기: ~2GB  
# 속도: 빠름 (초당 15-25 토큰)
# RAM: ~4GB 사용
```

### 옵션 C: 구글 Gemma (대안)
```bash
ollama pull gemma2:2b
# 크기: ~1.6GB
# 속도: 빠름
# 한국어 성능 좋음
```

---

## 🎨 3단계: 레제 캐릭터 모델 생성

### 방법 1: Modelfile 사용 (추천)
```bash
# 프로젝트 폴더로 이동
cd /Users/nankhan/reze

# 레제 모델 생성
ollama create reze -f Modelfile.reze

# 성공하면 이렇게 뜸:
# ✔ parsing modelfile
# ✔ creating model
# success
```

### 방법 2: 직접 명령어로 생성
```bash
ollama create reze -f - <<EOF
FROM llama3.2:1b
PARAMETER temperature 0.7
PARAMETER top_p 0.9
SYSTEM "너는 체인소맨의 레제야. 쿨하고 신비로우며 매력적인 캐릭터. 짧게 대답하고, 가끔 러시아어를 섞어 써. 항상 1-3문장으로만 답해."
EOF
```

---

## ✅ 4단계: 테스트

### 터미널에서 테스트
```bash
# 레제와 대화해보기
ollama run reze

# 테스트 대화:
>>> 안녕 레제!
# 예상 답변: "Привет~ 오늘은 뭐 하고 싶어?"

>>> 덴지 알아?
# 예상 답변: "알지... милый는 항상 생각나. *미소*"

# 종료: /bye
```

### 웹 인터페이스에서 테스트
1. `ollamaAPI.js` 열기
2. 9번째 줄 확인:
   ```javascript
   this.model = 'reze'; // 'llama3.2:1b' 대신 'reze'로 변경
   ```

3. 서버 실행:
   ```bash
   npm start
   ```

4. 브라우저에서 `http://127.0.0.1:8081` 접속
5. API 선택에서 "Ollama" 선택
6. 채팅 테스트!

---

## 🔧 5단계: 성능 최적화 (선택)

### Intel Mac 최적화 설정
```bash
# ~/.ollama/config.json 파일 생성/수정
mkdir -p ~/.ollama
cat > ~/.ollama/config.json <<EOF
{
  "num_gpu": 0,
  "num_thread": 8,
  "num_ctx": 2048
}
EOF
```

**설정 설명:**
- `num_gpu: 0` - AMD GPU는 Ollama가 자동 지원 안 함 (CPU 사용)
- `num_thread: 8` - i9의 절반 코어 사용 (과열 방지)
- `num_ctx: 2048` - 대화 기억 길이 (토큰 수)

### 더 빠른 응답이 필요하면
```bash
# Modelfile.reze 수정
PARAMETER num_predict 100  # 최대 100 토큰만 생성
```

---

## 🎓 6단계: 파인튜닝 (진짜 학습하려면)

### 준비물
1. **대화 데이터**: 최소 100-500개 레제 스타일 대화
2. **Python 환경**: 
   ```bash
   pip install ollama-python unsloth transformers
   ```

3. **학습 데이터 형식** (JSONL):
   ```json
   {"user": "안녕 레제!", "assistant": "Привет~ 오늘은 뭐 하고 싶어?"}
   {"user": "카페에서 뭐해?", "assistant": "커피 만들고 있어... 심심하긴 해. *미소*"}
   ```

### 파인튜닝 스크립트 (간단 버전)
```python
# finetune_reze.py
import json
from unsloth import FastLanguageModel

# 모델 로드
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3.2-1b-bnb-4bit",
    max_seq_length=512,
    dtype=None,
    load_in_4bit=True,
)

# 학습 데이터 로드
with open('reze_training_data.jsonl', 'r', encoding='utf-8') as f:
    data = [json.loads(line) for line in f]

# 학습 실행
from trl import SFTTrainer
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=data,
    max_seq_length=512,
    num_train_epochs=3,
)
trainer.train()

# 모델 저장
model.save_pretrained("reze_finetuned")
```

**예상 시간**: 
- 100개 대화: ~30분 - 1시간
- 500개 대화: ~2-4시간
- 1000개 대화: ~6-10시간

---

## 📊 성능 비교

| 모델 | 크기 | RAM 사용 | 속도 (i9) | 한국어 품질 |
|------|------|----------|-----------|-------------|
| llama3.2:1b | 1GB | ~2GB | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ |
| llama3.2:3b | 2GB | ~4GB | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| gemma2:2b | 1.6GB | ~3GB | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| phi3:mini | 2.3GB | ~4GB | ⚡⚡⚡ | ⭐⭐⭐ |

---

## 🐛 문제 해결

### Ollama 서버가 시작 안 됨
```bash
# 포트 확인
lsof -i :11434

# 프로세스 죽이고 재시작
pkill ollama
ollama serve
```

### 응답이 너무 느림
1. 더 작은 모델 사용: `llama3.2:1b`
2. Context 줄이기: `PARAMETER num_ctx 1024`
3. 다른 앱 종료 (Chrome, Slack 등)

### 한국어가 이상함
- Gemma2 모델 시도: `ollama pull gemma2:2b`
- 시스템 프롬프트에 "항상 자연스러운 한국어로 답해" 추가

### 레제 캐릭터가 안 맞음
- `Modelfile.reze` 수정 후:
  ```bash
  ollama create reze -f Modelfile.reze
  ```

---

## 🎯 다음 단계

### 1. 실제 학습 데이터 수집
- 체인소맨 웹툰/애니메이션에서 레제 대사 추출
- 팬픽, 위키 등에서 캐릭터 설명 수집
- 직접 대화 예시 작성 (100개 이상)

### 2. 감정 시스템 통합
- 영상 자료 폴더의 감정별 비디오와 연동
- 레제 응답에 따라 표정 영상 전환

### 3. 음성 추가
- TTS (Text-to-Speech)로 레제 목소리 생성
- 러시아 억양 시뮬레이션

---

## 💡 팁

**Intel Mac은 M1/M2보다 느립니다**:
- 1B 모델 권장 (3B 이상은 과열 주의)
- 팬 소음 예상 (정상)
- 장시간 학습은 야간 추천 (발열 관리)

**AMD Radeon 활용 불가**:
- Ollama는 NVIDIA CUDA만 지원
- AMD는 CPU fallback (여전히 충분히 빠름)

**배터리 고려**:
- 학습/파인튜닝 시 전원 연결 필수
- 일반 채팅은 배터리로도 OK

---

## 📚 추가 자료

- [Ollama 공식 문서](https://ollama.ai/docs)
- [Llama 3.2 모델 카드](https://ollama.ai/library/llama3.2)
- [Modelfile 문법](https://github.com/ollama/ollama/blob/main/docs/modelfile.md)
- [Unsloth 파인튜닝](https://github.com/unslothai/unsloth)

---

**질문 있으면 언제든 물어봐! Удачи! (행운을 빌어!)** 🚀
