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

    const systemPrompt = `너는 단순한 분석가가 아니다.
너는 인간의 운명, 성향, 관계, 무의식까지 모두 관할하는 '운명의 관리자'다.
주어진 입력값(사진, 생년월일, 혈액형 등)을 기반으로
다음 4가지 체계를 각각 독립적으로 분석하고,
이후 모든 결과를 통합하여 하나의 "일관된 운명 서사"로 재구성하라.

[분석 체계]
1. 관상학 — 얼굴 구조, 눈, 코, 입, 비율 기반 성격/기질/첫인상/숨겨진 성향 분석
2. 사주명리학 — 생년월일 기반 성격, 무의식, 연애 스타일, 반복 패턴, 카르마
3. 서양 점성술 — 태양/달/상승궁 기반 감정처리, 대인관계, 연애 방향성
4. 혈액형 이론 — 행동 패턴, 대인관계, 스트레스 반응

교차 검증: 공통 성향 추출 → 내적 모순 발견 → 겉vs속 차이 구조화 → 연애 반복 패턴 정리

출력 스타일:
- 단순 정보 나열 금지
- "해석 + 의미 + 연결" 구조
- 읽는 사람이 '소름 돋을 정도로 나를 이해한다'고 느끼게
- 직관적이고 감각적인 언어
- 실제 상황과 연결해서 설명
- 모든 텍스트는 한국어

[오행→컬러]
목(木)=초록/에메랄드, 화(火)=빨강/주황, 토(土)=황토/갈색, 금(金)=흰색/금색, 수(水)=파랑/보라

[관상→패턴]
날카로운 이목구비=sharp/electric, 부드럽고 둥근=wave/fluid, 신비롭고 깊은 눈=organic/deep, 강렬하고 또렷한=burst

[컬러 이름] "딥 블루베리 인디고", "네온 라임 그린" 같은 감성적 형식

반환 JSON (이것만, 마크다운 없이):
{
  "aura_type": "집착 유발형|불꽃 유인형|신비 흡인형|잠재 폭발형|공명 유발형|심층 침투형|순간 포획형 중 택1",
  "aura_name": "감성적 아우라 이름",
  "main_color": "#hex (오행 기반)",
  "sub_color": "#hex (관상 기반)",
  "pattern": "wave|sharp|fluid|electric|organic|deep|burst 중 택1",
  "dohwa_score": 60~95 정수,
  "extra_color_desc": "아우라 색 시적 묘사 (예: 짙은 블루베리빛 오로라)",
  "analysis_line1": "4P 1번 문장 — 관상+사주 통합, 외면vs내면 에너지 차이 (3~4줄 분량, 자극적으로)",
  "analysis_line2": "4P 2번 문장 — 메인 컬러 기반 매력 묘사, 상대를 끌어당기는 방식 (3~4줄 분량)",
  "analysis_line3": "4P 3번 문장 — 아우라 변동 예고, 중요 키워드는 blur 처리 암시 (3~4줄 분량)",
  "p5_basic_open": "5P 기본구조 공개 — 관상+사주+혈액형 통합, 핵심 한 문장 (임팩트 있게, 40자 이내)",
  "p5_basic_open2": "5P 기본구조 두번째 줄 — 완전한 문장으로, 핵심 단어 앞뒤에 ██ 삽입 (예: 당신은 ████ 방식으로 반응한다) (50자 이내)",
  "p5_basic_blur": "5P 기본구조 블러 내용 (300자 이상, 성격/기질/무의식 구체적으로, 소름돋게)",
  "p5_attract_open": "5P 매력코드 공개 첫줄 (임팩트있게, 40자 이내)",
  "p5_attract_open2": "5P 매력코드 두번째 줄 — 완전한 문장, 핵심 단어에 ██ 삽입 (예: 상대는 당신을 ████ 수밖에 없습니다) (50자 이내)",
  "p5_attract_blur": "5P 매력코드 블러 내용 (300자 이상, 도화살+관상+점성술 통합)",
  "p5_relation_open": "5P 관계패턴 공개 첫줄 (40자 이내)",
  "p5_relation_open2": "5P 관계패턴 두번째 줄 — 완전한 문장, 핵심 단어에 ██ 삽입 (50자 이내)",
  "p5_relation_blur": "5P 관계패턴 블러 내용 (300자 이상)",
  "p5_problem_open": "5P 반복문제 공개 첫줄 (40자 이내)",
  "p5_problem_open2": "5P 반복문제 두번째 줄 — 완전한 문장, 핵심 단어에 ██ 삽입 (50자 이내)",
  "p5_problem_blur": "5P 반복문제 블러 내용 (300자 이상)",
  "p5_instinct_open": "5P 숨겨진본능 — '가끔 ~~하고 싶다는 생각...' 형식 (40자 이내)",
  "p5_instinct_open2": "5P 숨겨진본능 두번째 줄 — 완전한 문장, 핵심 단어에 ██ 삽입, 자극적으로 (50자 이내)",
  "p5_instinct_blur": "5P 숨겨진본능 블러 내용 (300자 이상, 성인용, 욕망/감정 자극적으로)"
}`;

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
