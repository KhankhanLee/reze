// config.js - Environment configuration / 환경 설정
// This module handles loading API keys from environment variables or localStorage
// 이 모듈은 환경 변수 또는 localStorage에서 API 키를 로드합니다

class Config {
    constructor() {
        // Try to load from localStorage first / 먼저 localStorage에서 로드 시도
        this.apiKeys = this.loadFromStorage();
    }

    // Load API keys from localStorage / localStorage에서 API 키 로드
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('bella_api_keys');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load API keys from storage:', error);
        }
        
        // Return empty object if nothing stored / 저장된 것이 없으면 빈 객체 반환
        return {};
    }

    // Save API keys to localStorage / localStorage에 API 키 저장
    saveToStorage() {
        try {
            localStorage.setItem('bella_api_keys', JSON.stringify(this.apiKeys));
            return true;
        } catch (error) {
            console.error('Failed to save API keys to storage:', error);
            return false;
        }
    }

    // Set API key / API 키 설정
    setAPIKey(provider, key) {
        const keyMap = {
            'gemini': 'GOOGLE_API_KEY',
            'openai': 'OPENAI_API_KEY',
            'qwen': 'QWEN_API_KEY',
            'ernie': 'ERNIE_ACCESS_TOKEN',
            'glm': 'GLM_API_KEY'
        };

        const envName = keyMap[provider];
        if (envName) {
            this.apiKeys[envName] = key;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Get API key / API 키 가져오기
    getAPIKey(envName) {
        return this.apiKeys[envName] || '';
    }

    // Check if API key exists / API 키 존재 여부 확인
    hasAPIKey(envName) {
        return !!this.apiKeys[envName] && this.apiKeys[envName] !== '';
    }

    // Clear all API keys / 모든 API 키 제거
    clearAll() {
        this.apiKeys = {};
        localStorage.removeItem('bella_api_keys');
    }

    // Get all configured providers / 설정된 모든 제공자 가져오기
    getConfiguredProviders() {
        const providers = [];
        if (this.hasAPIKey('GOOGLE_API_KEY')) providers.push('gemini');
        if (this.hasAPIKey('OPENAI_API_KEY')) providers.push('openai');
        if (this.hasAPIKey('QWEN_API_KEY')) providers.push('qwen');
        if (this.hasAPIKey('ERNIE_ACCESS_TOKEN')) providers.push('ernie');
        if (this.hasAPIKey('GLM_API_KEY')) providers.push('glm');
        return providers;
    }
}

// Export singleton instance / 싱글톤 인스턴스 내보내기
const config = new Config();
export default config;
