/* ============================================================
   Tamil Nilam NISD Rural Automation Controller
   ============================================================ */
(function() {
  if (window.__tnAutoInitialized) return;
  window.__tnAutoInitialized = true;

  let currentReportData = null;
  let currentMode = 'details';

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

  function createModalHtml() {
    const villageOptions = NEMILI_VILLAGES.map(v => `<option value="${v.code}">${v.name}</option>`).join('');

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
                    <option value="37" selected>Ranipet(37)</option>
                    <option value="03">Kancheepuram(03)</option>
                    <option value="04">Vellore(04)</option>
                    <option value="06">Tiruvannamalai(06)</option>
                    <option value="36">Tirupathur(36)</option>
                    <option value="01">Tiruvallur(01)</option>
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnTalukSel">Taluk</label>
                  <select id="tnTalukSel">
                    <option value="12" selected>Nemili(12)</option>
                    <option value="03">Arakkonam(03)</option>
                    <option value="02">Arcot(02)</option>
                    <option value="13">Kalavai(13)</option>
                    <option value="14">Sholinghur(14)</option>
                    <option value="04">Walajah(04)</option>
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
                    <button type="button" class="tn-quick-btn" data-range="screenshot">Screenshot dates</button>
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
                <div id="tnApplyWrap" style="display:none; align-items:center; gap:8px;">
                  <select id="tnSlotSel" style="font-size:12px; padding:6px 10px; border-radius:7px; border:1px solid #a855f7;">
                    <option value="nisd0">NISD Range 1 (12 Days)</option>
                    <option value="nisd1">NISD Range 2 (10 Days)</option>
                    <option value="nisd2">NISD Range 3 (&lt;10 Days)</option>
                  </select>
                  <button type="button" class="tn-btn-apply" id="tnBtnApply">⚡ Load into Dashboard</button>
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
              <span style="font-size: 11.5px; color: var(--muted); margin-left: 6px;">Pull directly from Tamil Nilam portal without manual downloads</span>
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

    function openModal() {
      if (backdrop) backdrop.classList.add('open');
      populateSlots();
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

    document.querySelectorAll('.tn-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const range = btn.dataset.range;
        const to = new Date();
        let from = new Date();

        if (range === 'screenshot') {
          document.getElementById('tnFromDate').value = '31-08-2026';
          document.getElementById('tnToDate').value = '10-09-2026';
          document.getElementById('tnVillageSel').value = '109';
          return;
        } else if (range === '12') {
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

  function populateSlots() {
    const slotSel = document.getElementById('tnSlotSel');
    if (!slotSel) return;
    const slots = window.NISD_SLOTS || [];
    if (slots.length) {
      slotSel.innerHTML = slots.map((s, i) => `<option value="${s.key}">Slot ${i + 1} (${s.label || s.key})</option>`).join('');
    }
  }

  async function handleFetch() {
    const statusBanner = document.getElementById('tnStatusBanner');
    const reportArea = document.getElementById('tnReportArea');
    const excelBtn = document.getElementById('tnBtnExcel');
    const applyWrap = document.getElementById('tnApplyWrap');

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

    const targetDesc = villageCode ? `village (${document.getElementById('tnVillageSel').selectedOptions[0].text})` : 'all villages';
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
        populateSlots();
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
        html += `
          <tr>
            <td class="align-center">${idx + 1}</td>
            <td>${esc(app.district_name || 'Ranipet')}</td>
            <td>${esc(app.taluk_name || 'Nemili')}</td>
            <td><b>${esc(app.village_name || '')}</b></td>
            <td style="font-family: monospace; font-weight: 600;">${esc(app.appl_id || '')}</td>
            <td class="align-center">${esc(app.survey_no_dis || app.survey_no || '')}</td>
            <td style="font-size: 11px;">${esc(app.survey_subdivno || '')}</td>
            <td class="align-center"><span class="tn-badge-role vao">${esc(role)}</span></td>
            <td class="align-center"><b>${esc(app.rtr_str || '')}</b></td>
            <td class="align-center">${esc(app.appl_date || '')}</td>
            <td class="align-right"><b>${esc(app.total_pending || '')}</b></td>
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

    const distCode = document.getElementById('tnDistSel').value;
    const talukCode = document.getElementById('tnTalukSel').value;
    const fromDate = document.getElementById('tnFromDate').value.trim();
    const toDate = document.getElementById('tnToDate').value.trim();
    const slotSel = document.getElementById('tnSlotSel');
    const slotKey = (slotSel && slotSel.value) || (window.NISD_KEYS && window.NISD_KEYS[0]) || 'nisd0';

    try {
      showStatus(`Fetching NISD range dataset for slot ${slotKey}...`, 'info');

      const res = await fetch(`/api/nisd-rural?distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&mode=nisd-range`);
      const rangeData = await res.json();

      if (!rangeData.success || !rangeData.rows) {
        throw new Error('Could not format data into NISD range rows.');
      }

      // Ensure store exists
      if (!window.store) {
        window.store = {};
      }

      const parsedData = {
        name: `Tamil Nilam Auto (${fromDate} to ${toDate})`,
        rows: rangeData.rows,
        footer: null,
        period: rangeData.period,
        asOn: rangeData.asOn
      };

      window.store[slotKey] = parsedData;

      if (typeof window.markLoaded === 'function') {
        window.markLoaded(slotKey, parsedData.name, parsedData.rows.length, false);
      }
      if (typeof window.renderNisdDrops === 'function') window.renderNisdDrops();
      if (typeof window.updateRail === 'function') window.updateRail();
      if (typeof window.render === 'function') window.render();

      showStatus(`✓ Successfully loaded ${rangeData.rows.length} villages into Dashboard (${slotKey})!`, 'info');
      if (typeof window.toast === 'function') {
        window.toast('Loaded into Dashboard', `${rangeData.rows.length} villages assigned to ${slotKey}`, 'ok');
      }

      setTimeout(() => {
        const backdrop = document.getElementById('tnModalBackdrop');
        if (backdrop) backdrop.classList.remove('open');
      }, 1500);

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
