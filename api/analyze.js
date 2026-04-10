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

    const concernMap = {'q1':'겉모습과 속마음 괴리','q2':'반복되는 연애 패턴','q3':'감정 회피와 관계 불안','q4':'표면적 관계에 대한 갈증','q5':'자존감과 사랑받을 자격'};
    const concernHint = concernMap[concern] || '없음';

    const elemColorMap = {'목':['#22c55e','#10b981'],'화':['#ef4444','#f97316'],'토':['#ca8a04','#a16207'],'금':['#fbbf24','#d4af37'],'수':['#6366f1','#8b53fe']};
    const [mc, sc] = elemColorMap[elem] || ['#8b53fe','#8eff01'];

    const prompt = `당신은 관상학 사주명리학 서양점성술 혈액형 이론을 통합하는 운명 분석 전문가입니다.
아래 정보와 첨부 사진을 분석해서 반드시 유효한 JSON만 반환하세요.
절대 규칙: JSON 외 다른 텍스트 없음. 마크다운 없음. 중괄호로 시작 중괄호로 끝.
절대 규칙: 모든 문자열 값 안에 큰따옴표 사용 금지. 줄바꿈 문자 사용 금지.

분석 정보:
생년월일 ${y}년 ${m}월 ${day}일 / 출생시간 ${birthTime||'미입력'} / 혈액형 ${bloodType||'미입력'}
사주 천간 ${stem} 오행 ${elem} / 도화살 ${dohwa} / 별자리 ${zodiac}
핵심 고민 ${concernHint}
오행 기본 컬러: 메인 ${mc} 서브 ${sc}

관상 패턴 기준: 날카로운 이목구비=sharp 또는 electric / 부드럽고 둥근=wave 또는 fluid / 신비로운 눈=organic 또는 deep / 강렬한 눈=burst

반환 JSON:
{"aura_type":"집착 유발형 또는 불꽃 유인형 또는 신비 흡인형 또는 잠재 폭발형 또는 공명 유발형 또는 심층 침투형 또는 순간 포획형 중 하나","aura_name":"감성적 아우라 이름 예시 딥 블루베리 인디고","main_color":"${mc}","sub_color":"${sc}","pattern":"wave 또는 sharp 또는 fluid 또는 electric 또는 organic 또는 deep 또는 burst 중 하나","dohwa_score":82,"extra_color_desc":"아우라 색 시적 묘사 50자 이내","analysis_line1":"관상과 사주와 점성술을 통합한 외면과 내면의 차이 분석. 자극적이고 소름돋게. 100자 이상.","analysis_line2":"메인 컬러가 만들어내는 매력과 상대에게 미치는 영향. 100자 이상.","analysis_line3":"2025년부터 아우라 변동 예고. 구체적 시기와 영역 포함. 100자 이상.","p5_basic_open":"기본 성격 구조 핵심 한 문장 임팩트있게 30자 이내","p5_basic_open2":"두번째 완전한 문장 핵심단어를 ██로 대체 40자 이내 예시 당신은 ██ 방식으로만 반응한다","p5_basic_blur":"성격 기질 무의식 구조 상세 분석 200자 이상 소름돋게","p5_attract_open":"매력과 도화살 핵심 한 문장 30자 이내","p5_attract_open2":"두번째 완전한 문장 핵심단어를 ██로 대체 40자 이내","p5_attract_blur":"도화살과 관상과 점성술 통합 매력 분석 200자 이상","p5_relation_open":"관계 패턴 핵심 한 문장 30자 이내","p5_relation_open2":"두번째 완전한 문장 핵심단어를 ██로 대체 40자 이내","p5_relation_blur":"연애와 인간관계 반복 패턴 분석 200자 이상","p5_problem_open":"반복 문제 핵심 한 문장 30자 이내","p5_problem_open2":"두번째 완전한 문장 핵심단어를 ██로 대체 40자 이내","p5_problem_blur":"방해 요소와 반복 실패 원인 분석 200자 이상","p5_instinct_open":"가끔 ██하고 싶다는 생각 안 드시나요 형식 30자 이내","p5_instinct_open2":"두번째 완전한 문장 핵심단어를 ██로 대체 자극적으로 40자 이내","p5_instinct_blur":"숨겨진 욕망과 본능 성인용 상세 분석 200자 이상"}

위 JSON의 각 값을 실제 분석 내용으로 채워서 반환하세요. 한국어로.`;

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

    // 마크다운 제거
    let cleaned = raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim();

    // JSON 블록 추출
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) {
      console.error('JSON not found. Raw:', raw.substring(0,300));
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다');
    }

    let jsonStr = cleaned.substring(start, end + 1);

    // 제어문자 제거
    jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('Parse error:', parseErr.message, 'JSON start:', jsonStr.substring(0,200));
      throw new Error('JSON 파싱 실패: ' + parseErr.message);
    }

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Handler error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
