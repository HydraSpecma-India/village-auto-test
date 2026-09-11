/* ============================================================
   Tamil Nilam NISD, ISD & F-Line Automation Controller
   (OPT Rural/Natham & F-Line/F-Line Appeal Rural/Natham)
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

  function getTnCreds() {
    if (typeof window.getTnCreds === 'function') {
      return window.getTnCreds();
    }
    try {
      const raw = localStorage.getItem('village_test.tnCreds.v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { username: 'dlurpet', password: '16-03-1992', roleId: '7' };
  }

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
              <span>🏛️ Tamil Nilam Automation Center</span>
              <span class="tn-badge">OPT / F-Line</span>
            </h2>
            <button type="button" class="iconbtn" id="tnCloseModal" title="Close">&#10005;</button>
          </div>

          <div class="tn-modal-body">
            <div class="tn-filter-box">
              <div class="tn-filter-title">VILLAGE WISE APPLICATIONS PENDING REPORT</div>
              
              <div class="tn-form-grid">
                <div class="tn-field" style="grid-column: 1 / -1; background: var(--surface-2); padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line-2);">
                  <label style="font-weight: 700; color: var(--accent); margin-bottom: 6px;">SERVICE TO AUTOMATE</label>
                  <div class="tn-radio-group" style="gap: 20px;">
                    <label style="font-weight: 600;"><input type="radio" name="tnServiceGroup" id="tnSvcOpt" value="OPT" checked> 🏛️ OPT Applications (NISD / ISD)</label>
                    <label style="font-weight: 600;"><input type="radio" name="tnServiceGroup" id="tnSvcFline" value="FLINE"> 📐 F-Line / F-Line Appeal</label>
                  </div>
                </div>

                <div class="tn-field">
                  <label>Land Category</label>
                  <div class="tn-radio-group">
                    <label><input type="radio" name="tnLandCat" id="tnLandRural" value="rural" checked> Rural</label>
                    <label><input type="radio" name="tnLandCat" id="tnLandNatham" value="natham"> Natham</label>
                  </div>
                </div>

                <div class="tn-field" id="tnOptRow">
                  <label>Transaction Type</label>
                  <div class="tn-radio-group">
                    <label><input type="radio" name="tnOptType" id="tnRadioNisd" value="N" checked> NISD</label>
                    <label><input type="radio" name="tnOptType" id="tnRadioIsd" value="I"> ISD</label>
                  </div>
                </div>

                <div class="tn-field" id="tnFlineReportRow" style="display:none;">
                  <label>F-Line Type</label>
                  <div class="tn-radio-group">
                    <label><input type="radio" name="tnFlineReportType" id="tnFlineMain" value="FLINE" checked> F-Line</label>
                    <label><input type="radio" name="tnFlineReportType" id="tnFlineAppeal" value="APPEAL"> F-Line Appeal</label>
                  </div>
                </div>

                <div class="tn-field" id="tnFlineDateModeRow" style="display:none;">
                  <label>Date Status Mode</label>
                  <div class="tn-radio-group">
                    <label><input type="radio" name="tnStmtFlag" id="tnStmtCurr" value="Current" checked> Current Date</label>
                    <label><input type="radio" name="tnStmtFlag" id="tnStmtOpt" value="OPT"> Closing Date</label>
                  </div>
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
                    <option value="summary">Village Summary</option>
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnFromDate">From Date</label>
                  <input type="text" id="tnFromDate" placeholder="DD-MM-YYYY or YYYY-MM-DD" value="01-09-2026">
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
                  <button type="button" class="tn-btn-apply" id="tnBtnApply">⚡ Auto-Load All into Dashboard</button>
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
        <div style="grid-column: 1 / -1; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; background: var(--surface-2); padding: 10px 14px; border-radius: 99px; border: 1px solid var(--line-2);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">⚡</span>
            <div>
              <b style="font-size: 13px;">Automate NISD / ISD / F-Line Data (Rural & Natham)</b>
              <span style="font-size: 11.5px; color: var(--muted); margin-left: 6px;">Pull directly from Tamil Nilam portal with automatic Supabase Cloud replacement</span>
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

    const talukLabel = document.querySelector('.topbar .inner .taluksel');
    if (talukLabel && !document.getElementById('tnFlashFillBtn')) {
      const today = new Date();
      const formatD = d => String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
      const toDateStr = formatD(today);
      const flashControlsHtml = `
        <div class="tn-flash-dates" style="display:inline-flex; align-items:center; gap:6px; margin-left:8px; margin-right:4px;">
          <label style="font-size:11px; font-weight:600; color:var(--muted,#64748b); display:inline-flex; align-items:center; gap:4px; margin:0;">
            <span>From:</span>
            <input type="text" id="tnFlashFromDate" placeholder="DD-MM-YYYY" value="01-01-2025" style="width:88px; padding:4px 6px; font-size:11.5px; font-family:inherit; border-radius:5px; border:1px solid var(--border,#cbd5e1); background:var(--bg-input,#ffffff); color:var(--ink,#0f172a); text-align:center; font-weight:600;">
          </label>
          <label style="font-size:11px; font-weight:600; color:var(--muted,#64748b); display:inline-flex; align-items:center; gap:4px; margin:0;">
            <span>To:</span>
            <input type="text" id="tnFlashToDate" placeholder="DD-MM-YYYY" value="${toDateStr}" style="width:88px; padding:4px 6px; font-size:11.5px; font-family:inherit; border-radius:5px; border:1px solid var(--border,#cbd5e1); background:var(--bg-input,#ffffff); color:var(--ink,#0f172a); text-align:center; font-weight:600;">
          </label>
          <button type="button" class="tn-auto-btn flash-fill-btn" id="tnFlashFillBtn" title="1-Click Auto Pull All Datasets for Selected Taluk &amp; Date Range" style="margin-left:2px; margin-right:4px;">⚡ 1-Click Flash Fill All</button>
        </div>
      `;
      talukLabel.insertAdjacentHTML('afterend', flashControlsHtml);
    } else {
      const flashToInput = document.getElementById('tnFlashToDate');
      if (flashToInput && !flashToInput.value) {
        const today = new Date();
        const formatD = d => String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
        flashToInput.value = formatD(today);
      }
    }

    bindEvents();
  }

  function bindEvents() {
    const backdrop = document.getElementById('tnModalBackdrop');
    const closeBtn = document.getElementById('tnCloseModal');
    const triggerBtn = document.getElementById('tnAutoTriggerBtn');
    const nisdCardBtn = document.getElementById('tnNisdCardBtn');
    const flashFillBtn = document.getElementById('tnFlashFillBtn');
    const submitBtn = document.getElementById('tnBtnSubmit');
    const excelBtn = document.getElementById('tnBtnExcel');
    const applyBtn = document.getElementById('tnBtnApply');

    const distSel = document.getElementById('tnDistSel');
    const talukSel = document.getElementById('tnTalukSel');
    const nisdRadio = document.getElementById('tnRadioNisd');
    const isdRadio = document.getElementById('tnRadioIsd');
    const landRuralRadio = document.getElementById('tnLandRural');
    const landNathamRadio = document.getElementById('tnLandNatham');

    const svcOptRadio = document.getElementById('tnSvcOpt');
    const svcFlineRadio = document.getElementById('tnSvcFline');

    function openModal() {
      if (backdrop) backdrop.classList.add('open');
    }
    function closeModal() {
      if (backdrop) backdrop.classList.remove('open');
    }

    if (triggerBtn) triggerBtn.addEventListener('click', openModal);
    if (nisdCardBtn) nisdCardBtn.addEventListener('click', openModal);
    if (flashFillBtn) flashFillBtn.addEventListener('click', handleFlashFillAll);
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
    if (landRuralRadio) landRuralRadio.addEventListener('change', onOptTypeChange);
    if (landNathamRadio) landNathamRadio.addEventListener('change', onOptTypeChange);

    if (svcOptRadio) svcOptRadio.addEventListener('change', onServiceGroupChange);
    if (svcFlineRadio) svcFlineRadio.addEventListener('change', onServiceGroupChange);

    bindQuickDateEvents();

    if (submitBtn) submitBtn.addEventListener('click', handleFetch);
    if (excelBtn) excelBtn.addEventListener('click', handleExportExcel);
    if (applyBtn) applyBtn.addEventListener('click', handleApplyToDashboard);
  }

  function onServiceGroupChange() {
    const serviceGroup = document.querySelector('input[name="tnServiceGroup"]:checked')?.value || 'OPT';
    const optRow = document.getElementById('tnOptRow');
    const flineRow = document.getElementById('tnFlineReportRow');
    const dateModeRow = document.getElementById('tnFlineDateModeRow');
    const applyBtn = document.getElementById('tnBtnApply');

    if (serviceGroup === 'FLINE') {
      if (optRow) optRow.style.display = 'none';
      if (flineRow) flineRow.style.display = 'block';
      if (dateModeRow) dateModeRow.style.display = 'block';
      if (applyBtn) applyBtn.innerHTML = '⚡ Auto-Load F-Line Data into Dashboard';
    } else {
      if (optRow) optRow.style.display = 'block';
      if (flineRow) flineRow.style.display = 'none';
      if (dateModeRow) dateModeRow.style.display = 'none';
      onOptTypeChange();
    }
  }

  function onOptTypeChange() {
    const serviceGroup = document.querySelector('input[name="tnServiceGroup"]:checked')?.value || 'OPT';
    if (serviceGroup === 'FLINE') return;

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
        const creds = getTnCreds();
        const res = await fetch(`/api/nisd-rural?mode=taluks&distCode=${encodeURIComponent(distCode)}&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}`);
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
        const creds = getTnCreds();
        const res = await fetch(`/api/nisd-rural?mode=villages&distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}`);
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
    if (app.appl_date || app.appl_dt) {
      const dateStr = String(app.appl_date || app.appl_dt).trim();
      const parts = dateStr.split('-');
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
    if (app.pending_days != null || app.total_pending != null) {
      const tp = parseInt(String(app.pending_days || app.total_pending).replace(/[^\d]/g, ''), 10);
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
      const isRtr = (app.rtr_str || '').toUpperCase() === 'R';
      if (isRtr) item.rtr++;
      else item.str++;
      item.total++;
    });
    return Array.from(map.values());
  }

  function groupAppsByVillageForISD(apps) {
    const map = new Map();
    apps.forEach(app => {
      const vName = (app.village_name || 'Unknown').trim();
      if (!map.has(vName)) {
        map.set(vName, {
          village: vName,
          rtr: 0, str: 0, total: 0,
          sur_rtr: 0, sur_str: 0, total_sur: 0,
          lrd_rtr: 0, lrd_str: 0, total_lrd: 0,
          dis_rtr: 0, dis_str: 0, total_dis: 0,
          thl_rtr: 0, thl_str: 0, total_thl: 0,
          vao_rtr: 0, vao_str: 0, total_vao: 0
        });
      }
      const item = map.get(vName);
      const isRtr = (app.rtr_str || '').toUpperCase() === 'R';
      const role = String(app.role_name || app.pending_at || '').trim().toUpperCase();

      if (isRtr) item.rtr++;
      else item.str++;
      item.total++;

      if (role.includes('SURVEYOR') || role.includes('SUR')) {
        if (isRtr) item.sur_rtr++; else item.sur_str++;
        item.total_sur++;
      } else if (role.includes('LRD')) {
        if (isRtr) item.lrd_rtr++; else item.lrd_str++;
        item.total_lrd++;
      } else if (role.includes('DIS') || role.includes('DISTRICT')) {
        if (isRtr) item.dis_rtr++; else item.dis_str++;
        item.total_dis++;
      } else if (role.includes('THL') || role.includes('TAHSILDAR') || role.includes('TASHILDAR')) {
        if (isRtr) item.thl_rtr++; else item.thl_str++;
        item.total_thl++;
      } else {
        if (isRtr) item.vao_rtr++; else item.vao_str++;
        item.total_vao++;
      }
    });

    const rows = Array.from(map.values());
    let footer = null;
    if (rows.length > 0) {
      footer = {
        village: 'Total',
        rtr: rows.reduce((s, r) => s + r.rtr, 0),
        str: rows.reduce((s, r) => s + r.str, 0),
        total: rows.reduce((s, r) => s + r.total, 0),
        sur_rtr: rows.reduce((s, r) => s + r.sur_rtr, 0),
        sur_str: rows.reduce((s, r) => s + r.sur_str, 0),
        total_sur: rows.reduce((s, r) => s + r.total_sur, 0),
        lrd_rtr: rows.reduce((s, r) => s + r.lrd_rtr, 0),
        lrd_str: rows.reduce((s, r) => s + r.lrd_str, 0),
        total_lrd: rows.reduce((s, r) => s + r.total_lrd, 0),
        dis_rtr: rows.reduce((s, r) => s + r.dis_rtr, 0),
        dis_str: rows.reduce((s, r) => s + r.dis_str, 0),
        total_dis: rows.reduce((s, r) => s + r.total_dis, 0),
        thl_rtr: rows.reduce((s, r) => s + r.thl_rtr, 0),
        thl_str: rows.reduce((s, r) => s + r.thl_str, 0),
        total_thl: rows.reduce((s, r) => s + r.total_thl, 0),
        vao_rtr: rows.reduce((s, r) => s + r.vao_rtr, 0),
        vao_str: rows.reduce((s, r) => s + r.vao_str, 0),
        total_vao: rows.reduce((s, r) => s + r.total_vao, 0)
      };
    }
    return { rows, footer };
  }

  async function handleFetch() {
    const statusBanner = document.getElementById('tnStatusBanner');
    const reportArea = document.getElementById('tnReportArea');
    const excelBtn = document.getElementById('tnBtnExcel');
    const applyWrap = document.getElementById('tnApplyWrap');
    const bucketSummary = document.getElementById('tnBucketSummary');

    const serviceGroup = document.querySelector('input[name="tnServiceGroup"]:checked')?.value || 'OPT';
    const distCode = document.getElementById('tnDistSel').value;
    const talukCode = document.getElementById('tnTalukSel').value;
    const villageCode = document.getElementById('tnVillageSel').value;
    const fromDate = document.getElementById('tnFromDate').value.trim();
    const toDate = document.getElementById('tnToDate').value.trim();
    const mode = document.getElementById('tnViewMode').value;
    const landCategory = document.querySelector('input[name="tnLandCat"]:checked')?.value || 'rural';
    const creds = getTnCreds();
    currentMode = mode;

    if (!fromDate || !toDate) {
      showStatus('Please specify both From Date and To Date.', 'error');
      return;
    }

    const targetDesc = villageCode
      ? `village (${document.getElementById('tnVillageSel').selectedOptions[0].text})`
      : 'all villages';

    reportArea.style.display = 'none';
    excelBtn.style.display = 'none';
    if (applyWrap) applyWrap.style.display = 'none';

    try {
      if (serviceGroup === 'FLINE') {
        const reportType = document.querySelector('input[name="tnFlineReportType"]:checked')?.value || 'FLINE';
        const stmtFlag = document.querySelector('input[name="tnStmtFlag"]:checked')?.value || 'Current';
        const typeLabel = `F-Line ${reportType === 'APPEAL' ? 'Appeal ' : ''}(${landCategory.toUpperCase()})`;
        
        showStatus(`Connecting to Tamil Nilam & fetching live ${typeLabel} report for ${targetDesc}...`, 'info');

        const url = `/api/fline?reportType=${encodeURIComponent(reportType)}&landCategory=${encodeURIComponent(landCategory)}&stmtFlag=${encodeURIComponent(stmtFlag)}&distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&mode=${encodeURIComponent(mode)}&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch F-Line report');

        currentReportData = { ...data, serviceGroup: 'FLINE' };
        hideStatus();

        renderFlineDetailsTable(data);
        reportArea.style.display = 'block';
        excelBtn.style.display = 'inline-block';

        if (applyWrap) {
          applyWrap.style.display = 'inline-flex';
          const apps = data.applications || [];
          if (bucketSummary) {
            bucketSummary.style.display = 'inline-flex';
            bucketSummary.innerHTML = `F-Line Applications: <b>${apps.length}</b> total pending`;
          }
        }
        return;
      }

      // OPT SERVICE GROUP
      const optType = document.querySelector('input[name="tnOptType"]:checked')?.value || 'N';
      const typeLabel = (landCategory === 'natham' ? 'Natham ' : 'Rural ') + (optType === 'I' ? 'ISD' : 'NISD');
      showStatus(`Connecting to Tamil Nilam & fetching live ${typeLabel} report for ${targetDesc}...`, 'info');

      const url = `/api/nisd-rural?distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&villageCode=${encodeURIComponent(villageCode)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&mode=${encodeURIComponent(mode)}&flag=${encodeURIComponent(optType)}&landCategory=${encodeURIComponent(landCategory)}&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch report');

      currentReportData = { ...data, serviceGroup: 'OPT' };
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

  function renderFlineDetailsTable(data) {
    const tableWrap = document.getElementById('tnTableWrap');
    const apps = data.applications || [];
    const period = data.period || 'F-LINE REPORT';
    const asOn = data.asOn || '';

    let html = `
      <table class="tn-report-table" id="tnExportTable">
        <thead>
          <tr>
            <th colspan="11" class="tn-main-head">
              ${esc(period)} ${asOn ? `<br>${esc(asOn)}` : ''}
            </th>
          </tr>
          <tr>
            <th class="tn-col-head">S.No.</th>
            <th class="tn-col-head">District Name</th>
            <th class="tn-col-head">Taluk Name</th>
            <th class="tn-col-head">Village Name</th>
            <th class="tn-col-head">Application Id</th>
            <th class="tn-col-head">SurveyNo - SubdivNo</th>
            <th class="tn-col-head">Application Date</th>
            <th class="tn-col-head">Pending Days</th>
            <th class="tn-col-head">Pending at</th>
            <th class="tn-col-head">Application Status</th>
            <th class="tn-col-head">Update Date</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (!apps.length) {
      html += `<tr><td colspan="11" style="text-align:center; padding: 20px; color: var(--muted);">No F-Line pending applications found for the selected criteria.</td></tr>`;
    } else {
      apps.forEach((app, idx) => {
        const role = app.pending_at || 'Surveyor';
        const pendDays = calculatePendingDays(app);
        let badgeColor = '#10b981';
        if (pendDays >= 30) badgeColor = '#ef4444';
        else if (pendDays >= 15) badgeColor = '#f59e0b';

        html += `
          <tr>
            <td class="align-center">${idx + 1}</td>
            <td>${esc(app.district_name || '')}</td>
            <td>${esc(app.taluk_name || '')}</td>
            <td><b>${esc(app.village_name || '')}</b></td>
            <td style="font-family: monospace; font-weight: 600;">${esc(app.appl_id || '')}</td>
            <td class="align-center"><b>${esc(app.survey_no || '-')}</b></td>
            <td class="align-center">${esc(app.appl_date || '')}</td>
            <td class="align-right"><b style="color:${badgeColor}">${pendDays} days</b></td>
            <td class="align-center"><span class="tn-badge-role vao">${esc(role)}</span></td>
            <td class="align-center">${esc(app.appl_status || 'Pending')}</td>
            <td class="align-center">${esc(app.update_dt || '-')}</td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    tableWrap.innerHTML = html;
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
            <td class="align-center">${esc(app.survey_no_dis || app.survey_no || '-')}</td>
            <td style="font-size: 11px;">${esc(app.survey_subdivno || '-')}</td>
            <td class="align-center"><span class="tn-badge-role vao">${esc(role)}</span></td>
            <td class="align-center"><b>${esc(app.rtr_str || '')}</b></td>
            <td class="align-center">${esc(app.appl_date || '')}</td>
            <td class="align-right"><b style="color:${badgeColor}">${pendDays} days</b></td>
            <td class="align-right">${esc(app.pending_at_days || app.pending_days || '')}</td>
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
      const wb = XLSX.utils.table_to_book(table, { sheet: 'Pending Report' });
      const filename = `TamilNilam_Report_${document.getElementById('tnFromDate').value}_to_${document.getElementById('tnToDate').value}.xlsx`;
      XLSX.writeFile(wb, filename);
    } else {
      const html = table.outerHTML;
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `TamilNilam_Report.xls`;
      a.click();
    }
  }

  function ensureVillageAndVaoDetails(allVillages) {
    if (!window.store) window.store = {};
    const list = Array.from(new Set(allVillages.map(v => String(v || '').trim()))).filter(Boolean);
    if (!list.length) return;

    if (!window.store.village) {
      const vRows = list.map(v => ({ 'Village Name': v, 'Surveyor Name': 'Surveyor' }));
      const data = {
        name: 'Auto Village Details',
        header: ['Village Name', 'Surveyor Name'],
        objs: vRows
      };
      window.store.village = data;
      if (typeof window.markLoaded === 'function') {
        window.markLoaded('village', data.name, vRows.length, false);
      }
    }

    if (!window.store.vaoDetails) {
      const vaoRows = list.map(v => ({ 'Village Name': v, 'VAO Name': 'VAO' }));
      const data = {
        name: 'Auto VAO Details',
        header: ['Village Name', 'VAO Name'],
        objs: vaoRows
      };
      window.store.vaoDetails = data;
      if (typeof window.markLoaded === 'function') {
        window.markLoaded('vaoDetails', data.name, vaoRows.length, false);
      }
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
    const serviceGroup = currentReportData.serviceGroup || 'OPT';
    const landCategory = currentReportData.landCategory || 'rural';
    const period = currentReportData.period || `APPLICATION FROM: ${fromDate} TO: ${toDate}`;
    const asOn = currentReportData.asOn ? `AND PENDING AS ON: ${currentReportData.asOn}` : '';

    try {
      if (!window.store) window.store = {};
      const allAppVillages = Array.from(new Set(rawApps.map(a => (a.village_name || a.village || '').trim()))).filter(Boolean);
      ensureVillageAndVaoDetails(allAppVillages);

      if (serviceGroup === 'FLINE') {
        const reportType = currentReportData.reportType || 'FLINE';
        showStatus(`Processing ${rawApps.length} F-Line applications & syncing to dashboard...`, 'info');

        const villageMap = new Map();
        rawApps.forEach(app => {
          const v = (app.village_name || 'Unknown').trim();
          villageMap.set(v, (villageMap.get(v) || 0) + 1);
        });

        const rows = Array.from(villageMap.entries()).map(([village, count]) => ({
          village,
          rtr: 0,
          str: count,
          total: count
        }));

        const flineData = {
          name: `Auto F-Line ${reportType} (${landCategory.toUpperCase()}) - ${rawApps.length} apps`,
          header: ['Village Name', 'Application Date', 'Application Status'],
          objs: rawApps.map(a => ({
            'Village Name': (a.village_name || a.village || 'Unknown').trim(),
            'Application Date': a.appl_date || a.appl_dt || '',
            'Application Status': 'Pending'
          })),
          rows,
          period,
          asOn
        };

        const storeKey = landCategory === 'natham' ? 'flineNatham' : 'flineRural';
        window.store[storeKey] = flineData;

        if (typeof window.markLoaded === 'function') {
          window.markLoaded(storeKey, flineData.name, rows.length, false);
        }

        if (typeof window.updateRail === 'function') window.updateRail();
        if (typeof window.render === 'function') window.render();

        // Auto-save to Supabase Cloud
        if (typeof window.saveToCloud === 'function') {
          try {
            showStatus('Syncing & replacing F-Line dataset in Supabase Cloud...', 'info');
            const blob = new Blob([JSON.stringify(flineData)], { type: 'application/json' });
            blob.name = `TamilNilam_Auto_FLINE_${landCategory}_${reportType}.json`;
            await window.saveToCloud(storeKey, blob, flineData);
          } catch (cloudErr) {
            console.warn('Supabase cloud save note:', cloudErr);
          }
        }

        showStatus(`✓ Auto-loaded & Saved to Supabase: ${rawApps.length} F-Line (${landCategory.toUpperCase()}) applications across ${rows.length} villages!`, 'info');
        if (typeof window.toast === 'function') {
          window.toast('F-Line Dashboard Loaded & Saved', `${rawApps.length} apps across ${rows.length} villages`, 'ok');
        }

        setTimeout(() => {
          const backdrop = document.getElementById('tnModalBackdrop');
          if (backdrop) backdrop.classList.remove('open');
        }, 1600);
        return;
      }

      // OPT SERVICE GROUP
      const optType = document.querySelector('input[name="tnOptType"]:checked')?.value || 'N';

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
              { kind: 'opt0', data: dataBelow25, name: `TamilNilam_Auto_ISD_${landCategory}_Below25Days.json` },
              { kind: 'opt1', data: data25Above, name: `TamilNilam_Auto_ISD_${landCategory}_25to29Days.json` },
              { kind: 'opt2', data: data30Above, name: `TamilNilam_Auto_ISD_${landCategory}_30DaysAbove.json` }
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

        const nisd1DetailObj = {
          name: `Auto NISD Natham (${vaoApps.length} VAO apps)`,
          header: ['Village Name', 'Application Date', 'Pending At', 'RTR-STR', 'Application Status'],
          objs: vaoApps.map(app => ({
            'Village Name': (app.village_name || app.village || 'Unknown').trim(),
            'Application Date': app.appl_date || app.appl_dt || '',
            'Pending At': app.role_name || app.pending_at || 'VAO',
            'RTR-STR': 'STR',
            'Application Status': 'Pending'
          }))
        };
        window.store['nisd_1'] = nisd1DetailObj;

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
          window.markLoaded('nisd_1', nisd1DetailObj.name, nisd1DetailObj.objs.length, false);
        }

        if (typeof window.renderNisdDrops === 'function') window.renderNisdDrops();
        if (typeof window.updateRail === 'function') window.updateRail();
        if (typeof window.render === 'function') window.render();

        // Auto-save to Supabase Cloud if available
        if (typeof window.saveToCloud === 'function') {
          try {
            showStatus('Syncing & replacing dataset in Supabase Cloud...', 'info');
            const slots = [
              { kind: 'nisd_0_0', data: data12, name: `TamilNilam_Auto_NISD_${landCategory}_12DaysAbove.json` },
              { kind: 'nisd_0_1', data: data10, name: `TamilNilam_Auto_NISD_${landCategory}_10to11Days.json` },
              { kind: 'nisd_0_2', data: dataBelow10, name: `TamilNilam_Auto_NISD_${landCategory}_Below10Days.json` }
            ];
            if (window.store.nisdFirka) {
              slots.push({ kind: 'nisdFirka', data: window.store.nisdFirka, name: `TamilNilam_Auto_NISD_${landCategory}_Village_Firka.json` });
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

  async function handleFlashFillAll() {
    const btn = document.getElementById('tnFlashFillBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Flash Filling All...';
    }

    const talukSel = document.getElementById('talukSel') || document.getElementById('tnTalukSel');
    const talukCode = (talukSel && talukSel.value) ? talukSel.value : '12';
    const talukOption = talukSel && talukSel.options && talukSel.selectedIndex >= 0 ? talukSel.options[talukSel.selectedIndex] : null;
    const talukName = talukOption ? talukOption.text : `Taluk ${talukCode}`;
    const distCode = document.getElementById('tnDistSel')?.value || '37';

    const creds = getTnCreds();
    if (!creds || !creds.username) {
      if (typeof window.toast === 'function') {
        window.toast('Credentials Required', 'Please configure username and password in Admin settings.', 'warn');
      } else {
        alert('Tamil Nilam credentials not found. Please configure username and password in Admin settings.');
      }
      if (btn) { btn.disabled = false; btn.innerHTML = '⚡ 1-Click Flash Fill All'; }
      return;
    }

    const today = new Date();
    const formatD = d => String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();

    const flashFromVal = document.getElementById('tnFlashFromDate')?.value?.trim();
    const flashToVal = document.getElementById('tnFlashToDate')?.value?.trim();

    const fromDate = flashFromVal || '01-01-2025';
    const toDate = flashToVal || formatD(today);

    if (typeof window.toast === 'function') {
      window.toast('⚡ 1-Click Flash Fill Started', `Pulling NISD Rural, ISD Rural, NISD Natham & ISD Natham for ${talukName} (${fromDate} to ${toDate})...`, 'info');
    }
    showStatus(`⚡ Flash Filling all requirement datasets for ${talukName} (${fromDate} to ${toDate})...`, 'info');

    try {
      const commonParams = `distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&villageCode=&fromDate=${fromDate}&toDate=${toDate}&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}&mode=fetch_raw`;

      // Parallel fetch all 4 primary datasets + 2 F-Line datasets
      const [nisdRuralRes, isdRuralRes, nisdNathamRes, isdNathamRes, flineRuralRes, flineNathamRes] = await Promise.all([
        fetch(`/api/nisd-rural?landCategory=rural&flag=N&${commonParams}`).then(r => r.json()).catch(e => ({ success: false, error: e.message })),
        fetch(`/api/nisd-rural?landCategory=rural&flag=I&${commonParams}`).then(r => r.json()).catch(e => ({ success: false, error: e.message })),
        fetch(`/api/nisd-rural?landCategory=natham&flag=N&${commonParams}`).then(r => r.json()).catch(e => ({ success: false, error: e.message })),
        fetch(`/api/nisd-rural?landCategory=natham&flag=I&${commonParams}`).then(r => r.json()).catch(e => ({ success: false, error: e.message })),
        fetch(`/api/fline?landCategory=rural&reportType=FLINE&stmtFlag=Current&${commonParams}`).then(r => r.json()).catch(e => ({ success: false, error: e.message })),
        fetch(`/api/fline?landCategory=natham&reportType=FLINE&stmtFlag=Current&${commonParams}`).then(r => r.json()).catch(e => ({ success: false, error: e.message }))
      ]);

      if (!window.store) window.store = {};
      let summaryStats = [];

      // Auto-populate village & vaoDetails mappings for ISD Rural table rendering
      const allAppVillages = Array.from(new Set([
        ...(nisdRuralRes.applications || []).map(a => a.village_name || a.village),
        ...(isdRuralRes.applications || []).map(a => a.village_name || a.village),
        ...(nisdNathamRes.applications || []).map(a => a.village_name || a.village),
        ...(isdNathamRes.applications || []).map(a => a.village_name || a.village),
        ...(flineRuralRes.applications || []).map(a => a.village_name || a.village),
        ...(flineNathamRes.applications || []).map(a => a.village_name || a.village)
      ])).filter(Boolean);
      ensureVillageAndVaoDetails(allAppVillages);

      // 1. Process NISD Rural (VAO pending only, 12d / 10d / <10d)
      if (nisdRuralRes.success && Array.isArray(nisdRuralRes.applications)) {
        const rawApps = nisdRuralRes.applications;
        const vaoApps = rawApps.filter(app => {
          const role = String(app.role_name || app.pending_at || '').trim().toUpperCase();
          return role === 'VAO' || role.includes('VAO');
        });

        const b12 = [], b10 = [], bBelow10 = [];
        vaoApps.forEach(app => {
          const days = calculatePendingDays(app);
          if (days >= 12) b12.push(app);
          else if (days >= 10) b10.push(app);
          else bBelow10.push(app);
        });

        const r12 = groupAppsByVillage(b12);
        const r10 = groupAppsByVillage(b10);
        const rBelow10 = groupAppsByVillage(bBelow10);

        const d12 = { name: `Auto 12 Days (${b12.length} VAO apps)`, rows: r12, period: `APPLICATION FROM: ${fromDate} TO: ${toDate}` };
        const d10 = { name: `Auto 10 Days (${b10.length} VAO apps)`, rows: r10, period: `APPLICATION FROM: ${fromDate} TO: ${toDate}` };
        const dBelow10 = { name: `Auto <10 Days (${bBelow10.length} VAO apps)`, rows: rBelow10, period: `APPLICATION FROM: ${fromDate} TO: ${toDate}` };

        window.store['nisd_0_0'] = d12; window.store['nisd0'] = d12;
        window.store['nisd_0_1'] = d10; window.store['nisd1'] = d10;
        window.store['nisd_0_2'] = dBelow10; window.store['nisd2'] = dBelow10;

        if (!window.store.nisdFirka) {
          const allV = Array.from(new Set([...r12.map(r => r.village), ...r10.map(r => r.village), ...rBelow10.map(r => r.village)])).filter(Boolean);
          window.store.nisdFirka = { name: 'Auto Village Firka', rows: allV.map(v => ({ village: v, firka: 'General' })) };
        }

        if (typeof window.markLoaded === 'function') {
          window.markLoaded('nisd_0_0', d12.name, r12.length, false);
          window.markLoaded('nisd0', d12.name, r12.length, false);
          window.markLoaded('nisd_0_1', d10.name, r10.length, false);
          window.markLoaded('nisd1', d10.name, r10.length, false);
          window.markLoaded('nisd_0_2', dBelow10.name, rBelow10.length, false);
          window.markLoaded('nisd2', dBelow10.name, rBelow10.length, false);
          if (window.store.nisdFirka) {
            window.markLoaded('nisdFirka', window.store.nisdFirka.name, window.store.nisdFirka.rows.length, false);
          }
        }

        if (typeof window.saveToCloud === 'function') {
          await window.saveToCloud('nisd_0_0', new Blob([JSON.stringify(d12)], {type:'application/json'}), d12).catch(()=>{});
          await window.saveToCloud('nisd_0_1', new Blob([JSON.stringify(d10)], {type:'application/json'}), d10).catch(()=>{});
          await window.saveToCloud('nisd_0_2', new Blob([JSON.stringify(dBelow10)], {type:'application/json'}), dBelow10).catch(()=>{});
        }
        summaryStats.push(`NISD Rural: ${vaoApps.length} VAO apps`);
      }

      // 2. Process ISD Rural (Surveyor & VAO, 30d+ / 25-29d / <25d)
      if (isdRuralRes.success && Array.isArray(isdRuralRes.applications)) {
        const rawApps = isdRuralRes.applications;
        const b30 = [], b25 = [], bBelow25 = [];
        rawApps.forEach(app => {
          const days = calculatePendingDays(app);
          if (days >= 30) b30.push(app);
          else if (days >= 25) b25.push(app);
          else bBelow25.push(app);
        });

        const isd30 = groupAppsByVillageForISD(b30);
        const isd25 = groupAppsByVillageForISD(b25);
        const isdBelow25 = groupAppsByVillageForISD(bBelow25);

        const dBelow25 = { name: `Auto <25 Days (${bBelow25.length} apps)`, rows: isdBelow25.rows, footer: isdBelow25.footer };
        const d25 = { name: `Auto 25-29 Days (${b25.length} apps)`, rows: isd25.rows, footer: isd25.footer };
        const d30 = { name: `Auto 30+ Days (${b30.length} apps)`, rows: isd30.rows, footer: isd30.footer };

        window.store['opt0'] = dBelow25; window.store['opt_0_0'] = dBelow25;
        window.store['opt1'] = d25; window.store['opt_0_1'] = d25;
        window.store['opt2'] = d30; window.store['opt_0_2'] = d30;

        if (typeof window.markLoaded === 'function') {
          window.markLoaded('opt0', dBelow25.name, isdBelow25.rows.length, false);
          window.markLoaded('opt1', d25.name, isd25.rows.length, false);
          window.markLoaded('opt2', d30.name, isd30.rows.length, false);
        }

        if (typeof window.saveToCloud === 'function') {
          await window.saveToCloud('opt0', new Blob([JSON.stringify(dBelow25)], {type:'application/json'}), dBelow25).catch(()=>{});
          await window.saveToCloud('opt1', new Blob([JSON.stringify(d25)], {type:'application/json'}), d25).catch(()=>{});
          await window.saveToCloud('opt2', new Blob([JSON.stringify(d30)], {type:'application/json'}), d30).catch(()=>{});
        }
        summaryStats.push(`ISD Rural: ${rawApps.length} apps`);
      }

      // 3. Process NISD Natham (VAO pending only, 12d / 10d / <10d)
      if (nisdNathamRes.success && Array.isArray(nisdNathamRes.applications)) {
        const rawApps = nisdNathamRes.applications;
        const vaoApps = rawApps.filter(app => {
          const role = String(app.role_name || app.pending_at || '').trim().toUpperCase();
          return role === 'VAO' || role.includes('VAO');
        });

        const b12 = [], b10 = [], bBelow10 = [];
        vaoApps.forEach(app => {
          const days = calculatePendingDays(app);
          if (days >= 12) b12.push(app);
          else if (days >= 10) b10.push(app);
          else bBelow10.push(app);
        });

        const r12 = groupAppsByVillage(b12);
        const r10 = groupAppsByVillage(b10);
        const rBelow10 = groupAppsByVillage(bBelow10);

        const d12 = { name: `Auto 12 Days Natham (${b12.length} VAO apps)`, rows: r12, period: `APPLICATION FROM: ${fromDate} TO: ${toDate}` };
        const d10 = { name: `Auto 10 Days Natham (${b10.length} VAO apps)`, rows: r10, period: `APPLICATION FROM: ${fromDate} TO: ${toDate}` };
        const dBelow10 = { name: `Auto <10 Days Natham (${bBelow10.length} VAO apps)`, rows: rBelow10, period: `APPLICATION FROM: ${fromDate} TO: ${toDate}` };

        window.store['nisd_1_0'] = d12;
        window.store['nisd_1_1'] = d10;
        window.store['nisd_1_2'] = dBelow10;

        const nisd1DetailObj = {
          name: `Auto NISD Natham (${vaoApps.length} VAO apps)`,
          header: ['Village Name', 'Application Date', 'Pending At', 'RTR-STR', 'Application Status'],
          objs: vaoApps.map(app => ({
            'Village Name': (app.village_name || app.village || 'Unknown').trim(),
            'Application Date': app.appl_date || app.appl_dt || '',
            'Pending At': app.role_name || app.pending_at || 'VAO',
            'RTR-STR': 'STR',
            'Application Status': 'Pending'
          }))
        };
        window.store['nisd_1'] = nisd1DetailObj;

        if (typeof window.markLoaded === 'function') {
          window.markLoaded('nisd_1_0', d12.name, r12.length, false);
          window.markLoaded('nisd_1', nisd1DetailObj.name, nisd1DetailObj.objs.length, false);
          window.markLoaded('nisd_1_1', d10.name, r10.length, false);
          window.markLoaded('nisd_1_2', dBelow10.name, rBelow10.length, false);
        }

        if (typeof window.saveToCloud === 'function') {
          await window.saveToCloud('nisd_1_0', new Blob([JSON.stringify(d12)], {type:'application/json'}), d12).catch(()=>{});
          await window.saveToCloud('nisd_1_1', new Blob([JSON.stringify(d10)], {type:'application/json'}), d10).catch(()=>{});
          await window.saveToCloud('nisd_1_2', new Blob([JSON.stringify(dBelow10)], {type:'application/json'}), dBelow10).catch(()=>{});
        }
        summaryStats.push(`NISD Natham: ${vaoApps.length} VAO apps`);
      }

      // 4. Process ISD Natham (Surveyor & VAO)
      if (isdNathamRes.success && Array.isArray(isdNathamRes.applications)) {
        const rawApps = isdNathamRes.applications;
        const isdGroup = groupAppsByVillageForISD(rawApps);
        const dataNatham = {
          name: `Auto ISD Natham (${rawApps.length} apps)`,
          header: ['Village Name', 'Application Date', 'Pending At', 'Application Status'],
          objs: rawApps.map(a => ({
            'Village Name': (a.village_name || a.village || 'Unknown').trim(),
            'Application Date': a.appl_date || a.appl_dt || '',
            'Pending At': a.role_name || a.pending_at || 'Surveyor',
            'Application Status': 'Pending'
          })),
          rows: isdGroup.rows,
          footer: isdGroup.footer
        };
        window.store['isdNatham'] = dataNatham;
        if (typeof window.markLoaded === 'function') {
          window.markLoaded('isdNatham', dataNatham.name, isdGroup.rows.length, false);
        }
        if (typeof window.saveToCloud === 'function') {
          await window.saveToCloud('isdNatham', new Blob([JSON.stringify(dataNatham)], {type:'application/json'}), dataNatham).catch(()=>{});
        }
        summaryStats.push(`ISD Natham: ${rawApps.length} apps`);
      }

      // 5. Process F-Line Rural
      if (flineRuralRes.success && Array.isArray(flineRuralRes.applications)) {
        const rawApps = flineRuralRes.applications;
        const vMap = new Map();
        rawApps.forEach(a => { const v = (a.village_name || 'Unknown').trim(); vMap.set(v, (vMap.get(v) || 0) + 1); });
        const dataFlr = {
          name: `Auto F-Line Rural (${rawApps.length} apps)`,
          header: ['Village Name', 'Application Date', 'Application Status'],
          objs: rawApps.map(a => ({
            'Village Name': (a.village_name || a.village || 'Unknown').trim(),
            'Application Date': a.appl_date || a.appl_dt || '',
            'Application Status': 'Pending'
          })),
          rows: Array.from(vMap.entries()).map(([v, c]) => ({ village: v, rtr: 0, str: c, total: c }))
        };
        window.store['flineRural'] = dataFlr;
        if (typeof window.markLoaded === 'function') {
          window.markLoaded('flineRural', dataFlr.name, dataFlr.rows.length, false);
        }
        if (typeof window.saveToCloud === 'function') {
          await window.saveToCloud('flineRural', new Blob([JSON.stringify(dataFlr)], {type:'application/json'}), dataFlr).catch(()=>{});
        }
        summaryStats.push(`F-Line Rural: ${rawApps.length} apps`);
      }

      // 6. Process F-Line Natham
      if (flineNathamRes.success && Array.isArray(flineNathamRes.applications)) {
        const rawApps = flineNathamRes.applications;
        const vMap = new Map();
        rawApps.forEach(a => { const v = (a.village_name || 'Unknown').trim(); vMap.set(v, (vMap.get(v) || 0) + 1); });
        const dataFln = {
          name: `Auto F-Line Natham (${rawApps.length} apps)`,
          header: ['Village Name', 'Application Date', 'Application Status'],
          objs: rawApps.map(a => ({
            'Village Name': (a.village_name || a.village || 'Unknown').trim(),
            'Application Date': a.appl_date || a.appl_dt || '',
            'Application Status': 'Pending'
          })),
          rows: Array.from(vMap.entries()).map(([v, c]) => ({ village: v, rtr: 0, str: c, total: c }))
        };
        window.store['flineNatham'] = dataFln;
        if (typeof window.markLoaded === 'function') {
          window.markLoaded('flineNatham', dataFln.name, dataFln.rows.length, false);
        }
        if (typeof window.saveToCloud === 'function') {
          await window.saveToCloud('flineNatham', new Blob([JSON.stringify(dataFln)], {type:'application/json'}), dataFln).catch(()=>{});
        }
        summaryStats.push(`F-Line Natham: ${rawApps.length} apps`);
      }

      if (typeof window.renderNisdDrops === 'function') window.renderNisdDrops();
      if (typeof window.renderOptDrops === 'function') window.renderOptDrops();
      if (typeof window.updateRail === 'function') window.updateRail();
      if (typeof window.render === 'function') window.render();

      showStatus(`✓ 1-Click Flash Fill Complete! ${summaryStats.join(' | ')}`, 'info');
      if (typeof window.toast === 'function') {
        window.toast('⚡ 1-Click Flash Fill Complete!', summaryStats.join('\n'), 'ok');
      }

    } catch (err) {
      console.error('Flash fill error:', err);
      showStatus(`Failed to flash fill data: ${err.message}`, 'error');
      if (typeof window.toast === 'function') {
        window.toast('Flash Fill Error', err.message, 'err');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '⚡ 1-Click Flash Fill All';
      }
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
