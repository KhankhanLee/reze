// rezeRAG.js - 레제 지식 베이스 RAG (개선판)
// 특징: 문단 청킹, 역색인, BM25, 요약 압축, 캐시, 자연어 토크나이즈
// 사용법:
//   const rag = new RezeRAG();
//   await rag.loadKnowledge('/reze_knowledge.txt');
//   const prompt = rag.enhancePrompt("레제가 덴지랑 축제에서 뭐 했어?");
//   // -> LLM 프롬프트로 사용

class RezeRAG {
  constructor(options = {}) {
    this.knowledge = '';
    this.chunks = [];           // [{ id, text, tokens, tf }]
    this.inverted = new Map();  // token -> Map(docId -> freq)
    this.docFreq = new Map();   // token -> df
    this.avgDocLen = 0;
    this.isLoaded = false;

    // 옵션
    this.k = options.k ?? 3;                     // 상위 몇 개 문단
    this.maxChunkChars = options.maxChunkChars ?? 600; // 문단 최대 길이
    this.overlap = options.overlap ?? 60;        // 문단 겹침
    this.summarizeLines = options.summarizeLines ?? 3; // 요약 줄 수

    // LRU 캐시
    this.cache = new Map();      // 간단 LRU 캐시
    this.cacheLimit = options.cacheLimit ?? 64;  // 캐시 크기 제한
  }

  // ===== 유틸 =====
  _tokenize(text) {
    // 한국어+영문+숫자 토큰 추출, 소문자화
    // 한글 음절 + 라틴 알파벳/숫자
    const raw = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/ug, ' ')
      .split(/\s+/)
      .filter(Boolean);
    // 너무 짧은 토큰/불용어 제거
    return raw.filter(t => t.length > 1 && !this.stop.has(t));
  }

  _splitIntoParagraphs(raw) {
    // 빈 줄 기준 1차 분할 → 너무 긴 문단은 maxChunkChars 기준으로 슬라이싱(오버랩 포함)
    const paras = raw.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
    const chunks = [];
    for (const p of paras) {
      if (p.length <= this.maxChunkChars) {
        chunks.push(p);
      } else {
        let start = 0;
        while (start < p.length) {
          const end = Math.min(start + this.maxChunkChars, p.length);
          const piece = p.slice(start, end);
          chunks.push(piece.trim());
          if (end >= p.length) break;
          start = end - this.overlap; // overlap
          if (start < 0) start = 0;
        }
      }
    }
    return chunks;
  }

  _buildIndex() {
    const N = this.chunks.length;
    let totalLen = 0;

    this.chunks.forEach(doc => {
      totalLen += doc.tokens.length;
      const tf = new Map();
      doc.tokens.forEach(tok => tf.set(tok, (tf.get(tok) || 0) + 1));
      doc.tf = tf;
      // 역색인
      for (const [tok, f] of tf) {
        if (!this.inverted.has(tok)) this.inverted.set(tok, new Map());
        this.inverted.get(tok).set(doc.id, f);
      }
    });

    // df 계산
    for (const [tok, postings] of this.inverted.entries()) {
      this.docFreq.set(tok, postings.size);
    }
    this.avgDocLen = totalLen / Math.max(1, N);
  }

  _bm25Score(queryTokens, doc) {
    const N = this.chunks.length;
    const dl = doc.tokens.length || 1;
    let score = 0;

    for (const q of queryTokens) {
      const df = this.docFreq.get(q);
      if (!df) continue;
      const idf = Math.log( (N - df + 0.5) / (df + 0.5) + 1 ); // +1 안정화
      const f = doc.tf.get(q) || 0;
      const denom = f + this.k1 * (1 - this.b + this.b * (dl / this.avgDocLen));
      score += idf * ((f * (this.k1 + 1)) / (denom || 1));
    }
    return score;
  }

  _summarize(text, lines = this.summarizeLines) {
    // 아주 단순한 압축: 첫 문장 + 핵심 키워드가 포함된 문장 위주 N줄 추출
    const sentences = text.split(/(?<=[.?!…]|[다요]\s|\n)/).map(s => s.trim()).filter(Boolean);
    if (sentences.length <= lines) return sentences.join(' ');
    // 길이/키워드 기준 간단 스코어링
    const toksAll = new Set(this._tokenize(text));
    const scored = sentences.map(s => {
      const tks = this._tokenize(s);
      const overlap = tks.filter(t => toksAll.has(t)).length;
      return { s, score: overlap + Math.min(40, s.length) / 40 }; // 길이 약간 가중
    });
    scored.sort((a,b) => b.score - a.score);
    // 첫 문장 고정 + 상위에서 중복 줄이기
    const out = [sentences[0]];
    for (const cand of scored) {
      if (out.includes(cand.s)) continue;
      out.push(cand.s);
      if (out.length >= lines) break;
    }
    return out.join(' ');
  }

  _setCache(key, val) {
    if (this.cache.size >= this.cacheLimit) {
      // 가장 오래된 항목 제거
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, val);
  }

  _getCache(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      // 최근 사용으로 표시하기 위해 키 삭제 후 재설정
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  // ===== 퍼블릭 API =====
  async loadKnowledge(path = '/reze_knowledge.txt') {
    const res = await fetch(path);
    this.knowledge = await res.text();

    // 청킹
    const rawChunks = this._splitIntoParagraphs(this.knowledge);
    this.chunks = rawChunks.map((text, idx) => ({
      id: idx,
      text,
      tokens: this._tokenize(text),
      tf: null
    }));

    // 인덱스
    this._buildIndex();

    this.isLoaded = true;
    console.log(`레제 지식 베이스 로드 완료: ${this.chunks.length}개 청크, avgLen=${this.avgDocLen.toFixed(1)}`);
  }

  search(query, k = this.k) {
    const cacheKey = `search:${query}`;
    const cachedResult = this._getCache(cacheKey);
    if (cachedResult) {
      console.log('캐시 적중:', query);
      return cachedResult;
    }

    // 캐시 미스 → 기존 검색 로직
    const qTokens = this._tokenize(query);
    if (qTokens.length === 0) return [];

    // 후보 문서 수 빠르게 제한: 쿼리 토큰이 한 번이라도 등장한 doc만 집합으로
    const candidate = new Set();
    for (const qt of qTokens) {
      const postings = this.inverted.get(qt);
      if (!postings) continue;
      for (const docId of postings.keys()) candidate.add(docId);
    }

    // BM25 점수 계산
    const scored = [];
    for (const id of candidate) {
      const doc = this.chunks[id];
      const score = this._bm25Score(qTokens, doc);
      if (score > 0) scored.push({ id, score });
    }
    scored.sort((a,b) => b.score - a.score);
    const top = scored.slice(0, Math.max(1, k)).map(({ id, score }) => ({
      id,
      score,
      text: this.chunks[id].text
    }));

    this._setCache(cacheKey, top);
    return top;
  }

  // 프롬프트 강화: 상위 K개 → 요약 → 콤팩트 컨텍스트
  enhancePrompt(userMessage, opts = {}) {
    const k = opts.k ?? this.k;
    const lines = opts.summarizeLines ?? this.summarizeLines;

    const hits = this.search(userMessage, k);
    if (!hits.length) return userMessage;

    const compact = hits.map((h, i) => {
      const brief = this._summarize(h.text, lines);
      return `(${i+1}) ${brief}`;
    }).join('\n');

    return `[레제 관련 요약 컨텍스트]
${compact}

[사용자 질문]
${userMessage}

위 정보를 꼭 그대로 복사하지 말고, 핵심만 참고해서 레제답게 자연스럽게 한국어 반말로 1~2문장으로 먼저 답하고, 필요하면 이어서 덧붙여. 감정 표현은 *동작* 형태만 사용.`;
  }
}

// 전역 인스턴스(브라우저에서 바로 사용)
const rezeRAG = new RezeRAG();

// (선택) Web Worker로 오프로딩하고 싶다면:
// - 위 클래스를 워커 스크립트에 넣고, 메인 스레드에서 postMessage({type:'search', query}) 등으로 통신하면 UI 렉을 줄일 수 있음.

export { RezeRAG, rezeRAG };
