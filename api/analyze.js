export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64, birth, birthTime, bloodType, concern } = req.body;
    if (!imageBase64 || !birth) return res.status(400).json({ error: '사진과 생년월일은 필수입니다' });

    const d = new Date(birth);
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    const stems = ['갑','을','병','정','무','기','경','신','임','계'];
    const elems = ['목','목','화','화','토','토','금','금','수','수'];
    const si = ((y - 4) % 10 + 10) % 10;
    const stem = stems[si], elem = elems[si];
    const dohwaMap = {1:'자(子)도화',2:'오(午)도화',3:'묘(卯)도화',4:'유(酉)도화',5:'자(子)도화',6:'오(午)도화',7:'묘(卯)도화',8:'유(酉)도화',9:'자(子)도화',10:'오(午)도화',11:'묘(卯)도화',12:'유(酉)도화'};
    const dohwa = dohwaMap[m];

    // 고민 선택에 따른 분석 힌트
    const concernMap = {
      'q1': '겉모습과 속마음의 괴리 — 스스로를 포장하고 있는 경향',
      'q2': '반복되는 연애 패턴 — 매달리는 쪽이 되는 구조',
      'q3': '감정 회피 + 관계 불안 — 깊어질수록 멀어지는 패턴',
      'q4': '겉인기 vs 진짜 연결 결핍 — 표면적 관계에 대한 갈증',
      'q5': '자존감 이슈 — 사랑받을 자격에 대한 근본적 의심'
    };
    const concernHint = concernMap[concern] || '미입력';

    const systemPrompt = `당신은 한국 사주명리학과 관상학 전문가입니다.
사용자의 생년월일(사주)과 얼굴 사진(관상)을 함께 분석하여 아우라 리포트를 JSON으로만 반환하세요.
JSON 외 어떤 텍스트도 절대 포함하지 마세요. 마크다운 코드블록도 쓰지 마세요.

[오행→컬러 기준]
목(木)=초록/에메랄드 계열, 화(火)=빨강/주황 계열
토(土)=황토/갈색 계열, 금(金)=흰색/금색 계열, 수(水)=파랑/보라 계열

[관상→패턴 기준]
날카로운 이목구비 → sharp 또는 electric
부드럽고 둥근 인상 → wave 또는 fluid
신비롭고 깊은 눈 → organic 또는 deep
강렬하고 또렷한 눈 → burst

[컬러 이름 감성 형식]
"딥 블루베리 인디고", "네온 라임 그린", "다크 체리 크림슨" 같은 형식으로

반환 JSON (이것만 반환):
{
  "aura_type": "집착 유발형|불꽃 유인형|신비 흡인형|잠재 폭발형|공명 유발형|심층 침투형|순간 포획형 중 택1",
  "aura_name": "감성적인 아우라 이름",
  "main_color": "#hex",
  "sub_color": "#hex",
  "pattern": "wave|sharp|fluid|electric|organic|deep|burst 중 택1",
  "dohwa_score": 60에서 95 사이 정수,
  "extra_color_desc": "아우라 색 시적 묘사",
  "analysis_line1": "4P 첫번째 분석 문장 — 외면과 내면 에너지 차이 (이 사람 이름 없이, '당신'으로, 50자 이내)",
  "analysis_line2": "4P 두번째 문장 — 메인 컬러 기반 매력 묘사 (자극적으로, 60자 이내)",
  "analysis_line3": "4P 세번째 문장 — 앞으로의 아우라 변동 예고 (60자 이내, 블러 처리될 부분 포함)",
  "p5_basic_open": "5P 기본구조 공개 첫줄 (30자 이내, 살짝만 보여주는 느낌)",
  "p5_basic_blur": "5P 기본구조 블러 내용 (200자 이상, 성격/기질/무의식 구체적으로)",
  "p5_attract_open": "5P 매력코드 공개 첫줄 (30자 이내)",
  "p5_attract_blur": "5P 매력코드 블러 내용 (200자 이상, 도화살/첫인상/이성 반응 구체적으로)",
  "p5_relation_open": "5P 관계패턴 공개 첫줄 (30자 이내)",
  "p5_relation_blur": "5P 관계패턴 블러 내용 (200자 이상, 연애/인간관계 패턴 구체적으로)",
  "p5_problem_open": "5P 반복문제 공개 첫줄 (30자 이내)",
  "p5_problem_blur": "5P 반복문제 블러 내용 (200자 이상, 방해 요소/반복 실패 원인 구체적으로)",
  "p5_instinct_open": "5P 숨겨진본능 공개 첫줄 — '가끔 ~하고 싶다는 생각...' 형식으로 (30자 이내)",
  "p5_instinct_blur": "5P 숨겨진본능 블러 내용 (200자 이상, 성인용, 감정/욕망 자극적으로)"
}

분석 시 반드시 고려:
- 사주 천간 ${stem}(${elem}) 특성을 컬러와 성격에 반영
- 도화살 위치: ${dohwa}
- 혈액형 ${bloodType || '미입력'} 특성 반영
- 핵심 고민: ${concernHint}
- 관상(얼굴 사진)에서 눈빛/이목구비/분위기를 읽어서 패턴과 서브 컬러 결정
- 모든 해석은 10~30대 여성이 읽었을 때 "어떻게 알지?" 싶은 수준으로 구체적이고 자극적으로`;

    const userPrompt = `생년월일: ${y}년 ${m}월 ${day}일
출생시간: ${birthTime || '미입력'}
혈액형: ${bloodType || '미입력'}
천간: ${stem} / 오행: ${elem}
도화살: ${dohwa}
핵심 고민: ${concernHint}

위 사주 정보와 첨부된 얼굴 사진의 관상을 통합 분석하여 아우라 리포트를 JSON으로만 반환하세요.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: userPrompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Claude API 오류: ' + response.status);
    }

    const data = await response.json();
    const raw = data.content[0].text.trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI 응답 파싱 실패');

    const result = JSON.parse(match[0]);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('분석 오류:', error);
    return res.status(500).json({ success: false, error: error.message || '분석 중 오류가 발생했습니다' });
  }
}
