# 🔑 API 설정 가이드 / API Setup Guide

이 가이드는 Bella AI에서 클라우드 API를 사용하기 위한 설정 방법을 설명합니다.

## 📋 목차 / Table of Contents

1. [API 키 발급 받기](#api-키-발급-받기)
2. [API 키 설정 방법](#api-키-설정-방법)
3. [브라우저에서 API 키 입력](#브라우저에서-api-키-입력)
4. [보안 주의사항](#보안-주의사항)

---

## 🎯 API 키 발급 받기

### Google Gemini (추천 / Recommended) 🌟

**무료 tier 제공**: 월 60회/분 요청 가능

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. "Get API Key" 또는 "Create API Key" 클릭
4. 생성된 API 키 복사 (예: `AIzaSy...`)

### OpenAI GPT (선택사항)

1. [OpenAI Platform](https://platform.openai.com/api-keys) 방문
2. 계정 생성 및 로그인
3. "Create new secret key" 클릭
4. API 키 복사 (예: `sk-...`)

### 기타 API (선택사항)

- **Qwen**: [Alibaba Cloud DashScope](https://dashscope.aliyun.com/)
- **ERNIE Bot**: [Baidu AI Cloud](https://cloud.baidu.com/)
- **GLM**: [Zhipu AI](https://open.bigmodel.cn/)

---

## ⚙️ API 키 설정 방법

### 방법 1: 브라우저 콘솔에서 직접 입력 (권장)

1. 브라우저에서 Bella AI 열기
2. F12 또는 Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)로 개발자 도구 열기
3. Console 탭으로 이동
4. 다음 명령어 입력:

```javascript
// Gemini API 키 설정
import('./config.js').then(module => {
    const config = module.default;
    config.setAPIKey('gemini', 'YOUR_GEMINI_API_KEY_HERE');
    console.log('✅ Gemini API key saved!');
});
```

또는 OpenAI를 사용하려면:

```javascript
// OpenAI API 키 설정
import('./config.js').then(module => {
    const config = module.default;
    config.setAPIKey('openai', 'YOUR_OPENAI_API_KEY_HERE');
    console.log('✅ OpenAI API key saved!');
});
```

5. 페이지 새로고침

### 방법 2: 설정 UI 추가 (향후 구현 예정)

추후 설정 UI를 통해 더 쉽게 API 키를 관리할 수 있습니다.

---

## 🌐 브라우저에서 API 키 입력

API 키는 **브라우저의 localStorage**에 안전하게 저장됩니다:

```javascript
// 저장된 API 키 확인
import('./config.js').then(module => {
    const config = module.default;
    console.log('Configured providers:', config.getConfiguredProviders());
});

// API 키 삭제
import('./config.js').then(module => {
    const config = module.default;
    config.clearAll();
    console.log('🗑️ All API keys cleared!');
});
```

---

## 🔒 보안 주의사항

### ⚠️ 중요: API 키 보안

1. **절대 Git에 커밋하지 마세요**
   - `.env` 파일은 `.gitignore`에 포함되어 있습니다
   - API 키가 포함된 파일은 절대 공개하지 마세요

2. **브라우저 localStorage 사용**
   - API 키는 브라우저의 localStorage에 저장됩니다
   - 각 사용자의 브라우저에만 저장되므로 안전합니다
   - 단, 공용 컴퓨터에서는 사용 후 키를 삭제하세요

3. **API 키가 노출된 경우**
   - 즉시 해당 API 제공자의 대시보드에서 키를 삭제하세요
   - 새로운 API 키를 발급받으세요

4. **무료 tier 한도 관리**
   - Gemini: 월 60회/분
   - 한도 초과 시 요금이 부과될 수 있습니다
   - API 사용량을 주기적으로 확인하세요

---

## 🚀 사용 예시

### Gemini로 시작하기

```javascript
// 1. Gemini API 키 설정
import('./config.js').then(module => {
    config.setAPIKey('gemini', 'AIzaSy...');
});

// 2. 클라우드 API 활성화
import('./core.js').then(module => {
    const BellaAI = module.BellaAI;
    BellaAI.getInstance().then(bella => {
        bella.switchProvider('gemini');
        console.log('✅ Gemini activated!');
    });
});
```

### Provider 전환하기

```javascript
import('./core.js').then(module => {
    const BellaAI = module.BellaAI;
    BellaAI.getInstance().then(bella => {
        // 로컬 모델 사용
        bella.switchProvider('local');
        
        // 또는 Gemini 사용
        bella.switchProvider('gemini');
        
        // 현재 설정 확인
        console.log(bella.getCurrentConfig());
    });
});
```

---

## 📞 문제 해결

### API 호출이 실패하는 경우

1. **API 키 확인**
   ```javascript
   import('./cloudAPI.js').then(module => {
       const api = new module.default();
       console.log('Is configured:', api.isConfigured('gemini'));
   });
   ```

2. **네트워크 오류**
   - 브라우저 콘솔에서 상세 오류 메시지 확인
   - CORS 오류인 경우 프록시 서버 사용 고려

3. **할당량 초과**
   - API 제공자의 대시보드에서 사용량 확인
   - 무료 tier 한도를 확인하세요

---

## 📝 참고 자료

- [Google Gemini API 문서](https://ai.google.dev/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Bella AI GitHub](https://github.com/KhankhanLee/reze)

---

**마지막 업데이트**: 2025-10-13
**버전**: 1.0.0
