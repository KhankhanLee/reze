import json
import sys
from difflib import SequenceMatcher
import random
import re

def find_best_match_response(message, dataset):
    """
    고도화된 유사도 매칭으로 최적 응답 찾기
    """
    message_lower = message.lower().strip()
    candidates = []
    
    for item in dataset:
        input_lower = item['input'].lower().strip()
        
        # 1. 직접 유사도
        similarity = SequenceMatcher(None, message_lower, input_lower).ratio()
        
        # 2. 키워드 매칭
        message_words = set(message_lower.split())
        input_words = set(input_lower.split())
        common_words = message_words & input_words
        keyword_score = len(common_words) / max(len(message_words), 1) if message_words else 0
        
        # 3. 길이 유사성
        length_diff = abs(len(message) - len(item['input']))
        length_score = max(0, 1 - length_diff / 20)  # 20자 차이까지 허용
        
        # 4. 특별 패턴 매칭
        special_score = 0
        if any(word in input_lower for word in ['안녕', 'hi', 'hello']) and any(word in message_lower for word in ['안녕', 'hi', 'hello']):
            special_score += 0.3
        if any(word in input_lower for word in ['뭐', '뭔']) and any(word in message_lower for word in ['뭐', '뭔']):
            special_score += 0.3
        if '?' in input_lower and '?' in message_lower:
            special_score += 0.2
            
        # 5. 종합 점수
        total_score = (similarity * 0.4 + 
                      keyword_score * 0.3 + 
                      length_score * 0.1 + 
                      special_score * 0.2)
        
        candidates.append({
            'item': item,
            'score': total_score,
            'similarity': similarity,
            'keyword_score': keyword_score
        })
    
    # 점수순 정렬
    candidates.sort(key=lambda x: x['score'], reverse=True)
    return candidates

def generate_smart_response(message, dataset):
    """
    스마트한 응답 생성: 유사도 매칭 + 약간의 변형
    """
    print(f"스마트 응답 생성: {message}", file=sys.stderr)
    
    # 최적 매칭 찾기
    candidates = find_best_match_response(message, dataset)
    
    if not candidates:
        return random.choice([
            "안녕! 무슨 일이야?",
            "어떻게 지내?",
            "뭐하고 있어?"
        ])
    
    # 상위 후보들 분석
    top_candidates = candidates[:5]
    
    print(f"상위 후보들:", file=sys.stderr)
    for i, cand in enumerate(top_candidates[:3]):
        item = cand['item']
        print(f"  {i+1}. '{item['input']}' → '{item['label']}' (점수: {cand['score']:.2f})", file=sys.stderr)
    
    # 최고 점수 응답 선택
    best_candidate = top_candidates[0]
    
    if best_candidate['score'] > 0.5:
        # 높은 유사도: 그대로 사용
        response = best_candidate['item']['label']
        print(f"고유사도 매칭: '{response}'", file=sys.stderr)
        return response
        
    elif best_candidate['score'] > 0.3:
        # 중간 유사도: 상위 3개 중 랜덤 선택으로 다양성 추가
        selected = random.choice(top_candidates[:3])
        response = selected['item']['label']
        print(f"다양성 선택: '{response}' (점수: {selected['score']:.2f})", file=sys.stderr)
        return response
        
    else:
        # 낮은 유사도: 길이나 패턴 기반 선택
        suitable_responses = []
        
        # 길이가 비슷한 응답 찾기
        target_length = len(message)
        for cand in candidates:
            response_length = len(cand['item']['label'])
            if abs(target_length - response_length) <= 5:
                suitable_responses.append(cand)
        
        if suitable_responses:
            selected = random.choice(suitable_responses[:3])
            response = selected['item']['label']
            print(f"길이 기반 선택: '{response}'", file=sys.stderr)
            return response
        else:
            # 최후의 수단: 일반적인 좋은 응답들
            good_responses = [
                "그래? 재밌네!",
                "응, 알겠어.",
                "오케이!",
                "좋아, 더 얘기해줘.",
                "흠... 그렇구나."
            ]
            response = random.choice(good_responses)
            print(f"백업 응답: '{response}'", file=sys.stderr)
            return response

def predict_hybrid_smart(message, dataset_path='./dataset.json'):
    """
    하이브리드 스마트 예측: 실용적이고 자연스러운 응답
    """
    print(f"하이브리드 스마트 예측: {message}", file=sys.stderr)
    
    # 데이터셋 로드
    try:
        with open(dataset_path, 'r', encoding='utf-8') as f:
            dataset = json.load(f)
        print(f"데이터셋 로드: {len(dataset)}개", file=sys.stderr)
    except Exception as e:
        return f"데이터 로드 오류: {e}"
    
    # 스마트 응답 생성
    response = generate_smart_response(message, dataset)
    
    # 후처리: 불필요한 공백이나 반복 제거
    response = re.sub(r'\s+', ' ', response).strip()  # 다중 공백 제거
    response = re.sub(r'(.)\1{3,}', r'\1\1', response)  # 3회 이상 반복 → 2회로
    
    return response

if __name__ == "__main__":
    try:
        print("predict_hybrid_smart.py 시작", file=sys.stderr)
        args = json.loads(sys.argv[1])
        message = args['message']
        
        response = predict_hybrid_smart(message)
        
        print(f"최종 응답: '{response}'", file=sys.stderr)
        print(json.dumps({"status": "success", "response": response}, ensure_ascii=False))
    
    except Exception as e:
        print(f"에러: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False))
        sys.exit(1)