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
    const dohwaMap = {1:'자',2:'오',3:'묘',4:'유',5:'자',6:'오',7:'묘',8:'유',9:'자',10:'오',11:'묘',12:'유'};
    const dohwa = dohwaMap[m] + '도화살';

    const zodiacList = [
      [1,20,'염소자리'],[2,19,'물병자리'],[3,20,'물고기자리'],[4,20,'양자리'],
      [5,21,'황소자리'],[6,21,'쌍둥이자리'],[7,23,'게자리'],[8,23,'사자자리'],
      [9,23,'처녀자리'],[10,23,'천칭자리'],[11,22,'전갈자리'],[12,22,'사수자리']
    ];
    let zodiac = '염소자리';
    for (const [zm, zd, zn] of zodiacList) {
      if (m === zm && day >= zd) { zodiac = zn; break; }
    }

    const concernMap = {
      'q1':'겉모습과 속마음 괴리',
      'q2':'반복되는 연애 패턴',
      'q3':'감정 회피와 관계 불안',
      'q4':'표면적 관계에 대한 갈증',
      'q5':'자존감과 사랑받을 자격'
    };
    const concernHint = concernMap[concern] || '없음';

    const elemColorMap = {
      '목': ['#22c55e','#10b981'],
      '화': ['#ef4444','#f97316'],
      '토': ['#ca8a04','#a16207'],
      '금': ['#fbbf24','#d4af37'],
      '수': ['#6366f1','#8b53fe']
    };
    const [mc, sc] = elemColorMap[elem] || ['#8b53fe','#8eff01'];

    const prompt = `당신은 관상학, 사주명리학, 서양점성술, 혈액형 이론을 통합하는 운명 분석 전문가입니다.
아래 정보와 첨부 사진을 분석해서 반드시 유효한 JSON만 반환하세요.
JSON 외 다른 텍스트, 마크다운, 코드블록은 절대 쓰지 마세요.
중괄호로 시작해서 중괄호로 끝내세요.

[분석 정보]
생년월일: ${y}년 ${m}월 ${day}일
출생시간: ${birthTime || '미입력'}
혈액형: ${bloodType || '미입력'}
사주 천간: ${stem} / 오행: ${elem}
도화살: ${dohwa}
별자리: ${zodiac}
핵심 고민: ${concernHint}

[관상→패턴 기준]
날카로운 이목구비=sharp/electric, 부드럽고 둥근=wave/fluid, 신비로운 눈=organic/deep, 강렬한 눈=burst

반환 JSON (반드시 이 형식 그대로):
{
  "aura_type": "집착 유발형",
  "aura_name": "딥 블루베리 인디고",
  "main_color": "${mc}",
  "sub_color": "${sc}",
  "pattern": "wave",
  "dohwa_score": 82,
  "extra_color_desc": "짙은 블루베리빛 오로라",
  "analysis_line1": "외면과 내면 차이에 대한 3-4줄 분석",
  "analysis_line2": "메인 컬러 매력에 대한 3-4줄 분석",
  "analysis_line3": "아우라 변동 예고 3-4줄",
  "p5_basic_open": "기본 성격 핵심 한 문장",
  "p5_basic_open2": "두 번째 문장 핵심단어 ██ 처리",
  "p5_basic_blur": "성격 기질 무의식 상세 분석 300자 이상",
  "p5_attract_open": "매력 도화 핵심 한 문장",
  "p5_attract_open2": "두 번째 문장 핵심단어 ██ 처리",
  "p5_attract_blur": "매력 도화살 상세 분석 300자 이상",
  "p5_relation_open": "관계 패턴 핵심 한 문장",
  "p5_relation_open2": "두 번째 문장 핵심단어 ██ 처리",
  "p5_relation_blur": "연애 인간관계 패턴 상세 분석 300자 이상",
  "p5_problem_open": "반복 문제 핵심 한 문장",
  "p5_problem_open2": "두 번째 문장 핵심단어 ██ 처리",
  "p5_problem_blur": "방해 요소 반복 실패 상세 분석 300자 이상",
  "p5_instinct_open": "가끔 ██하고 싶다는 생각 안 드시나요",
  "p5_instinct_open2": "두 번째 문장 핵심단어 ██ 처리 자극적으로",
  "p5_instinct_blur": "숨겨진 욕망 본능 성인용 상세 분석 300자 이상"
}

위 JSON 형식을 실제 분석 내용으로 채워서 반환하세요. 모든 텍스트는 한국어로 작성하세요.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error('Claude API 오류: ' + response.status + ' ' + JSON.stringify(err));
    }

    const data = await response.json();
    const raw = data.content[0].text.trim();
    const cleaned = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error('파싱 실패 원본:', raw.substring(0, 300));
      throw new Error('AI 응답 파싱 실패');
    }

    const result = JSON.parse(match[0]);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('분석 오류:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
