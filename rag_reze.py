#!/usr/bin/env python3
# rag_reze.py - 레제 지식 베이스 RAG 시스템
# 나무위키나 다른 소스에서 레제 정보를 임베딩하고 검색

import json
from pathlib import Path

# 간단한 RAG 구현 (프로토타입)
class SimpleRezeRAG:
    def __init__(self, knowledge_file="reze_knowledge.txt"):
        self.knowledge = self.load_knowledge(knowledge_file)
        
    def load_knowledge(self, file_path):
        """지식 베이스 로드"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def search(self, query):
        """간단한 키워드 검색 (나중에 벡터 검색으로 업그레이드)"""
        lines = self.knowledge.split('\n')
        results = []
        
        keywords = query.lower().split()
        for line in lines:
            if any(keyword in line.lower() for keyword in keywords):
                results.append(line)
        
        return '\n'.join(results[:5])  # 상위 5개 결과
    
    def enhance_prompt(self, user_message):
        """사용자 메시지에 관련 지식 추가"""
        relevant_info = self.search(user_message)
        
        if relevant_info:
            enhanced = f"""[레제 관련 정보]
{relevant_info}

[사용자 질문]
{user_message}

위 정보를 참고하되, 자연스럽게 대화하세요."""
            return enhanced
        return user_message


# 사용 예시
if __name__ == "__main__":
    rag = SimpleRezeRAG()
    
    # 테스트
    test_queries = [
        "레제 너 어디 출신이야?",
        "덴지 알아?",
        "폭탄 악마가 뭐야?"
    ]
    
    for query in test_queries:
        print(f"\n질문: {query}")
        enhanced = rag.enhance_prompt(query)
        print(f"강화된 프롬프트:\n{enhanced}\n")
        print("-" * 50)
