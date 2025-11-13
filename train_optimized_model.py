import torch
import torch.nn as nn
import json
import torch.utils.data as data
import torch.nn.functional as F

#Transformer 모델
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

# 올바른 어휘 사전 생성
def create_proper_vocab(dataset):
    """실제 데이터에서 사용되는 문자들만으로 어휘 사전 생성"""
    chars = set()
    for item in dataset:
        chars.update(item['input'])
        chars.update(item['label'])
    
    # 특수 토큰 추가
    chars.add('<PAD>')  # 패딩
    chars.add('<EOS>')  # 문장 끝
    
    # 문자를 정렬하여 일관된 인덱싱
    char_list = sorted(list(chars))
    
    # 문자 -> 인덱스, 인덱스 -> 문자 매핑
    char_to_idx = {char: idx for idx, char in enumerate(char_list)}
    idx_to_char = {idx: char for idx, char in enumerate(char_list)}
    
    return char_to_idx, idx_to_char, len(char_list)

# 올바른 데이터셋 클래스
class OptimizedDialogueDataset(data.Dataset):
    def __init__(self, data_path, char_to_idx, max_seq_len=50):
        with open(data_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        self.char_to_idx = char_to_idx
        self.max_seq_len = max_seq_len
        self.pad_idx = char_to_idx['<PAD>']
        self.eos_idx = char_to_idx['<EOS>']
        
    def __len__(self):
        return len(self.data)
    
    def text_to_indices(self, text):
        """텍스트를 인덱스로 변환"""
        indices = []
        for char in text:
            if char in self.char_to_idx:
                indices.append(self.char_to_idx[char])
            else:
                # 알 수 없는 문자는 패딩으로 처리
                indices.append(self.pad_idx)
        
        # EOS 토큰 추가
        indices.append(self.eos_idx)
        return indices
    
    def __getitem__(self, idx):
        item = self.data[idx]
        
        # 입력과 출력을 인덱스로 변환
        input_indices = self.text_to_indices(item['input'])
        target_indices = self.text_to_indices(item['label'])
        
        # 패딩 처리
        if len(input_indices) < self.max_seq_len:
            input_indices.extend([self.pad_idx] * (self.max_seq_len - len(input_indices)))
        else:
            input_indices = input_indices[:self.max_seq_len-1] + [self.eos_idx]
            
        if len(target_indices) < self.max_seq_len:
            target_indices.extend([self.pad_idx] * (self.max_seq_len - len(target_indices)))
        else:
            target_indices = target_indices[:self.max_seq_len-1] + [self.eos_idx]
        
        return torch.tensor(input_indices, dtype=torch.long), torch.tensor(target_indices, dtype=torch.long)

def train_optimized_model():
    print("최적화된 모델 학습 시작!")
    
    # 1. 데이터 로드 및 어휘 사전 생성
    with open('./dataset.json', 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    char_to_idx, idx_to_char, vocab_size = create_proper_vocab(raw_data)
    
    print(f"최적화된 Vocab Size: {vocab_size}")
    print(f"어휘 사전 예시: {list(char_to_idx.items())[:10]}")
    
    # 2. 데이터셋 및 데이터로더 생성
    max_seq_len = 50
    dataset = OptimizedDialogueDataset('./dataset.json', char_to_idx, max_seq_len)
    dataloader = data.DataLoader(dataset, batch_size=16, shuffle=True)
    
    # 3. 모델 초기화
    embed_dim = 128
    num_heads = 8
    num_layers = 4
    
    model = TransformerModel(vocab_size, embed_dim, num_heads, num_layers, max_seq_len)
    
    # 4. 학습 설정
    device = torch.device('cpu')  # 안정성을 위해 CPU 사용
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss(ignore_index=char_to_idx['<PAD>'])
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    epochs = 15
    
    print(f"학습 시작: {epochs} epochs, vocab_size={vocab_size}")
    
    # 5. 학습 루프
    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        
        for batch_idx, (inputs, targets) in enumerate(dataloader):
            inputs, targets = inputs.to(device), targets.to(device)
            
            optimizer.zero_grad()
            
            # Teacher Forcing: 타겟의 마지막 토큰을 제외하고 입력으로 사용
            tgt_input = targets[:, :-1]  # 마지막 제외
            tgt_output = targets[:, 1:]  # 첫 번째 제외
            
            # Forward pass
            output = model(inputs, tgt_input)
            
            # Loss 계산
            loss = criterion(output.reshape(-1, vocab_size), tgt_output.reshape(-1))
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()
            total_loss += loss.item()
            
            if batch_idx % 10 == 0:
                print(f"  Batch {batch_idx}/{len(dataloader)}, Loss: {loss.item():.4f}")
        
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1}/{epochs} 완료! Average Loss: {avg_loss:.4f}")
        
        # 에포크마다 체크포인트 저장
        checkpoint = {
            'epoch': epoch + 1,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'loss': avg_loss,
            'vocab_size': vocab_size,
            'embed_dim': embed_dim,
            'num_heads': num_heads,
            'num_layers': num_layers,
            'max_seq_len': max_seq_len,
            'char_to_idx': char_to_idx,
            'idx_to_char': idx_to_char
        }
        torch.save(checkpoint, f"reze_optimized_epoch_{epoch+1}.pth")
        print(f"체크포인트 저장: reze_optimized_epoch_{epoch+1}.pth")
    
    # 최종 모델 저장
    torch.save(checkpoint, "reze_optimized_final.pth")
    print(f"최적화된 모델 학습 완료! 최종 Loss: {avg_loss:.4f}")
    
    return model, char_to_idx, idx_to_char

if __name__ == "__main__":
    train_optimized_model()