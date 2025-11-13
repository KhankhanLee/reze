import express from 'express';
import { exec } from 'child_process';

const app = express();
const port = 3000;

// JSON 요청 본문 파싱
app.use(express.json());

// /train 엔드포인트
app.post('/train', (req, res) => {
    const { model, dataset, epochs, learning_rate } = req.body;

    if (!model || !dataset || !epochs || !learning_rate) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const args = JSON.stringify({
        model,
        dataset,
        epochs,
        learning_rate
    });

    exec(`python3 train_model.py '${args}'`, (error, stdout, stderr) => {
        if (error) {
            console.error('Training error:', stderr);
            return res.status(500).json({ error: 'Training failed', details: stderr });
        }

        try {
            const result = JSON.parse(stdout);
            res.json(result);
        } catch (parseError) {
            console.error('Failed to parse training result:', stdout);
            res.status(500).json({ error: 'Failed to parse training result', details: stdout });
        }
    });
});

// /chat 엔드포인트 - 학습된 모델을 사용해 대화 응답 생성
app.post('/chat', (req, res) => {
    console.log('=== /chat 요청 받음 ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { message } = req.body;

    if (!message) {
        console.log('메시지 누락');
        return res.status(400).json({ error: 'Message is required' });
    }

    console.log('받은 메시지:', message);
    
    // Python 스크립트를 호출하여 학습된 모델로 예측 수행
    const args = JSON.stringify({ message });
    const command = `python3 predict_hybrid_smart.py '${args}'`;
    
    console.log('빠른 Python 명령 실행:', command);
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Prediction 에러:', error);
            console.error('stderr:', stderr);
            return res.status(500).json({ error: 'Prediction failed', details: stderr });
        }

        console.log('Python stdout:', stdout);
        if (stderr) {
            console.log('Python stderr:', stderr);
        }

        try {
            const result = JSON.parse(stdout);
            console.log('응답 전송:', JSON.stringify(result, null, 2));
            res.json(result);
        } catch (parseError) {
            console.error('JSON 파싱 실패:', parseError);
            console.error('원본 stdout:', stdout);
            res.status(500).json({ error: 'Failed to parse prediction result', details: stdout });
        }
    });
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});