/* ============================================================
   Tamil Nilam NISD & ISD Automation Controller
   ============================================================ */
(function() {
  if (window.__tnAutoInitialized) return;
  window.__tnAutoInitialized = true;

  let currentReportData = null;
  let currentMode = 'details';

  const TN_DISTRICTS = [
    { code: "37", name: "Ranipet (37)" },
    { code: "04", name: "Vellore (04)" },
    { code: "36", name: "Tirupathur (36)" },
    { code: "03", name: "Kancheepuram (03)" },
    { code: "01", name: "Tiruvallur (01)" },
    { code: "35", name: "Chengalpattu (35)" },
    { code: "02", name: "Chennai (02)" },
    { code: "06", name: "Tiruvannamalai (06)" },
    { code: "07", name: "Viluppuram (07)" },
    { code: "33", name: "Kallakurichi (33)" },
    { code: "08", name: "Salem (08)" },
    { code: "10", name: "Erode (10)" },
    { code: "12", name: "Coimbatore (12)" },
    { code: "32", name: "Tiruppur (32)" },
    { code: "05", name: "Dharmapuri (05)" },
    { code: "31", name: "Krishnagiri (31)" },
    { code: "09", name: "Namakkal (09)" },
    { code: "14", name: "Karur (14)" },
    { code: "13", name: "Dindigul (13)" },
    { code: "15", name: "Tiruchirappalli (15)" },
    { code: "16", name: "Perambalur (16)" },
    { code: "17", name: "Ariyalur (17)" },
    { code: "18", name: "Cuddalore (18)" },
    { code: "19", name: "Nagapattinam (19)" },
    { code: "38", name: "Mayiladuthurai (38)" },
    { code: "20", name: "Thiruvarur (20)" },
    { code: "21", name: "Thanjavur (21)" },
    { code: "22", name: "Pudukkottai (22)" },
    { code: "23", name: "Sivagangai (23)" },
    { code: "24", name: "Madurai (24)" },
    { code: "25", name: "Theni (25)" },
    { code: "26", name: "Virudhunagar (26)" },
    { code: "27", name: "Ramanathapuram (27)" },
    { code: "34", name: "Tenkasi (34)" },
    { code: "28", name: "Thoothukkudi (28)" },
    { code: "29", name: "Tirunelveli (29)" },
    { code: "30", name: "Kanniyakumari (30)" },
    { code: "11", name: "The Nilgiris (11)" }
  ];

  const INITIAL_RANIPET_TALUKS = [
    { code: "12", name: "Nemili (12)" },
    { code: "03", name: "Arakkonam (03)" },
    { code: "02", name: "Arcot (02)" },
    { code: "13", name: "Kalavai (13)" },
    { code: "14", name: "Sholinghur (14)" },
    { code: "04", name: "Walajah (04)" }
  ];

  const NEMILI_VILLAGES = [
    { code: "", name: "-- ALL VILLAGES (Combined) --" },
    { code: "109", name: "Agavalam (109)" },
    { code: "108", name: "Alappakkam (108)" },
    { code: "115", name: "Attupakkam (115)" },
    { code: "110", name: "Banavaram (110)" },
    { code: "111", name: "Illuppaiyandandalam (111)" },
    { code: "121", name: "Asanellikuppam (121)" },
    { code: "123", name: "Kariakudal (123)" },
    { code: "124", name: "Keelvenkatapuram (124)" },
    { code: "122", name: "Nemili (122)" },
    { code: "125", name: "Sayanavaram (125)" },
    { code: "120", name: "S.Kulathur (120)" },
    { code: "112", name: "Thenmambakkam (112)" }
  ];

  const talukCache = new Map();
  const villageCache = new Map();

  talukCache.set("37", INITIAL_RANIPET_TALUKS);
  villageCache.set("37_12", NEMILI_VILLAGES);

  function createModalHtml() {
    const distOptions = TN_DISTRICTS.map(d =>
      `<option value="${d.code}" ${d.code === '37' ? 'selected' : ''}>${d.name}</option>`
    ).join('');

    const talukOptions = INITIAL_RANIPET_TALUKS.map(t =>
      `<option value="${t.code}" ${t.code === '12' ? 'selected' : ''}>${t.name}</option>`
    ).join('');

    const villageOptions = NEMILI_VILLAGES.map(v =>
      `<option value="${v.code}">${v.name}</option>`
    ).join('');

    return `
      <div id="tnModalBackdrop" class="tn-modal-backdrop">
        <div class="tn-modal">
          <div class="tn-modal-header">
            <h2>
              <span>🏛️ Tamil Nilam OPT Applications Pending</span>
              <span class="tn-badge">Automated Report</span>
            </h2>
            <button type="button" class="iconbtn" id="tnCloseModal" title="Close">&#10005;</button>
          </div>

          <div class="tn-modal-body">
            <div class="tn-filter-box">
              <div class="tn-filter-title">VILLAGE WISE OPT APPLICATIONS PENDING REPORT</div>
              
              <div class="tn-form-grid">
                <div class="tn-radio-group">
                  <label><input type="radio" name="tnOptType" id="tnRadioNisd" value="N" checked> NISD</label>
                  <label><input type="radio" name="tnOptType" id="tnRadioIsd" value="I"> ISD</label>
                </div>

                <div class="tn-field">
                  <label for="tnDistSel">District</label>
                  <select id="tnDistSel">
                    ${distOptions}
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnTalukSel">Taluk</label>
                  <select id="tnTalukSel">
                    ${talukOptions}
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnVillageSel">Village</label>
                  <select id="tnVillageSel">
                    ${villageOptions}
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnViewMode">Report Format</label>
                  <select id="tnViewMode">
                    <option value="details" selected>Detailed Applications (as in Image)</option>
                    <option value="summary">Village Summary (VAO/Firka counts)</option>
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnFromDate">From Date</label>
                  <input type="text" id="tnFromDate" placeholder="DD-MM-YYYY or YYYY-MM-DD" value="31-08-2026">
                  <div class="tn-quick-dates" id="tnQuickDatesContainer">
                    <button type="button" class="tn-quick-btn" data-range="12">12 Days</button>
                    <button type="button" class="tn-quick-btn" data-range="10">10 Days</button>
                    <button type="button" class="tn-quick-btn" data-range="below10">&lt;10 Days</button>
                  </div>
                </div>

                <div class="tn-field">
                  <label for="tnToDate">To Date</label>
                  <input type="text" id="tnToDate" placeholder="DD-MM-YYYY or YYYY-MM-DD" value="10-09-2026">
                </div>
              </div>

              <div class="tn-btn-bar">
                <button type="button" class="tn-btn-submit" id="tnBtnSubmit">Submit</button>
                <button type="button" class="tn-btn-excel" id="tnBtnExcel" style="display:none">ExportToExcel</button>
                <div id="tnApplyWrap" style="display:none; align-items:center; gap:10px;">
                  <span id="tnBucketSummary" class="tn-bucket-tag" style="display:none;"></span>
                  <button type="button" class="tn-btn-apply" id="tnBtnApply">⚡ Auto-Load All into Dashboard (12d / 10d / &lt;10d)</button>
                </div>
              </div>
            </div>

            <div id="tnStatusBanner" class="tn-status-banner"></div>

            <div id="tnReportArea" style="display:none">
              <div class="tn-table-wrap" id="tnTableWrap"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function injectUI() {
    if (!document.getElementById('tnModalBackdrop')) {
      document.body.insertAdjacentHTML('beforeend', createModalHtml());
    }

    const uploadsGrid = document.querySelector('.uploads');
    if (uploadsGrid && !document.getElementById('tnAutoTriggerBtn')) {
      const btnHtml = `
        <div style="grid-column: 1 / -1; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; background: var(--surface-2); padding: 10px 14px; border-radius: 9px; border: 1px solid var(--line-2);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">⚡</span>
            <div>
              <b style="font-size: 13px;">Automate NISD / ISD Data</b>
              <span style="font-size: 11.5px; color: var(--muted); margin-left: 6px;">Pull directly from Tamil Nilam portal with automatic Supabase Cloud replacement (NISD: VAO-only 12d/10d/&lt;10d | ISD: Surveyor & VAO 30d+/25-29d/&lt;25d)</span>
            </div>
          </div>
          <button type="button" class="tn-auto-btn" id="tnAutoTriggerBtn">⚡ Auto-Pull from Tamil Nilam</button>
        </div>
      `;
      uploadsGrid.insertAdjacentHTML('beforebegin', btnHtml);
    }

    const nisdActions = document.getElementById('nisdActions');
    if (nisdActions && !document.getElementById('tnNisdCardBtn')) {
      const nisdBtn = document.createElement('button');
      nisdBtn.type = 'button';
      nisdBtn.className = 'tn-auto-btn';
      nisdBtn.id = 'tnNisdCardBtn';
      nisdBtn.style.marginRight = '8px';
      nisdBtn.innerHTML = '⚡ Auto-Pull from Tamil Nilam';
      nisdActions.prepend(nisdBtn);
    }

    bindEvents();
  }

  function bindEvents() {
    const backdrop = document.getElementById('tnModalBackdrop');
    const closeBtn = document.getElementById('tnCloseModal');
    const triggerBtn = document.getElementById('tnAutoTriggerBtn');
    const nisdCardBtn = document.getElementById('tnNisdCardBtn');
    const submitBtn = document.getElementById('tnBtnSubmit');
    const excelBtn = document.getElementById('tnBtnExcel');
    const applyBtn = document.getElementById('tnBtnApply');

    const distSel = document.getElementById('tnDistSel');
    const talukSel = document.getElementById('tnTalukSel');
    const nisdRadio = document.getElementById('tnRadioNisd');
    const isdRadio = document.getElementById('tnRadioIsd');

    function openModal() {
      if (backdrop) backdrop.classList.add('open');
    }
    function closeModal() {
      if (backdrop) backdrop.classList.remove('open');
    }

    if (triggerBtn) triggerBtn.addEventListener('click', openModal);
    if (nisdCardBtn) nisdCardBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (backdrop) {
      backdrop.addEventListener('click', e => {
        if (e.target === backdrop) closeModal();
      });
    }

    if (distSel) distSel.addEventListener('change', onDistrictChange);
    if (talukSel) talukSel.addEventListener('change', onTalukChange);

    if (nisdRadio) nisdRadio.addEventListener('change', onOptTypeChange);
    if (isdRadio) isdRadio.addEventListener('change', onOptTypeChange);

    bindQuickDateEvents();

    if (submitBtn) submitBtn.addEventListener('click', handleFetch);
    if (excelBtn) excelBtn.addEventListener('click', handleExportExcel);
    if (applyBtn) applyBtn.addEventListener('click', handleApplyToDashboard);
  }

  function onOptTypeChange() {
    const optType = document.querySelector('input[name="tnOptType"]:checked')?.value || 'N';
    const quickContainer = document.getElementById('tnQuickDatesContainer');
    const applyBtn = document.getElementById('tnBtnApply');

    if (optType === 'I') {
      if (quickContainer) {
        quickContainer.innerHTML = `
          <button type="button" class="tn-quick-btn" data-range="isd30">30 Days above</button>
          <button type="button" class="tn-quick-btn" data-range="isd25">25 Days above</button>
          <button type="button" class="tn-quick-btn" data-range="isdBelow25">25 Days below</button>
        `;
        bindQuickDateEvents();
      }
      if (applyBtn) {
        applyBtn.innerHTML = '⚡ Auto-Load All into Dashboard (30d+ / 25-29d / &lt;25d)';
      }
    } else {
      if (quickContainer) {
        quickContainer.innerHTML = `
          <button type="button" class="tn-quick-btn" data-range="12">12 Days</button>
          <button type="button" class="tn-quick-btn" data-range="10">10 Days</button>
          <button type="button" class="tn-quick-btn" data-range="below10">&lt;10 Days</button>
        `;
        bindQuickDateEvents();
      }
      if (applyBtn) {
        applyBtn.innerHTML = '⚡ Auto-Load All into Dashboard (12d / 10d / &lt;10d)';
      }
    }
  }

  function bindQuickDateEvents() {
    document.querySelectorAll('.tn-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const range = btn.dataset.range;
        const to = new Date();
        let from = new Date();

        if (range === '12') {
          from.setDate(to.getDate() - 12);
        } else if (range === '10') {
          from.setDate(to.getDate() - 10);
        } else if (range === 'below10') {
          from.setDate(to.getDate() - 9);
        } else if (range === 'isd30') {
          from.setDate(to.getDate() - 60);
          to.setDate(to.getDate() - 30);
        } else if (range === 'isd25') {
          from.setDate(to.getDate() - 29);
          to.setDate(to.getDate() - 25);
        } else if (range === 'isdBelow25') {
          from.setDate(to.getDate() - 24);
        }

        const formatD = d => {
          const day = String(d.getDate()).padStart(2, '0');
          const m = String(d.getMonth() + 1).padStart(2, '0');
          return `${day}-${m}-${d.getFullYear()}`;
        };

        document.getElementById('tnFromDate').value = formatD(from);
        document.getElementById('tnToDate').value = formatD(to);
      });
    });
  }

  async function onDistrictChange() {
    const distCode = document.getElementById('tnDistSel').value;
    const talukSel = document.getElementById('tnTalukSel');
    talukSel.innerHTML = '<option value="">Loading Taluks...</option>';

    try {
      let taluks = talukCache.get(distCode);
      if (!taluks) {
        const res = await fetch(`/api/nisd-rural?mode=taluks&distCode=${encodeURIComponent(distCode)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.taluks)) {
          taluks = data.taluks.map(t => ({
            code: t.talukCode,
            name: `${t.talukName} (${t.talukCode})`
          }));
          talukCache.set(distCode, taluks);
        }
      }

      if (taluks && taluks.length) {
        talukSel.innerHTML = taluks.map(t => `<option value="${t.code}">${t.name}</option>`).join('');
      } else {
        talukSel.innerHTML = '<option value="">-- No Taluks Found --</option>';
      }
    } catch (err) {
      console.error('Failed to load taluks:', err);
      talukSel.innerHTML = '<option value="">Failed to load taluks</option>';
    }

    onTalukChange();
  }

  async function onTalukChange() {
    const distCode = document.getElementById('tnDistSel').value;
    const talukCode = document.getElementById('tnTalukSel').value;
    const villageSel = document.getElementById('tnVillageSel');

    if (!talukCode) {
      villageSel.innerHTML = '<option value="">-- ALL VILLAGES (Combined) --</option>';
      return;
    }

    const cacheKey = `${distCode}_${talukCode}`;
    villageSel.innerHTML = '<option value="">Loading Villages...</option>';

    try {
      let villages = villageCache.get(cacheKey);
      if (!villages) {
        const res = await fetch(`/api/nisd-rural?mode=villages&distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.villages)) {
          villages = [
            { code: "", name: "-- ALL VILLAGES (Combined) --" },
            ...data.villages.map(v => ({
              code: v.villageCode,
              name: `${v.villageName} (${v.villageCode})`
            }))
          ];
          villageCache.set(cacheKey, villages);
        }
      }

      if (villages && villages.length) {
        villageSel.innerHTML = villages.map(v => `<option value="${v.code}">${v.name}</option>`).join('');
      } else {
        villageSel.innerHTML = '<option value="">-- ALL VILLAGES (Combined) --</option>';
      }
    } catch (err) {
      console.error('Failed to load villages:', err);
      villageSel.innerHTML = '<option value="">-- ALL VILLAGES (Combined) --</option>';
    }
  }

  function calculatePendingDays(app) {
    if (app.appl_date) {
      const parts = String(app.appl_date).trim().split('-');
      if (parts.length === 3) {
        let d, m, y;
        if (parts[0].length === 4) [y, m, d] = parts.map(Number);
        else [d, m, y] = parts.map(Number);
        const appDate = new Date(y, m - 1, d);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        appDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((now.getTime() - appDate.getTime()) / 86400000);
        if (!isNaN(diffDays) && diffDays >= 0) return diffDays;
      }
    }
    if (app.total_pending != null) {
      const tp = parseInt(String(app.total_pending).replace(/[^\d]/g, ''), 10);
      if (!isNaN(tp) && tp >= 0) return tp;
    }
    return 0;
  }

  function groupAppsByVillage(apps) {
    const map = new Map();
    apps.forEach(app => {
      const vName = (app.village_name || 'Unknown').trim();
      if (!map.has(vName)) {
        map.set(vName, {
          village: vName,
          rtr: 0,
          str: 0,
          total: 0
        });
      }
      const item = map.get(vName);
      const rtrStr = String(app.rtr_str || '').trim().toUpperCase();
      if (rtrStr.startsWith('S')) {
        item.str++;
      } else {
        item.rtr++;
      }
      item.total++;
    });
    return Array.from(map.values()).sort((a, b) => a.village.localeCompare(b.village));
  }

  function groupAppsByVillageForISD(apps) {
    const map = new Map();
    apps.forEach(app => {
      const vName = (app.village_name || 'Unknown').trim();
      if (!map.has(vName)) {
        map.set(vName, {
          label: vName,
          taluk: app.taluk_name || '',
          surv: 0,
          vao: 0,
          lrd: 0,
          dis: 0,
          thl: 0,
          all: 0
        });
      }
      const item = map.get(vName);
      const role = String(app.role_name || app.pending_at || '').toUpperCase();
      if (role.includes('SURVEY') || role.includes('FS')) {
        item.surv++;
      } else {
        item.vao++;
      }
      item.all = item.surv + item.vao;
    });

    const rows = Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    const footer = {
      label: 'TOTAL',
      taluk: '',
      surv: rows.reduce((sum, r) => sum + r.surv, 0),
      vao: rows.reduce((sum, r) => sum + r.vao, 0),
      lrd: 0,
      dis: 0,
      thl: 0,
      all: rows.reduce((sum, r) => sum + r.all, 0)
    };

    return { rows, footer };
  }

  async function handleFetch() {
    const statusBanner = document.getElementById('tnStatusBanner');
    const reportArea = document.getElementById('tnReportArea');
    const excelBtn = document.getElementById('tnBtnExcel');
    const applyWrap = document.getElementById('tnApplyWrap');
    const bucketSummary = document.getElementById('tnBucketSummary');

    const distCode = document.getElementById('tnDistSel').value;
    const talukCode = document.getElementById('tnTalukSel').value;
    const villageCode = document.getElementById('tnVillageSel').value;
    const fromDate = document.getElementById('tnFromDate').value.trim();
    const toDate = document.getElementById('tnToDate').value.trim();
    const mode = document.getElementById('tnViewMode').value;
    const optType = document.querySelector('input[name="tnOptType"]:checked')?.value || 'N';
    currentMode = mode;

    if (!fromDate || !toDate) {
      showStatus('Please specify both From Date and To Date.', 'error');
      return;
    }

    const targetDesc = villageCode
      ? `village (${document.getElementById('tnVillageSel').selectedOptions[0].text})`
      : 'all villages';
    const typeLabel = optType === 'I' ? 'ISD' : 'NISD';
    showStatus(`Connecting to Tamil Nilam & fetching live ${typeLabel} report for ${targetDesc}...`, 'info');
    reportArea.style.display = 'none';
    excelBtn.style.display = 'none';
    if (applyWrap) applyWrap.style.display = 'none';

    try {
      const url = `/api/nisd-rural?distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&villageCode=${encodeURIComponent(villageCode)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&mode=${encodeURIComponent(mode)}&flag=${encodeURIComponent(optType)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch report');
      }

      currentReportData = data;
      hideStatus();

      if (mode === 'details') {
        renderDetailsTable(data, optType);
      } else {
        renderSummaryTable(data, optType);
      }

      reportArea.style.display = 'block';
      excelBtn.style.display = 'inline-block';

      if (applyWrap) {
        applyWrap.style.display = 'inline-flex';
        const rawApps = data.applications || [];

        if (optType === 'I') {
          const apps = rawApps;
          const b30 = apps.filter(a => calculatePendingDays(a) >= 30).length;
          const b25 = apps.filter(a => { const d = calculatePendingDays(a); return d >= 25 && d < 30; }).length;
          const bBelow25 = apps.filter(a => calculatePendingDays(a) < 25).length;

          if (bucketSummary) {
            bucketSummary.style.display = 'inline-flex';
            bucketSummary.innerHTML = `Breakdown: <b>${b30}</b> &ge;30d &bull; <b>${b25}</b> 25-29d &bull; <b>${bBelow25}</b> &lt;25d`;
          }
        } else {
          // NISD: filter VAO-only pending applications
          const apps = rawApps.filter(a => {
            const r = String(a.role_name || a.pending_at || '').trim().toUpperCase();
            return r === 'VAO' || r.includes('VAO');
          });
          const b12 = apps.filter(a => calculatePendingDays(a) >= 12).length;
          const b10 = apps.filter(a => { const d = calculatePendingDays(a); return d >= 10 && d < 12; }).length;
          const bBelow10 = apps.filter(a => calculatePendingDays(a) < 10).length;

          if (bucketSummary) {
            bucketSummary.style.display = 'inline-flex';
            bucketSummary.innerHTML = `VAO Pending Breakdown: <b>${b12}</b> &ge;12d &bull; <b>${b10}</b> 10-11d &bull; <b>${bBelow10}</b> &lt;10d`;
          }
        }
      }

    } catch (err) {
      console.error('Fetch error:', err);
      let errorMsg = err.message;
      if (errorMsg.includes('timed out') || errorMsg.includes('fetch')) {
        errorMsg += ' — Note: Tamil Nadu Government (TNSDC) firewall blocks foreign IP addresses. If deployed on Vercel, ensure the Mumbai (bom1) serverless region is used, or run locally via `node local_server.js`.';
      }
      showStatus(`Error fetching Tamil Nilam report: ${errorMsg}`, 'error');
    }
  }

  function renderDetailsTable(data, optType) {
    const tableWrap = document.getElementById('tnTableWrap');
    const apps = data.applications || [];
    const period = data.period || 'OPT APPLICATION PENDING REPORT';
    const asOn = data.asOn || '';

    let html = `
      <table class="tn-report-table" id="tnExportTable">
        <thead>
          <tr>
            <th colspan="12" class="tn-main-head">
              ${esc(period)} ${asOn ? `<br>${esc(asOn)}` : ''}
            </th>
          </tr>
          <tr>
            <th class="tn-col-head">S.No.</th>
            <th class="tn-col-head">District Name</th>
            <th class="tn-col-head">Taluk Name</th>
            <th class="tn-col-head">Village Name</th>
            <th class="tn-col-head">Application Id</th>
            <th class="tn-col-head">Survey No.</th>
            <th class="tn-col-head">Survey No. - Subdiv No.</th>
            <th class="tn-col-head">Pending at</th>
            <th class="tn-col-head">RTR-STR</th>
            <th class="tn-col-head">Application Date</th>
            <th class="tn-col-head">Application Pendency(Days)</th>
            <th class="tn-col-head">Current Level(Days)</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (!apps.length) {
      html += `<tr><td colspan="12" style="text-align:center; padding: 20px; color: var(--muted);">No pending applications found for the selected criteria.</td></tr>`;
    } else {
      apps.forEach((app, idx) => {
        const role = app.role_name || app.pending_at || 'VAO';
        const pendDays = calculatePendingDays(app);
        let badgeColor = '#10b981';

        if (optType === 'I') {
          if (pendDays >= 30) badgeColor = '#ef4444';
          else if (pendDays >= 25) badgeColor = '#f59e0b';
        } else {
          if (pendDays >= 12) badgeColor = '#ef4444';
          else if (pendDays >= 10) badgeColor = '#f59e0b';
        }

        html += `
          <tr>
            <td class="align-center">${idx + 1}</td>
            <td>${esc(app.district_name || '')}</td>
            <td>${esc(app.taluk_name || '')}</td>
            <td><b>${esc(app.village_name || '')}</b></td>
            <td style="font-family: monospace; font-weight: 600;">${esc(app.appl_id || '')}</td>
            <td class="align-center">${esc(app.survey_no_dis || app.survey_no || '')}</td>
            <td style="font-size: 11px;">${esc(app.survey_subdivno || '')}</td>
            <td class="align-center"><span class="tn-badge-role vao">${esc(role)}</span></td>
            <td class="align-center"><b>${esc(app.rtr_str || '')}</b></td>
            <td class="align-center">${esc(app.appl_date || '')}</td>
            <td class="align-right"><b style="color:${badgeColor}">${pendDays} days</b></td>
            <td class="align-right">${esc(app.pending_at_days || '')}</td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    tableWrap.innerHTML = html;
  }

  function renderSummaryTable(data, optType) {
    const tableWrap = document.getElementById('tnTableWrap');
    const villages = (data.data && data.data.distarr) || (data.summary && data.summary.distarr) || [];
    const period = data.period || 'OPT APPLICATION PENDING REPORT';
    const asOn = data.asOn || '';

    if (optType === 'I') {
      let html = `
        <table class="tn-report-table" id="tnExportTable">
          <thead>
            <tr>
              <th colspan="22" class="tn-main-head">
                ${esc(period)} ${asOn ? `<br>AND PENDING AS ON: ${esc(asOn)}` : ''}
              </th>
            </tr>
            <tr>
              <th rowspan="2" class="tn-col-head">S.No.</th>
              <th rowspan="2" class="tn-col-head">District Name</th>
              <th rowspan="2" class="tn-col-head">Taluk Name</th>
              <th rowspan="2" class="tn-col-head">Village Name</th>
              <th colspan="3" class="tn-col-head">TOTAL</th>
              <th colspan="3" class="tn-col-head">SURVEYOR</th>
              <th colspan="3" class="tn-col-head">LRD</th>
              <th colspan="3" class="tn-col-head">DIS</th>
              <th colspan="3" class="tn-col-head">THL</th>
              <th colspan="3" class="tn-col-head">VAO</th>
            </tr>
            <tr>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
            </tr>
          </thead>
          <tbody>
      `;

      if (!villages.length) {
        html += `<tr><td colspan="22" style="text-align:center; padding: 20px; color: var(--muted);">No records found.</td></tr>`;
      } else {
        villages.forEach((v, idx) => {
          html += `
            <tr>
              <td class="align-center">${idx + 1}</td>
              <td>${esc(v.district_name || '')}</td>
              <td>${esc(v.taluk_name || '')}</td>
              <td><b>${esc(v.village_name || '')}</b></td>
              <td class="align-right">${esc(v.total_rtr || '0')}</td>
              <td class="align-right">${esc(v.total_str || '0')}</td>
              <td class="align-right"><b>${esc(v.total || '0')}</b></td>
              <td class="align-right">${esc(v.sur_rtr || '0')}</td>
              <td class="align-right">${esc(v.sur_str || '0')}</td>
              <td class="align-right"><b>${esc(v.total_sur || '0')}</b></td>
              <td class="align-right">${esc(v.lrd_rtr || '0')}</td>
              <td class="align-right">${esc(v.lrd_str || '0')}</td>
              <td class="align-right">${esc(v.total_lrd || '0')}</td>
              <td class="align-right">${esc(v.dis_rtr || '0')}</td>
              <td class="align-right">${esc(v.dis_str || '0')}</td>
              <td class="align-right">${esc(v.total_dis || '0')}</td>
              <td class="align-right">${esc(v.tashildar_rtr || '0')}</td>
              <td class="align-right">${esc(v.tashildar_str || '0')}</td>
              <td class="align-right">${esc(v.total_thl || '0')}</td>
              <td class="align-right">${esc(v.vao_rtr || '0')}</td>
              <td class="align-right">${esc(v.vao_str || '0')}</td>
              <td class="align-right"><b>${esc(v.total_vao || '0')}</b></td>
            </tr>
          `;
        });
      }

      html += `</tbody></table>`;
      tableWrap.innerHTML = html;
      return;
    }

    let html = `
      <table class="tn-report-table" id="tnExportTable">
        <thead>
          <tr>
            <th colspan="17" class="tn-main-head">
              ${esc(period)} ${asOn ? `<br>AND PENDING AS ON: ${esc(asOn)}` : ''}
            </th>
          </tr>
          <tr>
            <th rowspan="2" class="tn-col-head">S.No.</th>
            <th rowspan="2" class="tn-col-head">District</th>
            <th rowspan="2" class="tn-col-head">Taluk</th>
            <th rowspan="2" class="tn-col-head">Zone</th>
            <th rowspan="2" class="tn-col-head">Village Name</th>
            <th colspan="3" class="tn-col-head">TOTAL</th>
            <th colspan="3" class="tn-col-head">VAO</th>
            <th colspan="3" class="tn-col-head">ZDT</th>
            <th colspan="3" class="tn-col-head">HQDT</th>
          </tr>
          <tr>
            <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
            <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
            <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
            <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (!villages.length) {
      html += `<tr><td colspan="17" style="text-align:center; padding: 20px; color: var(--muted);">No records found.</td></tr>`;
    } else {
      villages.forEach((v, idx) => {
        html += `
          <tr>
            <td class="align-center">${idx + 1}</td>
            <td>${esc(v.district_name || '')}</td>
            <td>${esc(v.taluk_name || '')}</td>
            <td>${esc(v.zone_name || '')}</td>
            <td><b>${esc(v.village_name || '')}</b></td>
            <td class="align-right">${esc(v.total_rtr || '0')}</td>
            <td class="align-right">${esc(v.total_str || '0')}</td>
            <td class="align-right"><b>${esc(v.total || '0')}</b></td>
            <td class="align-right">${esc(v.vao_rtr || '0')}</td>
            <td class="align-right">${esc(v.vao_str || '0')}</td>
            <td class="align-right"><b>${esc(v.vao || '0')}</b></td>
            <td class="align-right">${esc(v.zdt_rtr || '0')}</td>
            <td class="align-right">${esc(v.zdt_str || '0')}</td>
            <td class="align-right">${esc(v.zdt || '0')}</td>
            <td class="align-right">${esc(v.hqdt_rtr || '0')}</td>
            <td class="align-right">${esc(v.hqdt_str || '0')}</td>
            <td class="align-right">${esc(v.hqdt || '0')}</td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    tableWrap.innerHTML = html;
  }

  function handleExportExcel() {
    const table = document.getElementById('tnExportTable');
    if (!table) return;

    if (typeof window.XLSX !== 'undefined') {
      const wb = XLSX.utils.table_to_book(table, { sheet: 'OPT Pending Report' });
      const filename = `TamilNilam_OPT_Pending_${document.getElementById('tnFromDate').value}_to_${document.getElementById('tnToDate').value}.xlsx`;
      XLSX.writeFile(wb, filename);
    } else {
      const html = table.outerHTML;
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `TamilNilam_OPT_Pending.xls`;
      a.click();
    }
  }

  async function handleApplyToDashboard() {
    if (!currentReportData) {
      showStatus('Please click Submit to fetch the report first.', 'error');
      return;
    }

    const rawApps = currentReportData.applications || [];
    if (!rawApps.length) {
      showStatus('No individual applications found to distribute into date buckets. Make sure Report Format is set to "Detailed Applications".', 'error');
      return;
    }

    const fromDate = document.getElementById('tnFromDate').value.trim();
    const toDate = document.getElementById('tnToDate').value.trim();
    const optType = document.querySelector('input[name="tnOptType"]:checked')?.value || 'N';
    const period = currentReportData.period || `OPT APPLICATION FROM: ${fromDate} TO: ${toDate}`;
    const asOn = currentReportData.asOn ? `AND PENDING AS ON: ${currentReportData.asOn}` : '';

    try {
      if (!window.store) window.store = {};

      if (optType === 'I') {
        showStatus('Calculating application pendency & sorting into 30d+ / 25-29d / <25d ISD buckets...', 'info');

        const bucket30Above = [];
        const bucket25Above = [];
        const bucket25Below = [];

        rawApps.forEach(app => {
          const days = calculatePendingDays(app);
          if (days >= 30) {
            bucket30Above.push(app);
          } else if (days >= 25) {
            bucket25Above.push(app);
          } else {
            bucket25Below.push(app);
          }
        });

        const isd30 = groupAppsByVillageForISD(bucket30Above);
        const isd25 = groupAppsByVillageForISD(bucket25Above);
        const isdBelow25 = groupAppsByVillageForISD(bucket25Below);

        const dataBelow25 = {
          name: `Auto <25 Days (${bucket25Below.length} apps)`,
          rows: isdBelow25.rows,
          footer: isdBelow25.footer,
          period,
          asOn
        };
        const data25Above = {
          name: `Auto 25-29 Days (${bucket25Above.length} apps)`,
          rows: isd25.rows,
          footer: isd25.footer,
          period,
          asOn
        };
        const data30Above = {
          name: `Auto 30+ Days (${bucket30Above.length} apps)`,
          rows: isd30.rows,
          footer: isd30.footer,
          period,
          asOn
        };

        window.store['opt0'] = dataBelow25;
        window.store['opt_0_0'] = dataBelow25;
        window.store['opt1'] = data25Above;
        window.store['opt_0_1'] = data25Above;
        window.store['opt2'] = data30Above;
        window.store['opt_0_2'] = data30Above;

        if (typeof window.markLoaded === 'function') {
          window.markLoaded('opt0', dataBelow25.name, isdBelow25.rows.length, false);
          window.markLoaded('opt1', data25Above.name, isd25.rows.length, false);
          window.markLoaded('opt2', data30Above.name, isd30.rows.length, false);
        }

        if (typeof window.updateRail === 'function') window.updateRail();
        if (typeof window.render === 'function') window.render();

        // Auto-save to Supabase Cloud if available
        if (typeof window.saveToCloud === 'function') {
          try {
            showStatus('Syncing & replacing dataset in Supabase Cloud...', 'info');
            const slots = [
              { kind: 'opt0', data: dataBelow25, name: 'TamilNilam_Auto_ISD_Below25Days.json' },
              { kind: 'opt1', data: data25Above, name: 'TamilNilam_Auto_ISD_25to29Days.json' },
              { kind: 'opt2', data: data30Above, name: 'TamilNilam_Auto_ISD_30DaysAbove.json' }
            ];
            for (const s of slots) {
              const blob = new Blob([JSON.stringify(s.data)], { type: 'application/json' });
              blob.name = s.name;
              await window.saveToCloud(s.kind, blob, s.data);
            }
          } catch (cloudErr) {
            console.warn('Supabase cloud save note:', cloudErr);
          }
        }

        showStatus(`✓ Auto-loaded & Saved to Supabase: ${bucket30Above.length} apps into 30+ Days, ${bucket25Above.length} apps into 25-29 Days, ${bucket25Below.length} apps into <25 Days!`, 'info');
        if (typeof window.toast === 'function') {
          window.toast('ISD Dashboard Loaded & Saved', `≥30d: ${bucket30Above.length} | 25-29d: ${bucket25Above.length} | <25d: ${bucket25Below.length}`, 'ok');
        }

      } else {
        showStatus('Filtering VAO pending applications & sorting into 12d / 10d / <10d NISD buckets...', 'info');

        // NISD: Filter VAO-only pending applications, ignoring HQDT, ZDT, etc.
        const vaoApps = rawApps.filter(app => {
          const role = String(app.role_name || app.pending_at || '').trim().toUpperCase();
          return role === 'VAO' || role.includes('VAO');
        });

        const bucket12 = [];
        const bucket10 = [];
        const bucketBelow10 = [];

        vaoApps.forEach(app => {
          const days = calculatePendingDays(app);
          if (days >= 12) {
            bucket12.push(app);
          } else if (days >= 10) {
            bucket10.push(app);
          } else {
            bucketBelow10.push(app);
          }
        });

        const rows12 = groupAppsByVillage(bucket12);
        const rows10 = groupAppsByVillage(bucket10);
        const rowsBelow10 = groupAppsByVillage(bucketBelow10);

        const data12 = {
          name: `Auto 12 Days (${bucket12.length} VAO apps)`,
          rows: rows12,
          footer: null,
          period,
          asOn
        };
        const data10 = {
          name: `Auto 10 Days (${bucket10.length} VAO apps)`,
          rows: rows10,
          footer: null,
          period,
          asOn
        };
        const dataBelow10 = {
          name: `Auto <10 Days (${bucketBelow10.length} VAO apps)`,
          rows: rowsBelow10,
          footer: null,
          period,
          asOn
        };

        window.store['nisd_0_0'] = data12;
        window.store['nisd0'] = data12;

        window.store['nisd_0_1'] = data10;
        window.store['nisd1'] = data10;

        window.store['nisd_0_2'] = dataBelow10;
        window.store['nisd2'] = dataBelow10;

        if (!window.store.nisdFirka) {
          const allVillages = Array.from(new Set([
            ...rows12.map(r => r.village),
            ...rows10.map(r => r.village),
            ...rowsBelow10.map(r => r.village)
          ])).filter(Boolean);

          window.store.nisdFirka = {
            name: 'Auto Village Firka',
            rows: allVillages.map(v => ({ village: v, firka: 'General' }))
          };
          if (typeof window.markLoaded === 'function') {
            window.markLoaded('nisdFirka', window.store.nisdFirka.name, allVillages.length, false);
          }
        }

        if (typeof window.markLoaded === 'function') {
          window.markLoaded('nisd_0_0', data12.name, rows12.length, false);
          window.markLoaded('nisd0', data12.name, rows12.length, false);
          window.markLoaded('nisd_0_1', data10.name, rows10.length, false);
          window.markLoaded('nisd1', data10.name, rows10.length, false);
          window.markLoaded('nisd_0_2', dataBelow10.name, rowsBelow10.length, false);
          window.markLoaded('nisd2', dataBelow10.name, rowsBelow10.length, false);
        }

        if (typeof window.renderNisdDrops === 'function') window.renderNisdDrops();
        if (typeof window.updateRail === 'function') window.updateRail();
        if (typeof window.render === 'function') window.render();

        // Auto-save to Supabase Cloud if available
        if (typeof window.saveToCloud === 'function') {
          try {
            showStatus('Syncing & replacing dataset in Supabase Cloud...', 'info');
            const slots = [
              { kind: 'nisd_0_0', data: data12, name: 'TamilNilam_Auto_NISD_12DaysAbove.json' },
              { kind: 'nisd_0_1', data: data10, name: 'TamilNilam_Auto_NISD_10to11Days.json' },
              { kind: 'nisd_0_2', data: dataBelow10, name: 'TamilNilam_Auto_NISD_Below10Days.json' }
            ];
            if (window.store.nisdFirka) {
              slots.push({ kind: 'nisdFirka', data: window.store.nisdFirka, name: 'TamilNilam_Auto_NISD_Village_Firka.json' });
            }
            for (const s of slots) {
              const blob = new Blob([JSON.stringify(s.data)], { type: 'application/json' });
              blob.name = s.name;
              await window.saveToCloud(s.kind, blob, s.data);
            }
          } catch (cloudErr) {
            console.warn('Supabase cloud save note:', cloudErr);
          }
        }

        showStatus(`✓ Auto-loaded & Saved to Supabase (VAO-only): ${bucket12.length} apps into 12 Days, ${bucket10.length} apps into 10 Days, ${bucketBelow10.length} apps into <10 Days!`, 'info');
        if (typeof window.toast === 'function') {
          window.toast('NISD Dashboard Loaded & Saved', `VAO ≥12d: ${bucket12.length} | 10-11d: ${bucket10.length} | <10d: ${bucketBelow10.length}`, 'ok');
        }
      }

      setTimeout(() => {
        const backdrop = document.getElementById('tnModalBackdrop');
        if (backdrop) backdrop.classList.remove('open');
      }, 1600);

    } catch (err) {
      console.error('Apply error:', err);
      showStatus(`Failed to apply to dashboard: ${err.message}`, 'error');
    }
  }

  function showStatus(msg, type) {
    const b = document.getElementById('tnStatusBanner');
    if (!b) return;
    b.className = `tn-status-banner ${type}`;
    b.textContent = msg;
    b.style.display = 'block';
  }

  function hideStatus() {
    const b = document.getElementById('tnStatusBanner');
    if (b) b.style.display = 'none';
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
  } else {
    injectUI();
  }
})();
