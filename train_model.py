import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import json
import sys
import torch.nn.functional as F

# DataSet
class SimpleDataset(Dataset):
    def __init__(self, data_path):
        with open(data_path, 'r') as f:
            self.data = json.load(f)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        max_length = 50 
        # Convert 'input' and 'label' from strings to tensors
        x = torch.tensor([ord(c) for c in self.data[idx]['input']], dtype=torch.float32)
        y = torch.tensor([ord(c) for c in self.data[idx]['label']], dtype=torch.float32)

        #Pad or truncate to max_length
        x = torch.nn.functional.pad(x, (0,max_length - len(x)))[:max_length]
        y = torch.nn.functional.pad(y, (0,max_length - len(y)))[:max_length]
        return x, y

# Transformer 모델 정의
class TransformerModel(nn.Module):
    def __init__(self, vocab_size, embed_dim, num_heads, num_layers, max_seq_len):
        super(TransformerModel, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.positional_encoding = nn.Parameter(torch.zeros(1, max_seq_len, embed_dim))
        self.transformer = nn.Transformer(
            d_model=embed_dim,
            nhead=num_heads,
            num_encoder_layers=num_layers,
            num_decoder_layers=num_layers
        )
        self.fc_out = nn.Linear(embed_dim, vocab_size)

    def forward(self, src, tgt):
        src = self.embedding(src) + self.positional_encoding[:, :src.size(1), :]
        tgt = self.embedding(tgt) + self.positional_encoding[:, :tgt.size(1), :]
        output = self.transformer(src, tgt)
        return self.fc_out(output)

# 학습 함수 (Scheduled Sampling 적용)
def train_transformer_model(model, dataloader, criterion, optimizer, epochs, vocab_size, device, model_name):
    """
    Scheduled Sampling을 적용한 학습 함수
    초기에는 teacher forcing을 많이 사용하고, 점차 모델 자신의 예측을 사용
    """
    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        
        # Scheduled Sampling 비율 계산 (epoch이 증가할수록 감소)
        teacher_forcing_ratio = max(0.5, 1.0 - (epoch / epochs) * 0.5)
        
        num_batches = len(dataloader)
        print(f"\nEpoch {epoch+1}/{epochs} 시작 (배치 수: {num_batches}, Teacher Forcing: {teacher_forcing_ratio:.2f})")
        
        for batch_idx, (inputs, labels) in enumerate(dataloader):
            if batch_idx % 5 == 0:  # 5개 배치마다 진행 상황 출력
                print(f"  배치 {batch_idx+1}/{num_batches} 처리 중...", flush=True)
            
            optimizer.zero_grad()
            # 데이터를 GPU로 이동
            inputs, labels = inputs.long().to(device), labels.long().to(device)
            batch_size, seq_len = labels.size()
            
            # 디코더 입력 초기화 (시작 토큰)
            tgt_input = torch.full((batch_size, 1), vocab_size - 1, dtype=torch.long).to(device)
            
            # 자동회귀 방식으로 학습
            outputs = []
            for t in range(seq_len):
                # 현재까지의 입력으로 예측
                # 패딩 추가
                tgt_padded = F.pad(tgt_input, (0, seq_len - tgt_input.size(1)), value=vocab_size - 1)
                output = model(inputs, tgt_padded)
                
                # 현재 타임스텝의 출력
                current_output = output[:, t:t+1, :]  # (batch_size, 1, vocab_size)
                outputs.append(current_output)
                
                # 다음 입력 결정 (Scheduled Sampling)
                if t < seq_len - 1:
                    # teacher forcing 사용 여부 결정
                    use_teacher_forcing = torch.rand(1).item() < teacher_forcing_ratio
                    
                    if use_teacher_forcing:
                        # 정답 사용
                        next_token = labels[:, t:t+1]
                    else:
                        # 모델의 예측 사용
                        next_token = output[:, t, :].argmax(dim=-1, keepdim=True)
                    
                    tgt_input = torch.cat([tgt_input, next_token], dim=1)
            
            # 출력을 하나로 합치기
            outputs = torch.cat(outputs, dim=1)  # (batch_size, seq_len, vocab_size)
            
            # 손실 계산 (패딩 토큰 무시)
            loss = criterion(outputs.reshape(-1, vocab_size), labels.reshape(-1))
            loss.backward()
            
            # Gradient clipping (기울기 폭발 방지)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()
            total_loss += loss.item()
        
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.4f}, Teacher Forcing: {teacher_forcing_ratio:.2f}")
        
        # 중간 저장: 각 에포크마다 모델 저장
        model_cpu = model.to('cpu')  # CPU로 이동하여 저장
        checkpoint = {
            'epoch': epoch + 1,
            'model_state_dict': model_cpu.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'loss': avg_loss,
            'vocab_size': vocab_size,
            'embed_dim': 128,
            'num_heads': 8,
            'num_layers': 4,
            'max_seq_len': 50
        }
        torch.save(checkpoint, f"{model_name}_checkpoint_epoch_{epoch+1}.pth")
        print(f"Epoch {epoch+1} 체크포인트 저장 완료!")
        model = model_cpu.to(device)  # 다시 원래 디바이스로 이동

# 모델 테스트 함수
def test_transformer_model(model, dataloader, vocab_size, device):
    model.eval()
    total_loss = 0.0
    criterion = nn.CrossEntropyLoss()

    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs, labels = inputs.long().to(device), labels.long().to(device)
            tgt_input = F.pad(labels[:, :-1], (1, 0), value=vocab_size - 1)  # Shifted target input
            outputs = model(inputs, tgt_input)
            loss = criterion(outputs.view(-1, vocab_size), labels.view(-1))
            total_loss += loss.item()

    avg_loss = total_loss / len(dataloader)
    print(f"Test Loss: {avg_loss:.4f}")

if __name__ == "__main__":
    # 명령줄 인자로부터 파라미터 읽기
    args = json.loads(sys.argv[1])
    model_name = args['model']
    dataset_path = args['dataset']
    epochs = args['epochs']
    learning_rate = args['learning_rate']

    # GPU 설정 (CUDA)
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"GPU 사용: CUDA")
    else:
        device = torch.device("cpu")
        print(f"CPU 사용 (GPU 사용 불가)")
    
    # 데이터셋 및 데이터로더 준비
    # GPU 메모리 고려하여 배치 크기 조정 (MPS는 메모리 제한이 있음)
    batch_size = 4 if device.type == "mps" else 32
    dataset = SimpleDataset(dataset_path)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    print(f"배치 크기: {batch_size}")

    # 입력 데이터의 최대값 확인
    max_input_value = max(max(ord(c) for c in sample['input']) for sample in dataset.data)
    print(f"Max input value in dataset: {max_input_value}")

    # vocab_size를 유니코드 범위에 맞게 확장
    vocab_size = max(11172, max_input_value + 1)  
    print(f"Using vocab_size: {vocab_size}")

    # 모델 초기화 및 GPU로 이동
    embed_dim = 128
    num_heads = 8
    num_layers = 4
    max_seq_len = 50
    model = TransformerModel(vocab_size, embed_dim, num_heads, num_layers, max_seq_len)
    model = model.to(device)  # 모델을 GPU로 이동
    print(f"모델이 {device}로 이동되었습니다")

    # 손실 함수 및 옵티마이저 설정
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    # 모델 학습 (device와 model_name 파라미터 추가)
    train_transformer_model(model, dataloader, criterion, optimizer, epochs, vocab_size, device, model_name)

    # 학습된 모델 저장 (vocab_size 정보도 함께 저장) - CPU로 이동 후 저장
    model = model.to('cpu')
    checkpoint = {
        'model_state_dict': model.state_dict(),
        'vocab_size': vocab_size,
        'embed_dim': embed_dim,
        'num_heads': num_heads,
        'num_layers': num_layers,
        'max_seq_len': max_seq_len
    }
    torch.save(checkpoint, f"{model_name}_trained.pth")

    # 결과 반환
    print(json.dumps({"status": "success", "message": "Training complete", "vocab_size": vocab_size}))

    # 모델 테스트 (CPU에서 테스트)
    print("Testing the trained model...")
    test_transformer_model(model, dataloader, vocab_size, torch.device('cpu'))