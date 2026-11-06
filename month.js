(function () {
  const initial = '2026-10';
  const activeKey = `vine-active-month-${vineConfig.season}`;
  const active = localStorage.getItem(activeKey) || initial;
  window.vineMonth = /^20\d\d-(0[1-9]|1[0-2])$/.test(active) ? active : initial;
  window.vineMonthLabel = month => `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`;
  window.vineMonthIsClosed = month => Boolean(localStorage.getItem(`vine-month-snapshot-${vineConfig.season}-${month}`));
  window.initVineMonth = function () {
    const snapshotKey = `vine-month-snapshot-${vineConfig.season}-${vineMonth}`;
    const selector = document.querySelector('select[aria-label="조회 월"]');
    const months = ['2026-10', '2026-11', ...Object.keys(localStorage).filter(key => key.startsWith(`vine-month-snapshot-${vineConfig.season}-`)).map(key => key.slice(-7))];
    if (!months.includes(vineMonth)) months.push(vineMonth);
    selector.innerHTML = [...new Set(months)].sort().map(month => `<option value="${month}" ${month === vineMonth ? 'selected' : ''}>${vineMonthLabel(month)}</option>`).join('');
    const note = document.createElement('span');
    note.className = 'small month-state';
    selector.parentElement.appendChild(note);
    if (vineMonth === initial && !vineMonthIsClosed(initial)) {
      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'month-next';
      nextButton.textContent = '10월 저장하고 11월 시작';
      selector.parentElement.appendChild(nextButton);
      nextButton.addEventListener('click', () => { selector.value = '2026-11'; selector.dispatchEvent(new Event('change')); });
    }
    let savedSnapshot = vineMonthIsClosed(vineMonth) ? JSON.parse(localStorage.getItem(snapshotKey)) : null;
    if (savedSnapshot) {
      const snapshot = savedSnapshot;
      for (const [id, value] of Object.entries(snapshot.inputs || {})) {
        const control = document.getElementById(id);
        if (control) control.value = value;
      }
      for (const id of ['lee', 'song', 'cho']) {
        const lower = document.getElementById(`consulting-${id}`), upper = document.getElementById(`consulting-top-${id}`);
        if (lower && upper) upper.value = lower.value;
      }
      if (typeof updateConsulting === 'function') updateConsulting();
      if (typeof updateAttendance === 'function') updateAttendance(false);
      if (typeof refreshInputBackgrounds === 'function') refreshInputBackgrounds();
      for (const [id, value] of [['required-score', snapshot.scores?.required], ['known-score', snapshot.scores?.additional], ['total-score', snapshot.scores?.total]])
        if (value !== undefined) document.getElementById(id).textContent = value;
      if (snapshot.scores?.total !== undefined && typeof updateHeroProgress === 'function') updateHeroProgress(snapshot.scores.total);
      note.textContent = `마지막 저장 ${snapshot.savedAt} · 수정 후 저장 가능`;
    } else note.textContent = `${vineMonthLabel(vineMonth)} 입력 중 · 이 브라우저에 자동 저장`;
    if (vineMonth !== initial) {
      document.querySelector('#study .category-cards').hidden = true;
      document.querySelector('#policy .category-cards').hidden = true;
      document.querySelector('#learning').parentElement.hidden = true;
      const educationRow = document.querySelector('#study tbody tr');
      if (educationRow) { educationRow.children[2].textContent = '월별 자료 미연결'; educationRow.children[3].textContent = '—'; }
      document.querySelector('.education-card .education-metrics').hidden = true;
      document.querySelector('.education-card .note').textContent = '이 달의 교육보고서 실적은 아직 연결되지 않았습니다.';
      document.querySelector('#sources').firstChild.textContent = `${vineMonthLabel(vineMonth)} 화면 · 시트 연결 상태는 설정에서 확인하세요.`;
      document.querySelectorAll('#dashboard-page .note').forEach(element => {
        if (element.textContent.includes('10월 시트 각 2건')) element.textContent = '선택한 월의 시트에서 독서리뷰를 확인합니다. 읽기 실패 시 직접 입력할 수 있습니다.';
      });
    }
    const controls = [...document.querySelectorAll('#dashboard-page .input-field select,#dashboard-page .input-field input')].filter(control => control.id);
    const collectInputs = () => Object.fromEntries(controls.map(control => [control.id, control.value]));
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'month-save';
    saveButton.textContent = '변경사항 저장';
    selector.parentElement.appendChild(saveButton);
    const collectScores = () => ({ required: document.querySelector('#required-score').textContent, additional: document.querySelector('#known-score').textContent, total: document.querySelector('#total-score').textContent });
    const isDirty = () => !savedSnapshot || JSON.stringify(collectInputs()) !== JSON.stringify(savedSnapshot.inputs || {}) || JSON.stringify(collectScores()) !== JSON.stringify(savedSnapshot.scores || {});
    const updateSave = () => { saveButton.disabled = !isDirty(); };
    controls.forEach(control => { control.addEventListener('change', updateSave); control.addEventListener('input', updateSave); });
    document.addEventListener('vine-sheets-updated', updateSave);
    document.querySelectorAll('#dashboard-page .field-reset').forEach(button => button.addEventListener('click', updateSave));
    updateSave();
    const saveMonth = () => {
      if (typeof updateAttendance === 'function') updateAttendance(false);
      const snapshot = { inputs: collectInputs(), scores: collectScores(), savedAt: new Date().toLocaleString('ko-KR'), sources: Object.fromEntries(Object.entries(vineConfig.sheets).map(([key, sheet]) => [key, { url: sheet.url, gid: sheet.gid }])), scoring: JSON.parse(JSON.stringify(vineConfig.scores)), departments: JSON.parse(JSON.stringify(vineConfig.departments)) };
      localStorage.setItem(snapshotKey, JSON.stringify(snapshot));
      savedSnapshot = snapshot;
      note.textContent = `마지막 저장 ${snapshot.savedAt} · 수정 후 저장 가능`;
      saveButton.disabled = true;
      return snapshot;
    };
    saveButton.addEventListener('click', saveMonth);
    const shareButton = document.createElement('button');
    shareButton.type = 'button';
    shareButton.className = 'month-save';
    shareButton.textContent = 'GitHub에 공유 저장';
    saveButton.after(shareButton);
    shareButton.addEventListener('click', async () => {
      const snapshot = saveMonth();
      shareButton.disabled = true;
      note.textContent = 'GitHub에 저장 중…';
      try {
        await vinePublishShared({ season: vineConfig.season, settings: vineConfig, month: vineMonth, snapshot });
        note.textContent = `${vineMonthLabel(vineMonth)} GitHub 공유 저장 완료 · 다른 사람에게도 표시됩니다.`;
      } catch (error) {
        note.textContent = `${error.message} · 이 브라우저에는 저장되었습니다.`;
      } finally { shareButton.disabled = false; }
    });
    selector.addEventListener('change', () => {
      const next = selector.value;
      if (vineMonth === initial && next !== initial && !vineMonthIsClosed(initial)) {
        saveMonth();
      } else if (isDirty() && !confirm(`${vineMonthLabel(vineMonth)}의 저장하지 않은 변경사항을 버리고 이동할까요?`)) {
        selector.value = vineMonth;
        return;
      }
      localStorage.setItem(activeKey, next);
      location.reload();
    });
  };
})();
