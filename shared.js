(function () {
  const api = 'https://vine-logistics-state.lds1202.chatgpt.site/state';
  const revisionKey = 'vine-shared-revision';
  const reloadKey = 'vine-shared-reload';
  const performanceKey = /^vine-(month-snapshot-|active-month-|attendance|risk|policy-|consulting-|academy|supply-|improvement|reading-|tft|customer|social|idea-|teamculture|workshop|saving-award)/;

  window.vineSharedReady = fetch(`${api}?t=${Date.now()}`, { cache: 'no-store' }).then(async response => {
    if (!response.ok) throw Error(`공유 실적 읽기 실패 (${response.status})`);
    const data = await response.json();
    if (data.team !== '물류팀') throw Error('공유 실적의 부서가 물류팀이 아닙니다.');
    const revision = data.updatedAt || 'empty';
    if (sessionStorage.getItem(reloadKey) === revision) {
      sessionStorage.removeItem(reloadKey);
      return;
    }
    const selectedSeason = localStorage.getItem('vine-active-season') || '04';
    const selectedMonth = localStorage.getItem(`vine-active-month-${selectedSeason}`) || '2026-11';
    for (const key of Object.keys(localStorage)) {
      if (performanceKey.test(key)) localStorage.removeItem(key);
    }
    for (const [season, record] of Object.entries(data.seasons || {})) {
      for (const [month, snapshot] of Object.entries(record.months || {}))
        localStorage.setItem(`vine-month-snapshot-${season}-${month}`, JSON.stringify(snapshot));
    }
    localStorage.setItem('vine-active-season', selectedSeason);
    localStorage.setItem(`vine-active-month-${selectedSeason}`, selectedMonth);
    localStorage.setItem(revisionKey, revision);
    sessionStorage.setItem(reloadKey, revision);
    location.reload();
  }).catch(error => {
    window.vineSharedError = error.message;
    console.warn(error.message);
    document.dispatchEvent(new Event('vine-shared-error'));
  });

  window.vinePublishShared = async function ({ season, month, snapshot }) {
    if (!season || !month || !snapshot) throw Error('저장할 월별 실적이 없습니다.');
    await window.vineSharedReady;
    if (window.vineSharedError) throw Error('공유 실적을 불러오지 못해 저장을 중단했습니다.');
    const response = await fetch(api, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ season, month, snapshot })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(`공유 저장 실패 (${response.status})${result.error ? `: ${result.error}` : ''}`);
    localStorage.setItem(revisionKey, 'pending');
    return result;
  };
})();
