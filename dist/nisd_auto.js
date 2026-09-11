/* ============================================================
   Tamil Nilam NISD Rural Automation Controller
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
    { code: "030", name: "Alappakkam (030)" },
    { code: "121", name: "Asanellikuppam (121)" },
    { code: "042", name: "Athipattu (042)" },
    { code: "046", name: "Avalur (046)" },
    { code: "038", name: "Ayarpadi (038)" },
    { code: "032", name: "Cherri (032)" },
    { code: "143", name: "Dharmaneedhi (143)" },
    { code: "065", name: "Elathur (065)" },
    { code: "036", name: "Eralacherry (036)" },
    { code: "114", name: "Jagirthandalam (114)" },
    { code: "047", name: "Kalathur (047)" },
    { code: "123", name: "Kariakudal (123)" },
    { code: "045", name: "Karivedu (045)" },
    { code: "022", name: "Karnavur (022)" },
    { code: "033", name: "Kattalai (033)" },
    { code: "063", name: "Kattupakkam (063)" },
    { code: "034", name: "Kaveripakkam (034)" },
    { code: "101", name: "Keelandurai (101)" },
    { code: "106", name: "Keelkalathur (106)" },
    { code: "058", name: "Keelveedhi (058)" },
    { code: "124", name: "Keelvenkatapuram (124)" },
    { code: "116", name: "Keelvenpakkam (116)" },
    { code: "060", name: "Kodampakkam (060)" },
    { code: "041", name: "Kondapuram (041)" },
    { code: "031", name: "Maganipattu (031)" },
    { code: "061", name: "Mahendravadi (061)" },
    { code: "044", name: "Mamandoor (044)" },
    { code: "094", name: "Melanthurai (094)" },
    { code: "051", name: "Melapulam (051)" },
    { code: "059", name: "Melari (059)" },
    { code: "064", name: "Melkalathur (064)" },
    { code: "100", name: "Nagavedu (100)" },
    { code: "052", name: "Nangamangalam (052)" },
    { code: "054", name: "Nedumpuli (054)" },
    { code: "119", name: "Nelvoy (119)" },
    { code: "122", name: "Nemili (122)" },
    { code: "105", name: "Ochalam (105)" },
    { code: "039", name: "Ocheri (039)" },
    { code: "053", name: "Panappakkam (053)" },
    { code: "026", name: "Panniyur (026)" },
    { code: "057", name: "Perapperi (057)" },
    { code: "049", name: "Perumpulipakkam (049)" },
    { code: "029", name: "Peruvalayam (029)" },
    { code: "050", name: "Poigainallur (050)" },
    { code: "027", name: "Puduppattu (027)" },
    { code: "107", name: "Punnai (107)" },
    { code: "111", name: "Reddivalam (111)" },
    { code: "048", name: "Sangarampadi (048)" },
    { code: "125", name: "Sayanavaram (125)" },
    { code: "066", name: "Silamandai (066)" },
    { code: "040", name: "Sirukarumpur (040)" },
    { code: "104", name: "Sirunamalli (104)" },
    { code: "028", name: "Siruvalayam (028)" },
    { code: "120", name: "S.Kulathur (120)" },
    { code: "112", name: "Thenmambakkam (112)" },
    { code: "117", name: "Thirumalpoor (117)" },
    { code: "035", name: "Thuraiperumpakkam (035)" },
    { code: "055", name: "Thuraiyur (055)" },
    { code: "056", name: "Uliyanallur (056)" },
    { code: "037", name: "Uthirampattu (037)" },
    { code: "043", name: "Vegamangalam (043)" },
    { code: "062", name: "Velithangipuram (062)" },
    { code: "113", name: "Veliyanallur (113)" },
    { code: "108", name: "Vepperi (108)" },
    { code: "110", name: "Vettankulam (110)" }
  ];

  const talukCache = new Map();
  talukCache.set("37", INITIAL_RANIPET_TALUKS);

  const villageCache = new Map();
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
                  <div class="tn-quick-dates">
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
              <b style="font-size: 13px;">Automate NISD Rural Data</b>
              <span style="font-size: 11.5px; color: var(--muted); margin-left: 6px;">Pull directly from Tamil Nilam portal with automatic 12d / 10d / &lt;10d date sorting</span>
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

    if (distSel) {
      distSel.addEventListener('change', onDistrictChange);
    }
    if (talukSel) {
      talukSel.addEventListener('change', onTalukChange);
    }

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

    if (submitBtn) submitBtn.addEventListener('click', handleFetch);
    if (excelBtn) excelBtn.addEventListener('click', handleExportExcel);
    if (applyBtn) applyBtn.addEventListener('click', handleApplyToDashboard);
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
    currentMode = mode;

    if (!fromDate || !toDate) {
      showStatus('Please specify both From Date and To Date.', 'error');
      return;
    }

    const targetDesc = villageCode
      ? `village (${document.getElementById('tnVillageSel').selectedOptions[0].text})`
      : 'all villages';
    showStatus(`Connecting to Tamil Nilam & fetching live report for ${targetDesc}...`, 'info');
    reportArea.style.display = 'none';
    excelBtn.style.display = 'none';
    if (applyWrap) applyWrap.style.display = 'none';

    try {
      const url = `/api/nisd-rural?distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&villageCode=${encodeURIComponent(villageCode)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&mode=${encodeURIComponent(mode)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch report');
      }

      currentReportData = data;
      hideStatus();

      if (mode === 'details') {
        renderDetailsTable(data);
      } else {
        renderSummaryTable(data);
      }

      reportArea.style.display = 'block';
      excelBtn.style.display = 'inline-block';

      if (applyWrap) {
        applyWrap.style.display = 'inline-flex';
        const apps = data.applications || [];
        const b12 = apps.filter(a => calculatePendingDays(a) > 12).length;
        const b10 = apps.filter(a => { const d = calculatePendingDays(a); return d > 10 && d <= 12; }).length;
        const bBelow10 = apps.filter(a => calculatePendingDays(a) <= 10).length;

        if (bucketSummary) {
          bucketSummary.style.display = 'inline-flex';
          bucketSummary.innerHTML = `Breakdown: <b>${b12}</b> &gt;12d &bull; <b>${b10}</b> 10-12d &bull; <b>${bBelow10}</b> &le;10d`;
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

  function renderDetailsTable(data) {
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
        if (pendDays > 12) badgeColor = '#ef4444';
        else if (pendDays > 10) badgeColor = '#f59e0b';

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

  function renderSummaryTable(data) {
    const tableWrap = document.getElementById('tnTableWrap');
    const villages = (data.data && data.data.distarr) || (data.summary && data.summary.distarr) || [];
    const period = data.period || 'OPT APPLICATION PENDING REPORT';
    const asOn = data.asOn || '';

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

    const apps = currentReportData.applications || [];
    if (!apps.length) {
      showStatus('No individual applications found to distribute into date buckets. Make sure Report Format is set to "Detailed Applications".', 'error');
      return;
    }

    const fromDate = document.getElementById('tnFromDate').value.trim();
    const toDate = document.getElementById('tnToDate').value.trim();
    const period = currentReportData.period || `OPT APPLICATION FROM: ${fromDate} TO: ${toDate}`;
    const asOn = currentReportData.asOn ? `AND PENDING AS ON: ${currentReportData.asOn}` : '';

    try {
      showStatus('Calculating application pendency & sorting into 12d / 10d / <10d buckets...', 'info');

      const bucket12 = [];
      const bucket10 = [];
      const bucketBelow10 = [];

      apps.forEach(app => {
        const days = calculatePendingDays(app);
        if (days > 12) {
          bucket12.push(app);
        } else if (days > 10) {
          bucket10.push(app);
        } else {
          bucketBelow10.push(app);
        }
      });

      const rows12 = groupAppsByVillage(bucket12);
      const rows10 = groupAppsByVillage(bucket10);
      const rowsBelow10 = groupAppsByVillage(bucketBelow10);

      if (!window.store) {
        window.store = {};
      }

      const data12 = {
        name: `Auto 12 Days (${bucket12.length} apps)`,
        rows: rows12,
        footer: null,
        period,
        asOn
      };
      const data10 = {
        name: `Auto 10 Days (${bucket10.length} apps)`,
        rows: rows10,
        footer: null,
        period,
        asOn
      };
      const dataBelow10 = {
        name: `Auto <10 Days (${bucketBelow10.length} apps)`,
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

      showStatus(`✓ Auto-loaded: ${bucket12.length} apps into 12 Days, ${bucket10.length} apps into 10 Days, ${bucketBelow10.length} apps into <10 Days!`, 'info');
      if (typeof window.toast === 'function') {
        window.toast('Dashboard Loaded', `>12d: ${bucket12.length} | 10-12d: ${bucket10.length} | ≤10d: ${bucketBelow10.length}`, 'ok');
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
