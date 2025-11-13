import torch
import torch.nn as nn
import json
import sys
import torch.nn.functional as F
from difflib import SequenceMatcher

# 최적화된 Transformer 모델 (학습과 동일)
class TransformerModel(nn.Module):
    def __init__(self, vocab_size, embed_dim, num_heads, num_layers, max_seq_len):
        super(TransformerModel, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.positional_encoding = nn.Parameter(torch.zeros(1, max_seq_len, embed_dim))
        self.transformer = nn.Transformer(
            d_model=embed_dim,
            nhead=num_heads,
            num_encoder_layers=num_layers,
            num_decoder_layers=num_layers,
            batch_first=True
        )
        self.fc_out = nn.Linear(embed_dim, vocab_size)
        
    def forward(self, src, tgt):
        src = self.embedding(src) + self.positional_encoding[:, :src.size(1), :]
        tgt = self.embedding(tgt) + self.positional_encoding[:, :tgt.size(1), :]
        output = self.transformer(src, tgt)
        return self.fc_out(output)

def predict_with_new_model(message, model, char_to_idx, idx_to_char, max_seq_len, dataset):
    """
    새로 학습된 모델로 향상된 예측
    """
    print(f"새 모델 예측: {message}", file=sys.stderr)
    
    # 1. 유사한 패턴 찾기 (향상된 매칭)
    best_templates = []
    message_lower = message.lower().strip()
    
    for item in dataset:
        input_lower = item['input'].lower().strip()
        
        # 문자열 유사도
        char_sim = SequenceMatcher(None, message_lower, input_lower).ratio()
        
        # 단어 유사도
        msg_words = set(message_lower.split())
        inp_words = set(input_lower.split())
        word_sim = len(msg_words & inp_words) / max(len(msg_words), 1) if msg_words else 0
        
        # 길이 유사도
        len_sim = 1.0 - abs(len(message) - len(item['input'])) / 30
        len_sim = max(0, len_sim)
        
        # 종합 점수
        total_score = char_sim * 0.5 + word_sim * 0.3 + len_sim * 0.2
        
        if total_score > 0.3:
            best_templates.append((item, total_score))
    
    # 점수순 정렬
    best_templates.sort(key=lambda x: x[1], reverse=True)
    if not best_templates:
        best_templates = [(dataset[0], 0.1)]
    
    print(f"상위 템플릿들:", file=sys.stderr)
    for i, (template, score) in enumerate(best_templates[:3]):
        print(f"  {i+1}. '{template['input']}' → '{template['label']}' ({score:.2f})", file=sys.stderr)
    
    # 2. 입력 인코딩
    input_indices = []
    for char in message:
        if char in char_to_idx:
            input_indices.append(char_to_idx[char])
        else:
            input_indices.append(char_to_idx['<PAD>'])
    input_indices.append(char_to_idx['<EOS>'])
    
    # 패딩
    if len(input_indices) < max_seq_len:
        input_indices.extend([char_to_idx['<PAD>']] * (max_seq_len - len(input_indices)))
    else:
        input_indices = input_indices[:max_seq_len-1] + [char_to_idx['<EOS>']]
    
    input_tensor = torch.tensor([input_indices], dtype=torch.long)
    
    # 3. 다양한 템플릿으로 예측 시도
    best_response = ""
    best_score = 0
    
    for template_item, template_score in best_templates[:3]:
        template_response = template_item['label']
        
        try:
            # 템플릿을 시작점으로 사용
            template_indices = []
            for char in template_response:
                if char in char_to_idx:
                    template_indices.append(char_to_idx[char])
                else:
                    template_indices.append(char_to_idx['<PAD>'])
            template_indices.append(char_to_idx['<EOS>'])
            
            # 다양한 길이로 시도
            for prefix_ratio in [0.8, 0.6, 0.4, 0.2]:
                prefix_len = max(1, int(len(template_indices) * prefix_ratio))
                target_prefix = template_indices[:prefix_len]
                
                # 패딩하여 고정 길이로 만들기
                target_tokens = target_prefix + [char_to_idx['<PAD>']] * (max_seq_len - len(target_prefix))
                target_tokens = target_tokens[:max_seq_len]
                
                tgt_input = torch.tensor([target_tokens[:-1]], dtype=torch.long)
                
                model.eval()
                with torch.no_grad():
                    output = model(input_tensor, tgt_input)
                    
                    # Top-k 샘플링으로 다양성 추가
                    probs = F.softmax(output[0], dim=-1)
                    
                    # 여러 방식으로 토큰 선택
                    for sampling_method in ['greedy', 'top3', 'top5']:
                        if sampling_method == 'greedy':
                            predicted_tokens = output[0].argmax(dim=-1)
                        elif sampling_method == 'top3':
                            predicted_tokens = []
                            for prob_dist in probs:
                                top_k = min(3, len(prob_dist))
                                top_indices = prob_dist.topk(top_k).indices
                                predicted_tokens.append(torch.multinomial(F.softmax(prob_dist[top_indices], dim=0), 1).item())
                            predicted_tokens = torch.tensor(predicted_tokens)
                        else:  # top5
                            predicted_tokens = []
                            for prob_dist in probs:
                                top_k = min(5, len(prob_dist))
                                top_indices = prob_dist.topk(top_k).indices
                                predicted_tokens.append(top_indices[torch.multinomial(F.softmax(prob_dist[top_indices], dim=0), 1)].item())
                            predicted_tokens = torch.tensor(predicted_tokens)
                        
                        # 토큰을 문자로 변환
                        response_chars = []
                        for token in predicted_tokens:
                            token_val = token.item() if hasattr(token, 'item') else token
                            
                            if token_val in idx_to_char:
                                char = idx_to_char[token_val]
                                if char not in ['<PAD>', '<EOS>']:
                                    response_chars.append(char)
                            
                            # 적당한 길이에서 중단
                            if len(response_chars) >= 25:
                                break
                        
                        if response_chars:
                            response = ''.join(response_chars).strip()
                            
                            if len(response) >= 2:
                                # 품질 평가
                                korean_chars = sum(1 for c in response if '가' <= c <= '힣')
                                response_len = len(response)
                                korean_ratio = korean_chars / response_len if response_len > 0 else 0
                                
                                # 반복 패턴 체크
                                unique_chars = len(set(response))
                                diversity = unique_chars / response_len if response_len > 0 else 0
                                
                                # 길이 점수
                                length_score = min(response_len / 15, 1.0)
                                
                                # 템플릿과의 유사도
                                template_sim = SequenceMatcher(None, response.lower(), template_response.lower()).ratio()
                                
                                # 최종 점수
                                final_score = (
                                    korean_ratio * 0.3 +
                                    diversity * 0.2 + 
                                    length_score * 0.2 +
                                    template_sim * 0.15 +
                                    template_score * 0.15
                                )
                                
                                print(f"    후보: '{response}' (점수: {final_score:.2f}, 한국어: {korean_ratio:.1f}, 다양성: {diversity:.1f})", file=sys.stderr)
                                
                                if final_score > best_score and diversity > 0.3:  # 너무 반복적이면 제외
                                    best_response = response
                                    best_score = final_score
                        
        except Exception as e:
            continue
    
    # 4. 결과 반환
    if best_response and best_score > 0.4:
        print(f"최적 응답: '{best_response}' (점수: {best_score:.2f})", file=sys.stderr)
        return best_response
    else:
        # 백업: 가장 유사한 템플릿 직접 사용
        fallback = best_templates[0][0]['label']
        print(f"생성 실패, 템플릿 사용: '{fallback}'", file=sys.stderr)
        return fallback

def predict_with_enhanced_model(message, model_path='reze_optimized_final.pth', dataset_path='./dataset.json'):
    """
    향상된 새 모델로 예측
    """
    print(f"향상된 모델 예측 시작: {message}", file=sys.stderr)
    
    # 데이터셋 로드
    try:
        with open(dataset_path, 'r', encoding='utf-8') as f:
            dataset = json.load(f)
        print(f"확장된 데이터셋: {len(dataset)}개", file=sys.stderr)
    except Exception as e:
        return f"데이터 로드 오류: {e}"
    
    # 새 모델 로드
    try:
        checkpoint = torch.load(model_path, map_location=torch.device('cpu'))
        
        vocab_size = checkpoint['vocab_size']
        embed_dim = checkpoint['embed_dim']
        num_heads = checkpoint['num_heads']
        num_layers = checkpoint['num_layers']
        max_seq_len = checkpoint['max_seq_len']
        char_to_idx = checkpoint['char_to_idx']
        idx_to_char = checkpoint['idx_to_char']
        
        model = TransformerModel(vocab_size, embed_dim, num_heads, num_layers, max_seq_len)
        model.load_state_dict(checkpoint['model_state_dict'])
        
        print(f"새 모델 로드 완료 (Vocab: {vocab_size}, Loss: {checkpoint.get('loss', 'N/A'):.4f})", file=sys.stderr)
        
    except Exception as e:
        return f"모델 로드 오류: {e}"
    
    # 향상된 예측 수행
    response = predict_with_new_model(message, model, char_to_idx, idx_to_char, max_seq_len, dataset)
    
    return response

if __name__ == "__main__":
    try:
        print("predict_enhanced.py 시작", file=sys.stderr)
        args = json.loads(sys.argv[1])
        message = args['message']
        
        response = predict_with_enhanced_model(message)
        
        print(f"최종 응답: '{response}'", file=sys.stderr)
        print(json.dumps({"status": "success", "response": response}, ensure_ascii=False))
    
    except Exception as e:
        print(f"에러: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False))
        sys.exit(1)