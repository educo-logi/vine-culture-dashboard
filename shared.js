(function () {
  const api = 'https://api.github.com/repos/educo-logi/vine-culture-dashboard/contents/team-data.json';
  const revisionKey = 'vine-shared-revision';
  const tokenKey = 'vine-github-token';
  const decode = content => new TextDecoder().decode(Uint8Array.from(atob(content.replace(/\s/g, '')), char => char.charCodeAt(0)));
  const encode = content => {
    const bytes = new TextEncoder().encode(content);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 8192)
      binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
    return btoa(binary);
  };
  async function read(token) {
    const response = await fetch(`${api}?ref=main&t=${Date.now()}`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } : { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw Error(`GitHub 읽기 실패 (${response.status})`);
    const file = await response.json();
    return { sha: file.sha, data: JSON.parse(decode(file.content)) };
  }
  window.vineSharedReady = read().then(({ sha, data }) => {
    if (data.team !== '물류팀' || localStorage.getItem(revisionKey) === sha) return;
    for (const [season, record] of Object.entries(data.seasons || {})) {
      if (record.settings?.team === '물류팀')
        localStorage.setItem(`vine-settings-season-${season}`, JSON.stringify(record.settings));
      for (const [month, snapshot] of Object.entries(record.months || {}))
        localStorage.setItem(`vine-month-snapshot-${season}-${month}`, JSON.stringify(snapshot));
    }
    if (data.activeSeason) localStorage.setItem('vine-active-season', data.activeSeason);
    const current = data.seasons?.[data.activeSeason];
    if (current?.activeMonth) localStorage.setItem(`vine-active-month-${data.activeSeason}`, current.activeMonth);
    localStorage.setItem(revisionKey, sha);
    location.reload();
  }).catch(error => { console.warn(error.message); });

  window.vinePublishShared = async function ({ season, settings, month, snapshot }) {
    if (settings?.team !== '물류팀') throw Error('현재는 물류팀 설정만 GitHub에 저장할 수 있습니다.');
    let token = sessionStorage.getItem(tokenKey);
    if (!token) {
      token = prompt('GitHub 저장용 토큰을 입력하세요. 이 토큰은 현재 브라우저 탭에서만 사용하며 저장소에 공개되지 않습니다.');
      if (!token) throw Error('GitHub 저장을 취소했습니다.');
      token = token.trim();
    }
    const { sha, data } = await read(token);
    if (data.team !== '물류팀') throw Error('GitHub 공유 데이터의 부서가 물류팀이 아닙니다.');
    data.seasons ||= {};
    const record = data.seasons[season] ||= { months: {} };
    record.settings = settings;
    record.months ||= {};
    if (month && snapshot) { record.months[month] = snapshot; record.activeMonth = month; }
    data.activeSeason = season;
    data.updatedAt = new Date().toISOString();
    const response = await fetch(api, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Update logistics ${season}${month ? ` ${month}` : ' settings'}`, content: encode(JSON.stringify(data, null, 2) + '\n'), sha, branch: 'main' })
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw Error(`GitHub 저장 실패 (${response.status})${result.message ? `: ${result.message}` : ''}`);
    }
    const result = await response.json();
    sessionStorage.setItem(tokenKey, token);
    localStorage.setItem(revisionKey, result.content.sha);
    return result;
  };
})();
