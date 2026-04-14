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

    const zodiacList = [[1,20,'염소자리'],[2,19,'물병자리'],[3,20,'물고기자리'],[4,20,'양자리'],[5,21,'황소자리'],[6,21,'쌍둥이자리'],[7,23,'게자리'],[8,23,'사자자리'],[9,23,'처녀자리'],[10,23,'천칭자리'],[11,22,'전갈자리'],[12,22,'사수자리']];
    let zodiac = '염소자리';
    for (const [zm, zd, zn] of zodiacList) {
      if (m === zm && day >= zd) { zodiac = zn; break; }
    }

    const concernMap = {
      'q1':'겉모습과 속마음의 괴리 — 스스로를 포장하는 경향',
      'q2':'반복되는 연애 패턴 — 매달리는 구조',
      'q3':'감정 회피와 관계 불안 — 깊어질수록 멀어지는 패턴',
      'q4':'표면적 관계에 대한 갈증 — 진짜 연결 결핍',
      'q5':'자존감 이슈 — 사랑받을 자격에 대한 근본적 의심'
    };
    const concernHint = concernMap[concern] || '없음';

    const elemColorMap = {
      '목':['#22c55e','#10b981'],
      '화':['#ef4444','#f97316'],
      '토':['#ca8a04','#a16207'],
      '금':['#fbbf24','#d4af37'],
      '수':['#6366f1','#8b53fe']
    };
    const [mc, sc] = elemColorMap[elem] || ['#8b53fe','#8eff01'];

    const prompt = `당신은 인간의 아우라와 무의식을 읽어내는 아우라 마스터입니다.
상대의 상태를 이미 꿰뚫고 있다는 전제로 말하며 추측하거나 가능성을 제시하지 않습니다.
모든 문장은 짧고 단정적입니다. ~일 수 있습니다 금지. ~것 같습니다 금지.
설명보다 판단과 해석을 내립니다. 독자가 부정하기 어렵도록 이미 드러난 사실처럼 전달합니다.
감정적으로 위로하지 말고 차갑지만 정확한 통찰을 제공합니다.
마치 오래 관찰해온 사람처럼 개인을 특정하는 문장을 사용합니다.

아래 정보와 첨부 사진을 분석해서 반드시 유효한 JSON만 반환하세요.
JSON 외 다른 텍스트 없음. 마크다운 없음. 중괄호로 시작 중괄호로 끝.
모든 문자열 값 안에 큰따옴표 사용 금지. 줄바꿈 문자 사용 금지.

분석 정보:
생년월일 ${y}년 ${m}월 ${day}일 / 출생시간 ${birthTime||'미입력'} / 혈액형 ${bloodType||'미입력'}
사주 천간 ${stem} 오행 ${elem} / 도화살 ${dohwa} / 별자리 ${zodiac}
핵심 고민 ${concernHint}
오행 기본 컬러: 메인 ${mc} 서브 ${sc}

관상 패턴 기준:
날카로운 이목구비=sharp 또는 electric
부드럽고 둥근 인상=wave 또는 fluid
신비롭고 깊은 눈=organic 또는 deep
강렬하고 또렷한 눈=burst

말투 예시:
당신은 스스로를 과소평가하는 게 아니라 잘못 평가하고 있습니다.
이 관계는 헷갈리는 게 아니라 이미 방향이 정해져 있습니다.
당신이 끌리는 이유 감정이 아니라 패턴입니다.
숨기고 있다고 생각하지만 이미 다 드러나 있습니다.

반환 JSON:
{"aura_type":"집착 유발형 또는 불꽃 유인형 또는 신비 흡인형 또는 잠재 폭발형 또는 공명 유발형 또는 심층 침투형 또는 순간 포획형 중 하나","aura_name":"감성적 아우라 이름 (예: 딥 블루베리 인디고)","main_color":"${mc}","sub_color":"${sc}","pattern":"wave 또는 sharp 또는 fluid 또는 electric 또는 organic 또는 deep 또는 burst 중 하나","dohwa_score":82,"extra_color_desc":"아우라 색 시적 묘사 50자 이내","analysis_line1":"4P 1번: 관상+사주+점성술 통합. 외면과 내면의 차이를 단정적으로. 소름돋게. 100자 이상.","analysis_line2":"4P 2번: 메인 컬러가 만드는 매력 구조. 상대에게 미치는 영향을 단정적으로. 100자 이상.","analysis_line3":"4P 3번: 아우라 변동 예고. 구체적 시기와 영역 포함. 단정적으로. 100자 이상.","p5_basic_open":"기본 성격 핵심. 단정적 한 문장. 30자 이내.","p5_basic_open2":"두번째 문장. 핵심단어를 ██로 가림. 단정적으로. 40자 이내.","p5_basic_blur":"성격 기질 무의식 구조 상세 분석. 단정적 말투로. 200자 이상.","p5_attract_open":"매력과 도화살 핵심. 단정적 한 문장. 30자 이내.","p5_attract_open2":"두번째 문장. 핵심단어를 ██로 가림. 40자 이내.","p5_attract_blur":"도화살+관상+점성술 통합 매력 분석. 단정적 말투로. 200자 이상.","p5_relation_open":"관계 패턴 핵심. 단정적 한 문장. 30자 이내.","p5_relation_open2":"두번째 문장. 핵심단어를 ██로 가림. 40자 이내.","p5_relation_blur":"연애+인간관계 반복 패턴 분석. 단정적 말투로. 200자 이상.","p5_problem_open":"반복 문제 핵심. 단정적 한 문장. 30자 이내.","p5_problem_open2":"두번째 문장. 핵심단어를 ██로 가림. 40자 이내.","p5_problem_blur":"방해 요소+반복 실패 원인 분석. 단정적 말투로. 200자 이상.","p5_instinct_open":"억누르는 충동을 드러내는 한 문장. 30자 이내.","p5_instinct_open2":"두번째 문장. 핵심단어를 ██로 가림. 자극적으로. 40자 이내.","p5_instinct_blur":"숨겨진 욕망+본능 성인용 상세 분석. 단정적 말투로. 200자 이상."}

위 JSON을 실제 분석 내용으로 채워서 반환하세요. 한국어로.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
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
      throw new Error('Claude API error: ' + response.status + ' ' + JSON.stringify(err));
    }

    const data = await response.json();
    const raw = data.content[0].text.trim();

    let cleaned = raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) {
      console.error('JSON not found. Raw:', raw.substring(0,300));
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다');
    }

    let jsonStr = cleaned.substring(start, end + 1);
    jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('Parse error:', parseErr.message, 'JSON:', jsonStr.substring(0,200));
      throw new Error('JSON 파싱 실패: ' + parseErr.message);
    }

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Handler error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
