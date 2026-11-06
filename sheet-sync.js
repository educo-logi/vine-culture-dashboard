(function () {
  const month = vineMonth;
  const monthDigits = month.replace('-', '');
  const team = vineConfig.team;
  const sheetStatus = (key, message) => {
    let line = document.getElementById(`source-${key}`);
    if (!line) {
      line = document.createElement('span');
      line.id = `source-${key}`;
      line.className = 'note sheet-source-status';
      const anchor = key === 'education' ? document.querySelector('.education-card') : key === 'reading' ? document.querySelector('#reading-lee').closest('.input-field') : document.querySelector('#improvement-count').closest('.input-field');
      anchor.appendChild(line);
    }
    line.textContent = message;
    document.dispatchEvent(new Event('vine-sheets-updated'));
  };
  const valid = value => String(value || '').trim();
  const matchMonth = value => {
    const date = valid(value);
    const digits = date.replace(/[^0-9]/g, '');
    const shortMonth = month.slice(2).replace('-', '');
    const monthOnly = String(Number(month.slice(5)));
    return digits.startsWith(monthDigits) || digits.startsWith(shortMonth) ||
      new RegExp(`^${monthOnly}(?:[.\\-/월]|$)`).test(date);
  };
  const canonical = name => vineConfig.aliases[valid(name)] || valid(name);
  async function rowsFor(key) {
    const response = await fetch(vineSheetUrl(key, month), { cache: 'no-store' });
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    const csv = await response.text();
    if (!csv || /<!doctype|<html|google\.visualization\.Query\.setResponse/i.test(csv.slice(0, 300))) throw Error('CSV가 아닙니다');
    const rows = parseCsv(csv);
    if (!rows.length) throw Error('빈 시트');
    return rows;
  }
  async function reading() {
    try {
      const rows = await rowsFor('reading');
      if (!rows.some(row => valid(row[0]) === '제출월' && valid(row[1]) === '부서')) throw Error('열 구조 불일치');
      const counts = Object.fromEntries(vineConfig.members.map(name => [name, 0]));
      for (const row of rows) if (matchMonth(row[0]) && canonical(row[1]) === team && Object.hasOwn(counts, valid(row[2])) && valid(row[7]) && valid(row[8])) counts[valid(row[2])]++;
      ['lee', 'song', 'cho'].forEach((id, index) => { const input = document.getElementById(`reading-${id}`); input.value = String(Math.min(2, counts[vineConfig.members[index]])); input.dispatchEvent(new Event('change')); });
      updateAttendance(false); refreshInputBackgrounds();
      sheetStatus('reading', `${vineMonthLabel(month)} 시트 참조 · 리뷰 ${Object.values(counts).reduce((a, b) => a + b, 0)}건`);
    } catch { sheetStatus('reading', '참조 못함 · 독서경영 시트와 해당 월 탭을 확인하세요.'); }
  }
  async function improvement() {
    try {
      const rows = await rowsFor('improvement');
      if (!rows.some(row => row.some(cell => vineConfig.members.includes(valid(cell))))) throw Error('팀원 영역 없음');
      const counts = Object.fromEntries(vineConfig.members.map(name => [name, 0]));
      let person = '';
      for (const row of rows) {
        const header = row.map(valid).find(value => vineConfig.members.includes(value));
        if (header) { person = header; continue; }
        if (!person || !/^\d+$/.test(valid(row[0]))) continue;
        if ([2, 4, 6, 8].every(index => valid(row[index]) && !/^[/\.\s]*(개선전|개선후|결과)?\s*[:：]?\s*$/.test(valid(row[index])))) counts[person]++;
      }
      const participants = Object.values(counts).filter(count => count > 0).length;
      const input = document.getElementById('improvement-count');
      input.value = String(Math.min(3, participants)); input.dispatchEvent(new Event('change'));
      document.getElementById('improvement-summary').textContent = `${participants}명 참여 · 작성 완료 ${Object.values(counts).reduce((a, b) => a + b, 0)}건`;
      sheetStatus('improvement', `${vineMonthLabel(month)} 시트 참조 · ${participants}명 참여`);
    } catch { sheetStatus('improvement', '참조 못함 · 개선 시트와 해당 월 탭을 확인하세요.'); }
  }
  async function education() {
    try {
      const rows = await rowsFor('education');
      if (!rows.some(row => valid(row[0]) === '부서' && valid(row[1]) === '이름')) throw Error('열 구조 불일치');
      const totals = new Map();
      for (const row of rows) {
        if (!matchMonth(row[3])) continue;
        const dept = canonical(row[0]), minutes = Number(valid(row[4]).replace(/,/g, ''));
        if (!dept || !Number.isFinite(minutes) || minutes <= 0) continue;
        totals.set(dept, (totals.get(dept) || 0) + minutes);
      }
      const ranked = [...totals].filter(([dept]) => vineConfig.departments[dept]).map(([dept, total]) => ({ dept, total, average: total / vineConfig.departments[dept] })).sort((a, b) => b.average - a.average);
      const ours = ranked.find(row => row.dept === team);
      if (!ours) throw Error('우리 팀 실적 없음');
      const rank = 1 + ranked.filter(row => row.average > ours.average).length;
      const score = vineConfig.scores.educationRanks[Math.min(vineConfig.scores.educationRanks.length - 1, rank <= 5 ? 0 : rank <= 9 ? 1 : 2)];
      window.vineEducationScore = score;
      const card = document.querySelector('.education-card');
      card.querySelector('.education-metrics').hidden = false;
      const metrics = card.querySelectorAll('.education-metrics b');
      metrics[0].textContent = `${ours.total}분`; metrics[1].textContent = `${Math.round(ours.average)}분`; metrics[2].textContent = `상위 ${Math.ceil(rank / ranked.length * 100)}%`;
      card.querySelectorAll('.education-metrics small')[2].textContent = `${ranked.length}개 부서 중 ${rank}위`;
      card.querySelector('.card-score').textContent = `${score} / ${vineConfig.scores.educationRanks[0]}점`;
      card.querySelector('.note').textContent = `팀 평균 학습시간 순위 기준 · 예상 ${score}점`;
      const tableRow = document.querySelector('#study tbody tr');
      tableRow.children[2].textContent = `평균 ${Math.round(ours.average)}분 · ${rank}위`;
      tableRow.children[3].textContent = `${score}점`;
      document.querySelector('#learning').parentElement.hidden = false;
      document.querySelector('#learning').parentElement.querySelector(':scope > .card:nth-child(2)').hidden = true;
      document.querySelector('#ranking').innerHTML = ranked.slice(0, 6).map(row => { const place = 1 + ranked.filter(other => other.average > row.average).length; const points = vineConfig.scores.educationRanks[Math.min(vineConfig.scores.educationRanks.length - 1, place <= 5 ? 0 : place <= 9 ? 1 : 2)]; return `<tr class="${row.dept === team ? 'ours' : ''}"><td>${place}</td><td>${row.dept}</td><td>${row.average.toFixed(2)}</td><td>${points}점</td></tr>`; }).join('');
      updateAttendance(false);
      sheetStatus('education', `${vineMonthLabel(month)} 시트 참조 · ${rank}위`);
    } catch (error) {
      window.vineEducationScore = 0;
      const card = document.querySelector('.education-card');
      card.querySelector('.education-metrics').hidden = true;
      card.querySelector('.card-score').textContent = `— / ${vineConfig.scores.educationRanks[0]}점`;
      card.querySelector('.note').textContent = '참조 못함';
      document.querySelector('#study tbody tr').children[2].textContent = '참조 못함';
      document.querySelector('#study tbody tr').children[3].textContent = '—';
      updateAttendance(false);
      sheetStatus('education', `참조 못함 · ${error.message || '교육보고서 시트와 해당 월 탭을 확인하세요.'}`);
    }
  }
  window.syncVineSheets = function () {
    if (vineMonthIsClosed(month) || team !== '물류팀') return;
    reading(); improvement(); education();
  };
})();
