(function () {
  const season = (localStorage.getItem('vine-active-season') || '04').replace(/[^0-9]/g, '') || '04';
  const storageKey = `vine-settings-season-${season}`;
  const defaults = {
    season,
    team: '물류팀',
    members: ['이덕성', '송승민', '조기운'],
    membersByTeam: { '물류팀': ['이덕성', '송승민', '조기운'] },
    departments: {
      'CX팀': 2, '상상코칭부지원팀': 9, 'IT팀': 22, '경영지원팀': 3,
      '법무팀': 2, '데이터관리팀': 1, '물류팀': 3, '변화관리팀': 3,
      '브랜드관리팀': 8, '비서실': 1, '콘텐츠연구개발팀': 2, '스마트지원센터': 4,
      '신사업개발팀': 1, '코칭센터사업부': 8, '외식사업부': 1, '인사기획팀': 3,
      '인재양성팀': 3, '재무팀': 10, '코칭관리팀': 2, '비전마케팅부지원팀': 5,
      '파워지원팀': 3, '웹기획관리팀': 2, 'Kids상상코칭부지원팀': 2,
      '카네기연구소': 4, '한국코칭심리협회': 2, '유학사업부': 2,
      '공교육지원사업부': 4
    },
    aliases: {
      '고객경험관리팀(CX)': 'CX팀', 'e상상코칭부지원팀': '상상코칭부지원팀',
      '상상코칭부지원팀*': '상상코칭부지원팀',
      '청소년코칭심리협회': '한국코칭심리협회',
      '(사)청소년코칭심리협회': '한국코칭심리협회', '유학사업단': '유학사업부'
    },
    sheets: {
      criteria: { label: '바인컬처 기준표', url: 'https://docs.google.com/spreadsheets/d/1Wak-uq-5EZvgm5PGadom6fk6Vhkuy4_D/edit?gid=1281628396', gid: '1281628396', kind: 'reference' },
      improvement: { label: '개선', url: 'https://docs.google.com/spreadsheets/d/148MZJOCyvTS5e7GBvcY24FT_UCMFXGxrt9SwNpG_id8/edit?gid=2090953107', gid: '2090953107', kind: 'live' },
      reading: { label: '독서경영', url: 'https://docs.google.com/spreadsheets/d/1CvLbTuk4xtV7wxjpwOPCW2T6KHE9YBrHQv7gnTN3DVg/edit?gid=2001056279', gid: '2001056279', kind: 'live' },
      education: { label: '교육보고서', url: 'https://docs.google.com/spreadsheets/d/136fXrgs3ciPfIAdnBCM6jqApwvjB9BqimlxFg2iKKHw/edit?gid=1984001251', gid: '1984001251', kind: 'live' }
    },
    submissionLinks: {
      inhr: 'https://auth.inhrplus.com/auth/universal-login/login?serviceType=HRP&client=HRP&domain=vine&returnTo=/auth/universal-login-sessions/universal-login/done?returnTo%3D/auth/authorize?domain%253Dvine%2526serviceType%253DHRP%2526apprServiceType%253Dfalse%2526port%253D%2526pageUrl%253Dperformance-manage%25252Fboards%25252F%25253FcampaignId%25253D18%26serviceType%3DHRP%26domain%3Dvine',
      risk: 'https://drive.google.com/drive/folders/1iYmwSRi_6EU92O-OSBLaczRECOMCEmx5',
      education: 'https://docs.google.com/spreadsheets/d/1aw-nNFpy0jep0RY7LXPG1KPpiWQ5dRILoXlCCymzKu0/edit?usp=sharing',
      reading: 'https://docs.google.com/spreadsheets/d/1-WSy2-m9eXoYTP09IQz390Xtz2c8wN9qIvnCqtuWPIc/edit?usp=sharing',
      teamCulture: 'https://forms.gle/jQiQkzzUyYxQU1ATA',
      philosophy: 'https://forms.gle/avuyH3wGxVjJqV14A'
    },
    scores: {
      ceoFull: 30, ceoPartial: 20, speakerFull: 20, speakerPartial: 10,
      checkinOnTime: 20, checkinLate: 10, improvementOne: 40, improvementTwoPlus: 60,
      riskOnTime: 40, riskLate: 30, supplyDepartment: [50, 40, 30],
      supplyPersonal: [20, 15, 10], educationRanks: [60, 50, 40, 30, 20, 10],
      academyPerCourse: 20, academyCap: 60, readingPerReview: 5, readingCap: 30,
      teamEducation: 60, mentoringRanks: [100, 80, 60, 40, 20, 10],
      oneDayPerEvent: 20, oneDayCap: 40, workshop: 50, teamCultureCap: 70,
      tft: 30, customer: 30, socialParticipation: 20, socialTop: 30,
      ideaPerItem: 5, ideaCap: 50, savingAwardRanks: [50, 30],
      project100: 100, smallImprovement: 50, aiLeague: 30,
      rankRise: [100, 70, 50]
    }
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  let saved;
  try { saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { saved = null; }
  const config = clone(defaults);
  if (saved && typeof saved === 'object') {
    Object.assign(config, saved);
    config.departments = { ...defaults.departments, ...(saved.departments || {}) };
    config.sheets = { ...defaults.sheets, ...(saved.sheets || {}) };
    config.submissionLinks = { ...defaults.submissionLinks, ...(saved.submissionLinks || {}) };
    config.scores = { ...defaults.scores, ...(saved.scores || {}) };
    if (config.sheets.education.url.includes('136fXrgs3ciPfIAdnBCM6jqApwvjB9BqimlxFg2iKKHw') && config.sheets.education.gid === '1972509246') {
      config.sheets.education = { ...defaults.sheets.education };
    }
  }
  config.membersByTeam = { ...defaults.membersByTeam, ...(config.membersByTeam || {}), [config.team]: [...config.members] };
  config.members = Array.from({ length: config.departments[config.team] || 3 }, (_, index) => config.members[index] || `팀원 ${index + 1}`);
  config.membersByTeam[config.team] = [...config.members];
  window.vineConfig = config;
  window.vineDefaults = defaults;
  window.vineSourceIsDefault = key => config.season === '04' && config.sheets[key].url === defaults.sheets[key].url && config.sheets[key].gid === defaults.sheets[key].gid;
  const sheetId = url => (url.match(/\/spreadsheets\/d\/([\w-]+)/) || [])[1] || '';
  const sheetPageFrom = (url, gid) => {
    const id = sheetId(url);
    return id && /^\d+$/.test(String(gid)) ? `https://docs.google.com/spreadsheets/d/${id}/edit?gid=${gid}#gid=${gid}` : '';
  };
  window.vineSheetUrl = (key, month = window.vineMonth || '2026-10') => {
    const sheet = config.sheets[key];
    const id = sheetId(sheet.url);
    if (!id) return '';
    if (month === '2026-10' || key === 'criteria') return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${sheet.gid}`;
    const tab = key === 'education' ? `${Number(month.slice(5))}월` : `${month.slice(2, 4)}년 ${month.slice(5)}월`;
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  };
  window.vineSheetPageUrl = (key, month = window.vineMonth || '2026-10') => {
    const sheet = config.sheets[key], id = sheetId(sheet.url);
    if (!id) return '';
    const knownNovember = { improvement: '400706647', reading: '257746296', education: '2147322710' };
    const gid = month === '2026-10' ? sheet.gid : month === '2026-11' && id === sheetId(defaults.sheets[key].url) ? knownNovember[key] : '';
    return `https://docs.google.com/spreadsheets/d/${id}/edit${gid ? `?gid=${gid}#gid=${gid}` : ''}`;
  };
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const scoreNames = {
    ceoFull: 'CEO일정 전원', ceoPartial: 'CEO일정 일부', speakerFull: '명사초청 전원', speakerPartial: '명사초청 일부',
    checkinOnTime: '체크인 기한내', checkinLate: '체크인 기한외', improvementOne: '개선 1명', improvementTwoPlus: '개선 2명 이상',
    riskOnTime: '리스크 기한내', riskLate: '리스크 기한외', supplyDepartment: '보급 부서 1·2·3위', supplyPersonal: '보급 개인 1·2·3위',
    educationRanks: '교육보고서 순위 구간', academyPerCourse: '아카데미 수료당', academyCap: '아카데미 월 상한',
    readingPerReview: '독서리뷰 1건당', readingCap: '독서경영 월 상한', teamEducation: '경영개선팀 교육',
    mentoringRanks: '직무컨설팅 순위 구간', oneDayPerEvent: '원데이 팀일정 1회', oneDayCap: '원데이 팀일정 상한',
    workshop: '원데이 워크샵 1회', teamCultureCap: '팀문화 합산 상한', tft: 'TFT 제출', customer: '고객관리 제출',
    socialParticipation: '사회공헌 참여', socialTop: '사회공헌 최다 참여율 포함', ideaPerItem: 'CEO아이디어 1건당',
    ideaCap: 'CEO아이디어 상한', savingAwardRanks: '경비절감 시상 1·2위', project100: '100프로젝트',
    smallImprovement: '작은개선 시상', aiLeague: 'AI리그', rankRise: '상승순위 1·2·3위'
  };
  const submissionNames = {
    inhr: 'inHR+ · 과제등록·성과체크인·경비절감·개선·작은개선',
    risk: '리스크 보고서', education: '교육보고서 제출', reading: '독서경영 제출',
    teamCulture: '팀문화 · 워크샵·원데이 일정', philosophy: '필로소피 · TFT·고객관리'
  };
  const criteriaNotes = {
    'ceo-attendees': '경영개선팀 CEO일정: 팀 전체 참여 30점 / 1명 이상 불참 20점',
    'speaker-attendees': '명사초청: 팀 전체 참여 20점 / 1명 이상 불참 10점',
    'task-status': 'inHR 제출물 3가지, 제출물당 기한 내 제출 20점 / 기한 외 제출(유예, 제외대상) 10점 / 미제출 0점',
    'performance-status': 'inHR 제출물 3가지, 제출물당 기한 내 제출 20점 / 기한 외 제출(유예, 제외대상) 10점 / 미제출 0점',
    'saving-status': 'inHR 제출물 3가지, 제출물당 기한 내 제출 20점 / 기한 외 제출(유예, 제외대상) 10점 / 미제출 0점',
    'improvement-count': '개선사항 월별 참여인원수: 60% 이상 60점 / 30% 이상 40점 / 30% 이하 30점 / 미제출 0점\n작성방법: 개선 전 / 개선 내용 / 결과 또는 기대효과 작성',
    'risk-status': '리스크 보고서 기한 내 제출 40점 / 기한 외(해당 월 내) 제출 30점 / 미제출 0점',
    'supply-department': '분기별 시상 부서(매출액 기준)\n부서 1위 50점 / 2위 40점 / 3위 30점\n개인 1위 20점 / 2위 15점 / 3위 10점(시상자의 소속부서에 부여)',
    'reading-lee': '리뷰 1개(권)당 5점 가산(월 최대 30점)',
    'education-card': '제출한 교육의 학습시간 팀 평균 상위 순위: 1~5등 60점 / 6~10등 50점 / 11~15등 40점 / 16~20등 30점 / 21~25등 20점 / 26등 이하 10점 / 미제출 0점',
    'teamculture-count': '별도 제출 링크 등록. 1박 2일 워크샵 50점(월 1회) / 원데이 일정 5시간 이상 20점(월 2회)\n원데이 일정은 회당 5시간 이상이며 점심 회식은 제외',
    'academy-count': '바인아카데미 수료 개수당 20점(재수강 가능, 월 최대 팀 점수 60점) / 카네기 수료 시 점수 2배(40점)',
    'tft-status': 'TFT: 필로소피 내 TFT 항목(업무 1번)을 1명이 1회 이상 제출하면 30점 / 미제출 0점\n고객관리: 필로소피 내 고객관리 항목(고객 1번 또는 2번)을 1명이 1회 이상 제출하면 30점 / 미제출 0점',
    'social-score-input': '회사 주최 사회공헌 활동 참여자 소속팀 20점, 활동당 최다 인원 참여율 팀 10점 가산',
    'workshop-count': '별도 제출 링크 등록. 1박 2일 워크샵 50점(월 1회) / 원데이 일정 5시간 이상 20점(월 2회)\n원데이 일정은 회당 5시간 이상이며 점심 회식은 제외',
    'idea-lee': '제출 1개당 5점 가산(월 최대 50점)',
    'saving-award-rank': '분기별 시상 부서 ABC그룹: 1위 50점 / 2위 30점',
    'consulting-lee': '팀 평균 점수 상위 순위: 1~5등 100점 / 6~10등 80점 / 11~15등 60점 / 16~20등 40점 / 21~25등 20점 / 26등 이하 10점 / 미제출 0점'
  };
  let draft = clone(config);
  let initial = JSON.stringify(draft);
  const memberCache = clone(config.membersByTeam);
  function settingsMarkup() {
    return `<section id="settings-page" hidden><div class="settings-head"><span class="small">SEASON ${esc(season)} · 물류팀 설정</span><h1>설정</h1><p class="small">변경사항 저장은 이 브라우저에, 팀 공유 저장은 팀 공통 화면에 적용됩니다.</p><label>설정 시즌<select id="settings-season">${[...new Set(["04", season, ...Object.keys(localStorage).filter(key => key.startsWith("vine-settings-season-")).map(key => key.slice(-2))])].sort().map(value => `<option value="${esc(value)}" ${value === season ? "selected" : ""}>시즌 ${esc(value)}</option>`).join("")}</select></label><button id="create-next-season" type="button">다음 시즌 설정 만들기</button></div>
      <div class="settings-card"><h2>팀과 팀원</h2><label>우리 부서<select id="settings-team">${Object.keys(draft.departments).map(name => `<option value="${esc(name)}" ${name === draft.team ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label><div class="settings-grid settings-team-fields" id="settings-members">${draft.members.map((name, index) => `<label>팀원 ${index + 1}<input data-member="${index}" value="${esc(name)}" maxlength="30"></label>`).join('')}</div></div>
      <div class="settings-card"><h2>부서별 인원</h2><p class="small">팀 평균 학습시간과 순위 계산에 사용합니다.</p><div class="settings-grid">${Object.entries(draft.departments).map(([name, count]) => `<label>${esc(name)}<input type="number" min="1" max="999" data-department="${esc(name)}" value="${count}"></label>`).join('')}</div></div>
      <div class="settings-card"><h2>구글시트 연결</h2><p class="small">원본 시트는 읽기 전용입니다. 링크와 gid를 저장한 뒤 연결 상태를 확인할 수 있습니다.</p>${Object.entries(draft.sheets).map(([key, sheet]) => `<div class="settings-sheet"><strong>${esc(sheet.label)}</strong><label>구글시트 URL<input type="url" data-sheet-url="${key}" value="${esc(sheet.url)}"></label><label>탭 gid<input data-sheet-gid="${key}" value="${esc(sheet.gid)}"></label><button type="button" data-check-sheet="${key}">읽기 확인</button><a class="settings-sheet-link" data-sheet-link="${key}" href="${esc(sheetPageFrom(sheet.url, sheet.gid))}" target="_blank" rel="noopener noreferrer">↗ 바로가기</a><span class="small" id="sheet-status-${key}">${sheet.kind === 'reference' ? '기준표 · 현재 Excel 파일' : '확인 전'}</span></div>`).join('')}<h3 class="settings-subheading">바인컬처 제출 링크</h3><p class="small">기준표의 제출링크 열에서 중복 주소를 제외했습니다. 원본 제출처는 이 화면에서 수정하지 않습니다.</p>${Object.entries(draft.submissionLinks).map(([key, url]) => `<div class="settings-submission"><strong>${esc(submissionNames[key])}</strong><label>제출 URL<input type="url" data-submission-url="${key}" value="${esc(url)}"></label><a class="settings-sheet-link" data-submission-link="${key}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">↗ 바로가기</a></div>`).join('')}</div>
      <div class="settings-card"><h2>시즌 ${esc(season)} 배점</h2><p class="small">쉼표로 표시된 순위별 배점은 순서대로 입력합니다.</p><div class="settings-grid">${Object.entries(draft.scores).map(([key, value]) => `<label>${esc(scoreNames[key] || key)}<input data-score="${key}" inputmode="numeric" value="${esc(Array.isArray(value) ? value.join(', ') : value)}"></label>`).join('')}</div></div>
      <div class="settings-save"><span id="settings-message" role="status" class="small">변경사항이 없습니다.</span><button id="save-settings" type="button" disabled>변경사항 저장</button><button id="share-settings" type="button">팀 공유 저장</button></div></section>`;
  }
  function readDraft() {
    const next = clone(config);
    next.team = document.querySelector('#settings-team').value;
    next.members = [...document.querySelectorAll('[data-member]')].map(input => input.value.trim());
    next.membersByTeam = clone(memberCache);
    next.membersByTeam[next.team] = [...next.members];
    for (const input of document.querySelectorAll('[data-department]')) next.departments[input.dataset.department] = Number(input.value);
    for (const input of document.querySelectorAll('[data-sheet-url]')) next.sheets[input.dataset.sheetUrl].url = input.value.trim();
    for (const input of document.querySelectorAll('[data-sheet-gid]')) next.sheets[input.dataset.sheetGid].gid = input.value.trim();
    for (const input of document.querySelectorAll('[data-submission-url]')) next.submissionLinks[input.dataset.submissionUrl] = input.value.trim();
    for (const input of document.querySelectorAll('[data-score]')) {
      const key = input.dataset.score, value = input.value.trim();
      next.scores[key] = Array.isArray(defaults.scores[key]) ? value.split(',').map(part => Number(part.trim())) : Number(value);
    }
    return next;
  }
  function validate(next) {
    if (next.members.some(name => !name)) return '팀원 이름을 모두 입력해 주세요.';
    if (Object.values(next.departments).some(value => !Number.isInteger(value) || value < 1)) return '부서 인원은 1명 이상의 정수로 입력해 주세요.';
    if (next.members.length !== next.departments[next.team]) return '우리 부서 인원과 팀원 입력칸 수가 일치해야 합니다.';
    if (Object.values(next.sheets).some(sheet => !sheetId(sheet.url) || !/^\d+$/.test(sheet.gid))) return '시트 URL과 탭 gid를 확인해 주세요.';
    if (Object.values(next.submissionLinks).some(url => !/^https:\/\/\S+$/.test(url))) return '제출 링크는 https://로 시작하는 주소를 입력해 주세요.';
    if (Object.values(next.scores).some(value => Array.isArray(value) ? value.some(n => !Number.isFinite(n) || n < 0) : !Number.isFinite(value) || value < 0)) return '배점은 0 이상의 숫자로 입력해 주세요.';
    for (const key of Object.keys(defaults.scores)) if (Array.isArray(defaults.scores[key]) && next.scores[key].length !== defaults.scores[key].length) return '순위별 배점의 개수를 유지해 주세요.';
    return '';
  }
  function showSettings(show) {
    document.querySelector('#settings-page').hidden = !show;
    document.querySelector('#dashboard-page').hidden = show;
    document.querySelector('#settings-link').classList.toggle('active', show);
    location.hash = show ? 'settings' : 'dashboard';
    window.scrollTo(0, 0);
  }
  window.initVineSettings = function () {
    const main = document.querySelector('main'), content = document.createElement('div');
    content.id = 'dashboard-page';
    while (main.firstChild) content.appendChild(main.firstChild);
    main.appendChild(content);
    main.insertAdjacentHTML('beforeend', settingsMarkup());
    const nav = document.querySelector('aside nav');
    nav.insertAdjacentHTML('beforeend', '<a href="#settings" id="settings-link">⚙　설정</a>');
    let displayedTeam = config.team;
    const memberFields = document.querySelector('#settings-members');
    const rememberMembers = () => { memberCache[displayedTeam] = [...memberFields.querySelectorAll('[data-member]')].map(input => input.value); };
    function renderMembers(team) {
      const count = Number(document.querySelector(`[data-department="${CSS.escape(team)}"]`).value);
      const names = memberCache[team] || [];
      memberFields.innerHTML = Array.from({ length: Number.isInteger(count) && count > 0 ? Math.min(count, 999) : 0 }, (_, index) => `<label>팀원 ${index + 1}<input data-member="${index}" value="${esc(names[index] || `팀원 ${index + 1}`)}" maxlength="30"></label>`).join('');
      displayedTeam = team;
    }
    document.querySelector('#settings-team').addEventListener('change', event => { rememberMembers(); renderMembers(event.target.value); });
    document.querySelectorAll('[data-department]').forEach(input => input.addEventListener('input', () => {
      if (input.dataset.department !== displayedTeam) return;
      rememberMembers(); renderMembers(displayedTeam);
    }));
    document.querySelector('#settings-link').addEventListener('click', event => { event.preventDefault(); showSettings(true); });
    document.querySelectorAll('aside nav a:not(#settings-link)').forEach(link => link.addEventListener('click', () => { document.querySelector('#settings-page').hidden = true; document.querySelector('#dashboard-page').hidden = false; document.querySelector('#settings-link').classList.remove('active'); }));
    function updateDirtyState() {
      draft = readDraft();
      const error = validate(draft), dirty = JSON.stringify(draft) !== initial;
      document.querySelector('#save-settings').disabled = !dirty || !!error;
      document.querySelector('#settings-message').textContent = error || (dirty ? '저장되지 않은 변경사항이 있습니다.' : '변경사항이 없습니다.');
    }
    document.querySelector('#settings-page').addEventListener('input', updateDirtyState);
    document.querySelector('#settings-page').addEventListener('change', updateDirtyState);
    document.querySelectorAll('[data-sheet-url],[data-sheet-gid]').forEach(input => input.addEventListener('input', () => {
      const key = input.dataset.sheetUrl || input.dataset.sheetGid;
      const url = document.querySelector(`[data-sheet-url="${key}"]`).value.trim();
      const gid = document.querySelector(`[data-sheet-gid="${key}"]`).value.trim();
      const link = document.querySelector(`[data-sheet-link="${key}"]`);
      const page = sheetPageFrom(url, gid);
      if (page) { link.href = page; link.removeAttribute('aria-disabled'); }
      else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
    }));
    document.querySelectorAll('[data-submission-url]').forEach(input => input.addEventListener('input', () => {
      const link = document.querySelector(`[data-submission-link="${input.dataset.submissionUrl}"]`);
      const url = input.value.trim();
      if (/^https:\/\/\S+$/.test(url)) { link.href = url; link.removeAttribute('aria-disabled'); }
      else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
    }));
    document.querySelector('#settings-season').addEventListener('change', event => {
      if (JSON.stringify(readDraft()) !== initial && !confirm('저장하지 않은 변경사항을 버리고 시즌을 바꿀까요?')) { event.target.value = season; return; }
      localStorage.setItem('vine-active-season', event.target.value); location.reload();
    });
    document.querySelector('#create-next-season').addEventListener('click', () => {
      const next = String(Number(season) + 1).padStart(2, '0');
      const key = `vine-settings-season-${next}`;
      if (localStorage.getItem(key)) { document.querySelector('#settings-message').textContent = `시즌 ${next} 설정이 이미 있습니다.`; return; }
      if (!confirm(`현재 저장된 시즌 ${season} 설정을 복사해 시즌 ${next} 설정을 만들까요? 저장하지 않은 변경사항은 포함되지 않습니다.`)) return;
      const copy = clone(config); copy.season = next;
      localStorage.setItem(key, JSON.stringify(copy)); localStorage.setItem('vine-active-season', next); location.reload();
    });
    document.querySelector('#save-settings').addEventListener('click', () => {
      draft = readDraft(); const error = validate(draft);
      if (error) { document.querySelector('#settings-message').textContent = error; return; }
      try { localStorage.setItem(storageKey, JSON.stringify(draft)); location.hash = 'dashboard'; location.reload(); }
      catch { document.querySelector('#settings-message').textContent = '브라우저 저장에 실패했습니다.'; }
    });
    document.querySelector('#share-settings').addEventListener('click', async event => {
      draft = readDraft(); const error = validate(draft);
      const message = document.querySelector('#settings-message');
      if (error) { message.textContent = error; return; }
      event.target.disabled = true;
      message.textContent = '팀 공유 저장 중…';
      try {
        await vinePublishShared({ season, settings: draft });
        localStorage.setItem(storageKey, JSON.stringify(draft));
        message.textContent = '물류팀 설정을 팀과 공유했습니다.';
        setTimeout(() => location.reload(), 900);
      } catch (error) { message.textContent = error.message; event.target.disabled = false; }
    });
    document.querySelectorAll('[data-check-sheet]').forEach(button => button.addEventListener('click', async () => {
      const key = button.dataset.checkSheet, sheet = readDraft().sheets[key], status = document.querySelector('#sheet-status-' + key);
      if (key === 'criteria') { status.textContent = '기준표 XLSX · 이 화면에서는 직접 읽기 미지원'; return; }
      status.textContent = '읽는 중…';
      try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId(sheet.url)}/gviz/tq?tqx=out:csv&gid=${sheet.gid}`, { cache: 'no-store' });
        if (!response.ok) throw Error(String(response.status));
        const body = await response.text();
        if (!body.trim()) throw Error('빈 응답');
        const checkedAt = new Date().toLocaleString('ko-KR');
        status.textContent = `읽기 성공 · ${checkedAt}`;
        localStorage.setItem(`vine-sheet-read-${season}-${key}`, JSON.stringify({ url: sheet.url, gid: sheet.gid, checkedAt }));
      } catch {
        let previous;
        try { previous = JSON.parse(localStorage.getItem(`vine-sheet-read-${season}-${key}`) || 'null'); } catch {}
        status.textContent = previous && previous.url === sheet.url && previous.gid === sheet.gid
          ? `읽기 실패 · 마지막 성공 ${previous.checkedAt}` : '읽기 실패 · 확인된 값 없음';
      }
    }));
    for (const key of ['improvement', 'reading', 'education']) {
      let previous;
      try { previous = JSON.parse(localStorage.getItem(`vine-sheet-read-${season}-${key}`) || 'null'); } catch {}
      const failed = localStorage.getItem(`vine-sheet-error-${season}-${key}`) === '1';
      if (previous && previous.url === config.sheets[key].url && previous.gid === config.sheets[key].gid)
        document.querySelector('#sheet-status-' + key).textContent = `${failed ? '현재 읽기 실패 · ' : ''}마지막 성공 ${previous.checkedAt}`;
      else if (failed) document.querySelector('#sheet-status-' + key).textContent = '읽기 실패 · 확인된 값 없음';
    }
    document.querySelector('header h1').textContent = `${config.team} 오사카 프로젝트`;
    document.querySelector('aside > .small').textContent = `${config.team} 목표 대시보드`;
    document.querySelector('.season b').textContent = `SEASON ${season}`;
    const suffixes = ['lee', 'song', 'cho'];
    for (let i = 0; i < 3; i++) {
      for (const kind of ['reading', 'idea', 'consulting', 'consulting-top']) {
        const label = document.querySelector(`label[for="${kind}-${suffixes[i]}"]`);
        if (label) label.textContent = config.members[i];
      }
    }
    document.querySelectorAll('#dashboard-page .input-field').forEach(field => {
      const ids = [...field.querySelectorAll('select,input')].map(control => control.id);
      const key = ids.includes('improvement-count') ? 'improvement' : ids.some(id => id.startsWith('reading-')) ? 'reading' : field.classList.contains('education-card') ? 'education' : 'criteria';
      const url = vineSheetPageUrl(key);
      if (!url) return;
      const link = document.createElement('a');
      link.className = 'sheet-shortcut';
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = '↗';
      link.title = `${config.sheets[key].label} 시트 열기`;
      link.setAttribute('aria-label', link.title);
      const notes = [...field.children].filter(element => element.classList?.contains('note'));
      const note = notes.at(-1);
      if (note) note.classList.add('has-sheet-shortcut');
      (note || field).appendChild(link);
      const criteriaKey = field.classList.contains('education-card') ? 'education-card' : ids.some(id => id.startsWith('consulting-')) ? 'consulting-lee' : ids.find(id => criteriaNotes[id]);
      if (!criteriaKey) return;
      const title = field.querySelector(':scope > label,:scope > b');
      if (!title) return;
      const info = document.createElement('button');
      info.type = 'button';
      info.className = 'criteria-info-button';
      info.textContent = 'i';
      info.title = '점수 부여기준 보기';
      info.setAttribute('aria-label', `${title.textContent.trim()} 점수 부여기준 보기`);
      info.setAttribute('aria-expanded', 'false');
      title.appendChild(info);
      const memo = document.createElement('div');
      memo.className = 'criteria-memo';
      memo.hidden = true;
      const heading = document.createElement('strong');
      heading.textContent = '점수 부여기준';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'criteria-memo-close';
      close.textContent = '×';
      close.setAttribute('aria-label', '점수 부여기준 닫기');
      const body = document.createElement('p');
      body.textContent = config.sheets.criteria.url === defaults.sheets.criteria.url && config.sheets.criteria.gid === defaults.sheets.criteria.gid
        ? criteriaNotes[criteriaKey]
        : '설정한 기준표의 점수 부여기준을 확인할 수 없습니다.';
      memo.append(heading, close, body);
      field.appendChild(memo);
      info.addEventListener('click', event => {
        event.preventDefault(); event.stopPropagation();
        document.querySelectorAll('.criteria-memo:not([hidden])').forEach(other => { other.hidden = true; other.parentElement.classList.remove('is-info-open'); other.parentElement.querySelector('.criteria-info-button')?.setAttribute('aria-expanded', 'false'); });
        memo.hidden = false; field.classList.add('is-info-open'); info.setAttribute('aria-expanded', 'true');
      });
      close.addEventListener('click', () => { memo.hidden = true; field.classList.remove('is-info-open'); info.setAttribute('aria-expanded', 'false'); info.focus(); });
    });
    document.addEventListener('click', event => {
      if (event.target.closest('.criteria-memo,.criteria-info-button')) return;
      document.querySelectorAll('.criteria-memo:not([hidden])').forEach(memo => {
        memo.hidden = true;
        memo.parentElement.classList.remove('is-info-open');
        memo.parentElement.querySelector('.criteria-info-button')?.setAttribute('aria-expanded', 'false');
      });
    });
    applyScoreLabels();
    updateAttendance(false);
    const sources = document.querySelector('#sources');
    for (const [key, label] of [['improvement','개선'],['reading','독서경영'],['education','교육보고서']]) {
      const link = [...sources.querySelectorAll('a')].find(a => a.textContent.includes(label));
      if (link) link.href = config.sheets[key].url;
    }
    if (config.team !== '물류팀') {
      document.querySelector('#dashboard-page').insertAdjacentHTML('afterbegin', `<div class="settings-notice">${esc(config.team)}의 실적 시트가 연결되지 않았습니다. 설정에서 시트를 지정해 주세요.</div>`);
      document.querySelectorAll('#dashboard-page > :not(header):not(.settings-notice)').forEach(element => element.hidden = true);
    }
    if (location.hash === '#settings') showSettings(true);
  };
  function applyScoreLabels() {
    const s = config.scores, byId = id => document.getElementById(id);
    const requiredMax = s.ceoFull+s.speakerFull+s.checkinOnTime*3+s.improvementTwoPlus+s.riskOnTime+s.educationRanks[0]+s.readingCap+s.tft+s.customer+s.oneDayCap;
    const extraMax = 280+(s.academyCap-60)+(s.teamCultureCap-70)+(s.supplyDepartment[0]-50)+(s.supplyPersonal[0]-20)+(s.ideaCap-50)+(s.socialTop-30)+(s.teamEducation-60);
    window.vineTotalMax = requiredMax + extraMax;
    const required = byId('required-score').parentElement;
    required.lastChild.textContent = ` / ${requiredMax}점`;
    byId('known-score').parentElement.lastChild.textContent = ` / ${extraMax}점`;
    byId('required-section-max').textContent = requiredMax;
    byId('extra-section-max').textContent = extraMax;
    document.querySelector('.hero-number small').textContent = `/ ${requiredMax+extraMax}점`;
    const dividers = document.querySelectorAll('.input-divider .small');
    if (dividers[0]) dividers[0].textContent = `현재 표시된 카드 합계 · ${requiredMax}점`;
    const scores = {
      'ceo-attendees':s.ceoFull,'speaker-attendees':s.speakerFull,'task-status':s.checkinOnTime,
      'performance-status':s.checkinOnTime,'saving-status':s.checkinOnTime,'risk-status':s.riskOnTime,
      'improvement-count':s.improvementTwoPlus,'academy-count':s.academyCap,'supply-department':s.supplyDepartment[0]+s.supplyPersonal[0],
      'tft-status':s.tft+s.customer,'teamculture-count':s.oneDayCap,'workshop-count':s.workshop,
      'social-score-input':s.socialTop,'idea-lee':s.ideaCap,'reading-lee':s.readingCap,
      'saving-award-rank':s.savingAwardRanks[0]
    };
    for (const [id,max] of Object.entries(scores)) {
      const field = byId(id)?.closest('.input-field');
      const badge = field?.querySelector('.card-score');
      if (badge) badge.textContent = (badge.textContent.split('/')[0].trim() || '—')+` / ${max}점`;
    }
  }
})();
