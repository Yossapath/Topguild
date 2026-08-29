import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// ==========================================
// MODULE: DUNGEON SYSTEM
// ==========================================
(async function initDungeonModule() {
  try {
    // ====== DUNGEON SYSTEM ======
    // ==========================================
    let dungeonData = { queues: [], teams: [] };
    window.dungeonData = dungeonData;
    window.dungeonData = dungeonData;
    let unsubDungeonListener = null;

    async function setupDungeonFirebase() {
      if (!window.db) return;
      try {
        const dungRef = doc(window.db, "guild_system", "dungeons");

        const snap = await getDoc(dungRef);
        if (!snap.exists()) {
          await setDoc(dungRef, { queues: [], teams: [] });
        }

        unsubDungeonListener = onSnapshot(dungRef, (snapshot) => {
          if (snapshot.exists()) {
            const oldSchedule = dungeonData ? dungeonData._schedule : null;
            dungeonData = snapshot.data();
            dungeonData._schedule = oldSchedule; // Preserve schedule across queue updates
            window.dungeonData = dungeonData;
            if (!dungeonData.queues) dungeonData.queues = [];
            if (!dungeonData.teams) dungeonData.teams = [];
            renderDungeonPage();
          }
        });

        // -------------------------
        // Real-time Schedule Listener
        // -------------------------
        const schedRef = doc(window.db, 'guild_system', 'dungeon_schedule');
        onSnapshot(schedRef, (snap) => {
          if (snap.exists()) {
            const s = snap.data();
            dungeonData._schedule = s || null;
            const od = document.getElementById('dqOpenDate');
            const ot = document.getElementById('dqOpenTime');
            const ct = document.getElementById('dqCloseTime');
            if (s && (s.openDate || s.openTime)) {
              if (od) od.value = s.openDate || '';
              if (ot) ot.value = s.openTime || '06:00';
              if (ct) ct.value = s.closeTime || '23:59';
            } else {
              if (ot && !ot.value) ot.value = '06:00';
              if (ct && !ct.value) ct.value = '23:59';
            }
            if (typeof renderDungeonScheduleStatus === 'function') {
              renderDungeonScheduleStatus(window.isUserAdmin && window.isUserAdmin());
            }
          }
        });
      } catch (e) {
        console.error(e);
      }
    }

    async function saveDungeonState() {
      if (!window.db) return;
      const dungRef = doc(window.db, "guild_system", "dungeons");
      window.dungeonData = dungeonData;
      await setDoc(dungRef, dungeonData);
    }

    
    window.updateDungeonScoreDisplay = function(nameStr) {
      var display = document.getElementById('dqScoreDisplay');
      if (!display) return;
      var name = (nameStr || '').trim();
      if (!name) {
        display.style.display = 'none';
        return;
      }
      if (typeof window.getUserScore === 'function') {
        var score = window.getUserScore(name);
        var color = score < 0 ? 'var(--danger)' : 'var(--ok)';
        var text = score <= -2 ? ' (ไม่มีสิทธิ์จองคิว)' : '';
        display.innerHTML = 'คะแนนกิจกรรม: <span style="color:' + color + ';">' + score + text + '</span>';
        display.style.display = 'block';
      }
    };

    var dqNameEl = document.getElementById('dqName');
    if (dqNameEl) {
      dqNameEl.addEventListener('input', function(e) {
        window.updateDungeonScoreDisplay(e.target.value);
      });
    }

    window.bookDungeonQueue = async function () {
      if (!window.currentUser)
        return window.showToast("กรุณาเข้าสู่ระบบ", "error");
      const name = document.getElementById("dqName").value.trim();
      const job = document.getElementById("dqClass").value;
      const dungeon = document.getElementById("dqDungeon").value;

      if (!name || !job || !dungeon)
        return window.showToast("กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ / อาชีพ / ดันเจี้ยน)", "warning");

      // ตรวจสอบว่าชื่อมีในระบบกิลด์
      let nameInRoster = false;
      if (window.guildRoster) {
        for (const j in window.guildRoster) {
          if ((window.guildRoster[j] || []).some(m => m.name?.trim().toLowerCase() === name.toLowerCase())) {
            nameInRoster = true;
            break;
          }
        }
      }
      if (!nameInRoster) {
        return window.showToast("ชื่อนี้ไม่มีในระบบกิลด์ กรุณาเลือกจากรายชื่อ", "error");
      }

      // ตรวจสอบคะแนนกิจกรรม
      if (window.getUserScore) {
        const score = window.getUserScore(name);
        if (score <= -2) {
          await window.UI.alert(
            "❌ ไม่มีสิทธิ์จองคิวลงดันเจี้ยน!\n\n(คะแนนกิจกรรม: " +
              score +
              " คะแนน)\n\nเพื่อปลดโทษ กรุณาทำคะแนนให้มากกว่าหรือเท่ากับ 0 โดยการเข้าร่วมกิจกรรม",
          );
          return;
        }
      }

      // เช็คซ้ำ: scope เฉพาะ dungeon ที่กำลังจอง (ไม่ใช่ทั้งหมด)
      const isAlreadyInQueue = dungeonData.queues.some((q) =>
        q.name?.trim().toLowerCase() === name.toLowerCase() && q.dungeon === dungeon
      );
      const isAlreadyInTeam = dungeonData.teams.some((t) =>
        t.type === dungeon &&
        t.members && t.members.some((m) => m && m.name?.trim().toLowerCase() === name.toLowerCase())
      );
      if (isAlreadyInQueue || isAlreadyInTeam) {
        return window.showToast(
          `คุณได้จองคิวหรืออยู่ในทีม "${dungeon}" แล้ว หากต้องการเปลี่ยน กรุณายกเลิกก่อน`,
          "error",
        );
      }

      // Get power from roster
      let power = 0;
      if (window.guildRoster && window.guildRoster[job]) {
        const found = window.guildRoster[job].find(
          (m) => m.name?.toLowerCase() === name.toLowerCase(),
        );
        if (found) power = found.power || 0;
      }

      dungeonData.queues.push({
        id: Date.now().toString(),
        name,
        job,
        dungeon,
        power,
        status: "waiting",

        timestamp: Date.now(),
      });

      saveDungeonState();
      if (window.writeSystemLog)
        window.writeSystemLog(
          "dungeon",
          "BOOK_QUEUE",
          name,
          dungeon,
          "จองคิวลงดันเจี้ยน อาชีพ " + job,
          null,
        );

      document.getElementById("dqName").value = "";
      window.updateDungeonScoreDisplay("");
      document.getElementById("dqClass").value = "";
      window.showToast("จองคิวสำเร็จ!", "success");
    };

    window.changeDungeonQueueStatus = function (id, newStatus) {
      const q = dungeonData.queues.find((x) => x.id === id);
      if (q) {
        q.status = newStatus;
        saveDungeonState();
      }
    };

    
    window.toggleDungeonQueueRound = function(id, roundNumber) {
      const isAdmin = typeof window.isUserAdmin === 'function' && window.isUserAdmin();
      const q = dungeonData.queues.find(x => x.id === id);
      if (q) {
        const isOwner = window.currentUser && window.currentUser.username && q.name && q.name.toLowerCase() === window.currentUser.username.toLowerCase();
        if (isAdmin || isOwner) {
          if (roundNumber === 1) q.round1 = !q.round1;
          if (roundNumber === 2) q.round2 = !q.round2;
          saveDungeonState();
        }
      }
    };
    window.deleteDungeonQueue = function (id) {
      const q = dungeonData.queues.find((x) => x.id === id);
      if (window.writeSystemLog)
        window.writeSystemLog(
          "dungeon",
          "DELETE_QUEUE",
          q ? q.name : "Unknown",
          q ? q.dungeon : "",
          "ลบคิวจอง",
          q || null,
        );
      dungeonData.queues = dungeonData.queues.filter((x) => x.id !== id);
      saveDungeonState();
    };

    window.clearDungeonTeam = async function (teamId) {
      if (
        !(await window.UI.confirm(
          "ยืนยันว่าทีมนี้ลงดันเจี้ยนสำเร็จ และต้องการเคลียร์รายชื่อทั้งหมด?",
        ))
      )
        return;
      const t = dungeonData.teams.find((x) => x.id === teamId);
      if (t) {
        const memberNames = (t.members || [])
          .filter((m) => m && m.name)
          .map((m) => m.name);
        if (window.backupDungeonData)
          window.backupDungeonData(
            "ก่อนลงสำเร็จ: ทีม " + (t.dungeonName || t.type),
          );
        const memberStr = memberNames.length > 0 ? memberNames.join(", ") : "-";
        if (window.writeSystemLog)
          window.writeSystemLog(
            "dungeon",
            "CLEAR_TEAM",
            memberStr,
            t.type,
            "ลงดันเจี้ยนสำเร็จ (ทีม " +
              (t.dungeonName || t.type) +
              ") | สมาชิก: " +
              memberStr,
            { teamId: t.id, members: JSON.parse(JSON.stringify(t.members)) },
          );
        // Auto update queue status to 'done' for all team members
        memberNames.forEach((name) => {
          const q = dungeonData.queues.find(
            (q) =>
              q.name?.toLowerCase() === name?.toLowerCase() &&
              q.dungeon === t.type &&
              q.status !== "done",
          );
          if (q) q.status = "done";
        });

        t.members = Array(t.capacity).fill(null);
        saveDungeonState();
        window.showToast("เคลียร์ทีมเรียบร้อย", "success");
      }
    };

    window.memberJoinTeam = function (teamId) {
      if (!window.currentUser)
        return window.showToast("กรุณาเข้าสู่ระบบ", "error");
      const myName = window.currentUser.username;

      // Get my job and power
      let myJob = "";
      let myPower = 0;
      if (window.guildRoster) {
        Object.keys(window.guildRoster).forEach((job) => {
          const found = (window.guildRoster[job] || []).find(
            (m) => m.name?.toLowerCase() === myName?.toLowerCase(),
          );
          if (found) {
            myJob = job;
            myPower = found.power || 0;
          }
        });
      }
      if (!myJob)
        return window.showToast(
          "ไม่พบข้อมูลอาชีพของคุณในรายชื่อสมาชิก",
          "error",
        );

      const t = dungeonData.teams.find((x) => x.id === teamId);
      if (!t) return;

      // Check if user is already in ANY team in THIS dungeon tab
      const alreadyInTeam = dungeonData.teams.some(
        (team) =>
          team.type === window.currentDungeonTab &&
          team.members.some(
            (m) => m && m.name?.toLowerCase() === myName?.toLowerCase(),
          ),
      );
      if (alreadyInTeam)
        return window.showToast("คุณอยู่ในทีมดันเจี้ยนนี้แล้ว", "warning");

      const currentMembers = t.members.filter((m) => m && m.name);
      const filledCount = currentMembers.length;
      if (filledCount >= t.capacity)
        return window.showToast("ทีมนี้เต็มแล้ว", "warning");

      const curPriest = currentMembers.filter((m) => m.job === "Priest").length;
      const curTank = currentMembers.filter(
        (m) => m.job === "Lord Knight" || m.job === "Paladin",
      ).length;
      const emptySlots = t.capacity - filledCount;

      if (window.currentDungeonTab === "มายา (Maya)") {
        if (filledCount >= 2)
          return window.showToast(
            "ทีมมายารับสมาชิกกดเข้าเองได้สูงสุด 2 คน โปรดสร้างทีมใหม่",
            "warning",
          );
        const missingPriests = Math.max(0, 1 - curPriest);
        const myContribution = myJob === "Priest" ? 1 : 0;
        if (emptySlots - 1 < missingPriests - myContribution) {
          return window.showToast(
            "ไม่สามารถเข้าได้ ทีมมายาต้องการ Priest ขั้นต่ำ 1 คน",
            "warning",
          );
        }
      } else if (window.currentDungeonTab === "บับเบิ้ล (Bubble)") {
        const missingPriests = Math.max(0, 2 - curPriest);
        const missingTanks = Math.max(0, 1 - curTank);
        let myContribution = 0;
        if (myJob === "Priest") myContribution = missingPriests > 0 ? 1 : 0;
        else if (myJob === "Lord Knight" || myJob === "Paladin")
          myContribution = missingTanks > 0 ? 1 : 0;

        if (emptySlots - 1 < missingPriests + missingTanks - myContribution) {
          return window.showToast(
            "ไม่สามารถเข้าได้ ทีมต้องการ Priest ขั้นต่ำ 2 คน และ แทงค์ขั้นต่ำ 1 คน",
            "warning",
          );
        }
      } else if (window.currentDungeonTab === "กระจก (Mirror)") {
        const missingPriests = Math.max(0, 2 - curPriest);
        const missingTanks = Math.max(0, 2 - curTank);
        let myContribution = 0;
        if (myJob === "Priest") myContribution = missingPriests > 0 ? 1 : 0;
        else if (myJob === "Lord Knight" || myJob === "Paladin")
          myContribution = missingTanks > 0 ? 1 : 0;

        if (emptySlots - 1 < missingPriests + missingTanks - myContribution) {
          return window.showToast(
            "ไม่สามารถเข้าได้ ทีมต้องการ Priest ขั้นต่ำ 2 คน และ แทงค์ขั้นต่ำ 2 คน",
            "warning",
          );
        }
      }

      const emptyIdx = t.members.findIndex((m) => !m || !m.name);
      if (emptyIdx !== -1) {
        t.members[emptyIdx] = { name: myName, job: myJob, power: myPower };

        // Auto remove from queue if they are in it
        dungeonData.queues = dungeonData.queues.filter(
          (q) =>
            q.name?.toLowerCase() !== myName?.toLowerCase() ||
            q.dungeon !== window.currentDungeonTab,
        );

        saveDungeonState();
        window.showToast("เข้าร่วมทีมสำเร็จ!", "success");
      }
    };

    window.addDungeonTeam = function (dungeonName, capacity) {
      if (!window.currentUser) return;
      const isAdmin = window.isUserAdmin();
      if (!isAdmin && window.currentDungeonTab !== "มายา (Maya)") {
        return window.showToast(
          "เฉพาะ Admin ที่สร้างทีมดันเจี้ยนอื่นได้",
          "error",
        );
      }
      const teamNum =
        dungeonData.teams.filter((t) => t.type === window.currentDungeonTab)
          .length + 1;
      dungeonData.teams.push({
        id: Date.now().toString(),
        type: window.currentDungeonTab || "มายา (Maya)",
        dungeonName,
        capacity,
        members: Array(capacity).fill(null),
      });
      if (window.writeSystemLog)
        window.writeSystemLog(
          "dungeon",
          "CREATE_TEAM",
          "",
          window.currentDungeonTab,
          "สร้างทีมดันเจี้ยน: " + dungeonName,
          null,
        );
      saveDungeonState();
    };

    window.deleteDungeonTeam = async function (id) {
      if (!window.currentUser || !window.isUserAdmin()) return;
      if (await window.UI.confirm("คุณต้องการลบทีมนี้ใช่หรือไม่?")) {
        const t = dungeonData.teams.find((x) => x.id === id);
        if (window.backupDungeonData)
          window.backupDungeonData(
            "ก่อนลบทีม: " + (t ? t.dungeonName || t.type : id),
          );
        if (window.writeSystemLog)
          window.writeSystemLog(
            "dungeon",
            "DELETE_TEAM",
            "",
            t ? t.type : "",
            "ลบทีมดันเจี้ยน: " + (t ? t.dungeonName : ""),
            null,
          );
        dungeonData.teams = dungeonData.teams.filter((x) => x.id !== id);
        saveDungeonState();
      }
    };

    window.updateDungeonTeamName = function (teamId, slotIdx, nameVal) {
      if (!window.currentUser || !window.isUserAdmin()) return;
      const t = dungeonData.teams.find((x) => x.id === teamId);
      if (!t) return;

      // Check duplicates
      if (nameVal.trim()) {
        const isDup = dungeonData.teams.some(
          (team) =>
            team.type === window.currentDungeonTab &&
            team.members.some(
              (m, idx) =>
                m &&
                m.name?.toLowerCase() === nameVal.trim()?.toLowerCase() &&
                !(team.id === teamId && idx === slotIdx),
            ),
        );
        if (isDup) {
          window.showToast("รายชื่อซ้ำ! คนนี้อยู่ในทีมแล้ว", "warning");
          if (typeof renderDungeonPage === "function") renderDungeonPage();
          return;
        }
      }
      if (!t.members[slotIdx])
        t.members[slotIdx] = { name: "", job: "", power: null };
      t.members[slotIdx].name = nameVal.trim();

      if (nameVal && window.guildRoster) {
        for (const j in window.guildRoster) {
          const found = (window.guildRoster[j] || []).find(
            (m) => m.name?.toLowerCase() === nameVal?.toLowerCase(),
          );
          if (found) {
            t.members[slotIdx].job = j;
            t.members[slotIdx].power = found.power;
            break;
          }
        }
      }
      if (
        !nameVal.trim() &&
        !t.members[slotIdx].job &&
        !t.members[slotIdx].power
      ) {
        t.members[slotIdx] = null;
      }
      saveDungeonState();
    };

    window.updateDungeonTeamJob = function (teamId, slotIdx, jobVal) {
      if (!window.currentUser || !window.isUserAdmin()) return;
      const t = dungeonData.teams.find((x) => x.id === teamId);
      if (!t) return;
      if (!t.members[slotIdx])
        t.members[slotIdx] = { name: "", job: "", power: null };
      t.members[slotIdx].job = jobVal;
      saveDungeonState();
    };

    window.updateDungeonTeamPower = function (teamId, slotIdx, powerVal) {
      if (!window.currentUser || !window.isUserAdmin()) return;
      const t = dungeonData.teams.find((x) => x.id === teamId);
      if (!t) return;
      if (!t.members[slotIdx])
        t.members[slotIdx] = { name: "", job: "", power: null };
      t.members[slotIdx].power = powerVal === "" ? null : Number(powerVal);
      saveDungeonState();
    };

    window.clearDungeonSlot = function (teamId, slotIdx) {
      if (!window.currentUser || !window.isUserAdmin()) return;
      const t = dungeonData.teams.find((x) => x.id === teamId);
      if (t) {
        const removed = t.members[slotIdx];
        if (window.writeSystemLog)
          window.writeSystemLog(
            "dungeon",
            "CLEAR_SLOT",
            removed ? removed.name : "",
            t.type,
            "ถอดผู้เล่นออกจากช่องที่ " + (slotIdx + 1),
            null,
          );
        t.members[slotIdx] = null;
        saveDungeonState();
      }
    };

    function dungeonNameSelectHtml(currentName, filterJob) {
      let list = [];
      if (window.guildRoster) {
        if (filterJob && window.guildRoster[filterJob]) {
          list = [...window.guildRoster[filterJob]];
        } else {
          Object.keys(window.guildRoster).forEach((j) => {
            list.push(...window.guildRoster[j].map((m) => ({ ...m, job: j })));
          });
        }
      }

      list.sort((a, b) => (b.power || 0) - (a.power || 0));

      let out = `<option value="" ${!currentName ? "selected" : ""}>— เลือกชื่อ —</option>`;

      if (
        currentName &&
        !list.some((m) => m.name?.toLowerCase() === currentName?.toLowerCase())
      ) {
        out += `<option value="${window.escapeHtml(currentName)}" selected>${window.escapeHtml(currentName)} ❓</option>`;
      }

      list.forEach((m) => {
        const isSelected =
          currentName && m.name?.toLowerCase() === currentName?.toLowerCase();
        const jobBadge = isSelected ? "" : ` [${m.job || filterJob}]`;
        const extraInfo = isSelected
          ? ""
          : m.power != null
            ? ` (${Number(m.power).toLocaleString("en-US")})`
            : "";
        out += `<option value="${window.escapeHtml(m.name)}" ${isSelected ? "selected" : ""}>${window.escapeHtml(m.name)}${jobBadge}${extraInfo}</option>`;
      });
      return out;
    }

    const DUNGEON_JOB_LIST = [
      "Lord Knight",
      "Paladin",
      "High Wizard",
      "Sniper",
      "Priest",
      "Champion",
      "Assassin Cross",
      "Merchant",
      "Gunslinger",
      "Druid",
    ];

    function dungeonJobSelectHtml(currentJob) {
      let out = `<option value="" ${!currentJob ? "selected" : ""}>— เลือกอาชีพ —</option>`;
      DUNGEON_JOB_LIST.forEach((j) => {
        const isSelected =
          currentJob && currentJob?.toLowerCase() === j?.toLowerCase();
        out += `<option value="${j}" ${isSelected ? "selected" : ""}>${j}</option>`;
      });
      return out;
    }

    window.currentDungeonTab = window.currentDungeonTab || "มายา (Maya)";

    window.switchDungeonTab = function (tabName) {
      window.currentDungeonTab = tabName;
      // Sync the dqDungeon dropdown
      const dq = document.getElementById("dqDungeon");
      if (dq) {
        Array.from(dq.options).forEach((opt) => {
          if (opt.value === tabName) dq.value = opt.value;
        });
      }
      // Highlight tabs
      document.querySelectorAll(".dungeon-tab").forEach((btn) => {
        btn.classList.remove("active");

        if (btn.getAttribute("data-type") === tabName) {
          btn.classList.add("active");
        }
      });
      renderDungeonPage();
    };

    function renderDungeonPage() {
      const userRole = window.currentUser
        ? (
            window.currentUser.role ||
            window.currentUser.Role ||
            ""
          )?.toLowerCase()
        : "";
      const isAdmin = window.isUserAdmin();
      const currentTab = window.currentDungeonTab || "มายา (Maya)";

      // Update create team button
      const btnCreate = document.getElementById("btnCreateDungeonTeam");
      if (btnCreate) {
        btnCreate.innerHTML = isAdmin
          ? "+ สร้างทีม" + currentTab.split(" ")[0]
          : "+ สร้างทีมใหม่";
      }

      // Show/hide admin booking panel
      const runCtrl = document.getElementById('dungeonAdminPanel');
      if (runCtrl) runCtrl.style.display = isAdmin ? 'block' : 'none';

      // Admin controls area
      const adminCtrlArea = document.getElementById('dungeonAdminControls');
      if (adminCtrlArea && isAdmin) {
        adminCtrlArea.innerHTML = '';
      }

      // ---- QUEUE PANEL ----
      const qList = document.getElementById("dqList");
      if (qList) {
        const filteredQueues = (dungeonData.queues || []).filter(
          (q) => q.dungeon === currentTab,
        );
        filteredQueues.sort((a, b) => {
          const aDone = a.status === 'done' ? 1 : 0;
          const bDone = b.status === 'done' ? 1 : 0;
          if (aDone !== bDone) return aDone - bDone;
          return (a.timestamp || 0) - (b.timestamp || 0);
        });
        const badge = document.getElementById('dqCountBadge');
        if (badge) badge.textContent = filteredQueues.filter(q => q.status !== 'done').length + ' คน';
        if (filteredQueues.length === 0) {
          qList.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; min-height:300px; color:var(--text-lo); font-size:15px; font-weight:600; background:var(--blue-50, #eff6ff); border:2px dashed var(--line); border-radius:12px; margin:16px;">
  <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px; opacity:0.3; color:var(--text-lo);"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
  <div style="opacity:0.6;">ยังไม่มีคิวในขณะนี้</div>
</div>`;
        } else {
          qList.innerHTML = filteredQueues.map((q, index) => {
            const currentTeams = dungeonData.teams.filter(t => t.type === currentTab);
            let inTeamIndex = -1;
            currentTeams.forEach((team, tIdx) => {
              if (team.members && Array.isArray(team.members)) {
                if (team.members.some(m => m && m.name && q && q.name && m.name?.toLowerCase() === q.name?.toLowerCase())) {
                  inTeamIndex = tIdx + 1;
                }
              }
            });
            let sColor, sText;
            if (inTeamIndex !== -1) {
              sColor = 'var(--blue-500)';
              sText = 'อยู่ในทีม ' + inTeamIndex;
            } else {
              sColor = q.status === 'done' ? 'var(--ok)' : q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)';
              sText = q.status === 'done' ? 'สำเร็จ' : q.status === 'active' ? 'กำลังลงดัน' : 'รอลงดัน';
            }
            const eName = window.escapeHtml ? window.escapeHtml(q.name) : q.name;
            const eJob = window.escapeHtml ? window.escapeHtml(q.job || '') : q.job || '';
            const isOwner = window.currentUser && q.name?.toLowerCase() === window.currentUser.username?.toLowerCase();
            const memberCtrl = (!isAdmin && isOwner)
              ? `<button onclick="deleteDungeonQueue('${q.id}')" style="font-size:13px;height:30px;padding:0 14px;border:1.5px solid var(--danger);background:transparent;color:var(--danger);border-radius:6px;cursor:pointer;white-space:nowrap;">ยกเลิก</button>`
              : '';
            const adminCtrl = isAdmin
              ? `<button onclick="changeDungeonQueueStatus('${q.id}','done')" style="font-size:13px;height:30px;padding:0 14px;border:none;background:var(--ok);color:white;border-radius:6px;cursor:pointer;white-space:nowrap;">ลงเสร็จ</button>
                 <button onclick="deleteDungeonQueue('${q.id}')" style="font-size:13px;height:30px;padding:0 14px;border:1.5px solid var(--danger);background:transparent;color:var(--danger);border-radius:6px;cursor:pointer;white-space:nowrap;">ลบ</button>`
              : '';
            const dragAttr = isAdmin
              ? `draggable="true" data-queue-name="${eName}" data-queue-job="${eJob}" data-queue-power="${q.power || 0}" data-queue-time="${q.timestamp || ""}"`
              : '';
            const jobColor = q.job && window.JOB_COLORS && window.JOB_COLORS[q.job] ? window.JOB_COLORS[q.job] : 'var(--text-lo)';
            const statusBorder = q.status === 'done' ? 'var(--ok)' : q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)';
            return `<div ${dragAttr} style="padding:10px 20px;border-bottom:1px solid var(--line);background:white;border-left:4px solid ${statusBorder};${isAdmin ? 'cursor:grab;' : ''}" ondragstart="window.onDungeonQueueDragStart(event)">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap;">
                <strong style="font-size:14px;font-weight:700;color:var(--text-hi);line-height:30px;white-space:nowrap;"><span style="color:var(--text-lo);margin-right:4px;">${index + 1}.</span>${eName}</strong>
                <span style="font-size:13px;color:${jobColor};font-weight:700;background:rgba(0,0,0,0.07);height:30px;padding:0 10px;border-radius:6px;display:inline-flex;align-items:center;white-space:nowrap;">${q.job || ''}</span>
                ${q.power ? '<span style="font-size:13px;color:var(--text-lo);font-weight:600;line-height:30px;white-space:nowrap;">' + Number(q.power).toLocaleString('en-US') + '</span>' : ''}
                <span style="font-size:13px;font-weight:700;color:${sColor};border:1.5px solid ${sColor};height:30px;padding:0 12px;border-radius:20px;display:inline-flex;align-items:center;white-space:nowrap;background:white;">${sText}</span>
                
                <!-- Round Buttons -->
                <div style="display:flex;gap:6px;margin-left:8px;">
                  <button onclick="window.toggleDungeonQueueRound('${q.id}', 1)" style="font-size:12px;height:30px;padding:0 12px;border:none;background:${q.round1 ? '#10b981' : '#f59e0b'};color:white;border-radius:6px;cursor:${isAdmin || isOwner ? 'pointer' : 'default'};opacity:${isAdmin || isOwner ? '1' : '0.7'};white-space:nowrap;font-weight:700;">รอบ 1</button>
                  <button onclick="window.toggleDungeonQueueRound('${q.id}', 2)" style="font-size:12px;height:30px;padding:0 12px;border:none;background:${q.round2 ? '#10b981' : '#f59e0b'};color:white;border-radius:6px;cursor:${isAdmin || isOwner ? 'pointer' : 'default'};opacity:${isAdmin || isOwner ? '1' : '0.7'};white-space:nowrap;font-weight:700;">รอบ 2</button>
                </div>
                <div style="display:flex;gap:6px;margin-left:auto;flex-shrink:0;">${adminCtrl}${memberCtrl}</div>
              </div>
              ${q.timestamp ? '<div style="font-size:11px;color:var(--text-lo);margin-top:3px;">' + new Date(q.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + ' น.</div>' : ''}
            </div>`;

          }).join('');
        }
      }

      // ---- TEAMS AREA ----
      const tArea = document.getElementById("dungeonTeamsArea");
      if (!tArea) return;

      const teamsForTab = (dungeonData.teams || []).filter(
        (t) => t.type === currentTab,
      );

      if (teamsForTab.length === 0) {
        tArea.innerHTML =
          '<div style="text-align:center;padding:40px;color:var(--text-lo);">' +
          (isAdmin
            ? "ยังไม่มีทีม กดปุ่มด้านบนเพื่อสร้างทีม"
            : "ยังไม่มีทีมในดันเจี้ยนนี้") +
          "</div>";
        return;
      }

      tArea.innerHTML = teamsForTab
        .map((t, teamIdx) => {
          let mHtml = "";
          let totalPower = 0;
          let filledCount = 0;

          const members = t.members || [];
          for (let i = 0; i < t.capacity; i++) {
            const member = members[i];
            const memberName = member
              ? typeof member === "string"
                ? member
                : member.name || ""
              : "";
            let memberJob = member
              ? typeof member === "string"
                ? ""
                : member.job || ""
              : "";
            let memberPower = member
              ? typeof member === "string"
                ? null
                : member.power || null
              : null;

            if (memberName && !memberJob && window.guildRoster) {
              for (const j in window.guildRoster) {
                const found = (window.guildRoster[j] || []).find(
                  (m) => m.name?.toLowerCase() === memberName?.toLowerCase(),
                );
                if (found) {
                  memberJob = j;
                  memberPower = found.power;
                  break;
                }
              }
            }

            if (memberName) {
              filledCount++;
              if (memberPower) totalPower += Number(memberPower);
            }

            const eName = window.escapeHtml
              ? window.escapeHtml(memberName)
              : memberName;
            const jobColor =
              memberJob && window.JOB_COLORS
                ? window.JOB_COLORS[memberJob] || "var(--text-hi)"
                : "var(--text-hi)";

            if (isAdmin) {
              mHtml += `<tr data-team-id="${t.id}" data-slot="${i}"
          ondragover="event.preventDefault();this.style.background='var(--blue-100)';"
          ondragleave="this.style.background='';"
          ondrop="window.onDungeonSlotDrop(event,'${t.id}',${i});this.style.background='';">
          <td class="cell-rank">${i + 1}</td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member"
              onchange="updateDungeonTeamName('${t.id}',${i},this.value)"
              data-team-id="${t.id}" data-slot-idx="${i}" data-action="dungeonTeam"
              value="${memberName ? eName : ""}" placeholder="พิมพ์/คลิก..." autocomplete="off"
              style="width:100%;min-width:140px;font-size:14px;padding:6px;"
              ${isAdmin ? '' : 'disabled'}>
          </td>
          <td>
            <select class="cell-input job-input ${memberJob ? "" : "empty"}" onchange="updateDungeonTeamJob('${t.id}',${i},this.value)" style="width:100%;min-width:120px;font-size:14px;padding:6px;--job-color:${jobColor};">
              ${dungeonJobSelectHtml(memberJob)}
            </select>
          </td>
          <td class="cell-action">
            <button class="clear-btn" onclick="clearDungeonSlot('${t.id}',${i})" title="ล้างช่องนี้">✕</button>
          </td>
        </tr>`;
            } else {
              mHtml += `<tr>
          <td class="cell-rank">${i + 1}</td>
          <td style="padding-left:8px;font-size:14px;color:var(--text-hi);">
            ${memberName ? eName : '<i style="color:var(--text-lo)">- ว่าง -</i>'}
          </td>
          <td style="text-align:center;font-size:14px;font-weight:600;color:${jobColor};">${memberJob || "-"}</td>
          <td></td>
        </tr>`;
            }
          }

          const pct = t.capacity > 0 ? filledCount / t.capacity : 0;
          const badgeClass = pct === 1 ? "ok" : pct > 0.5 ? "warn" : "";
          const badgeText =
            filledCount === t.capacity
              ? "ครบ " + filledCount + "/" + t.capacity
              : "ขาด " + (t.capacity - filledCount) + " คน";

          return `<div class="team-card" style="width:100%;">
      <div class="team-card-head" style="display:flex;justify-content:space-between;align-items:center;padding:12px;">
        <div class="team-title-group">
          <span style="font-size:16px;">${window.escapeHtml ? window.escapeHtml(t.dungeonName || t.type) : t.dungeonName || t.type} <span style="color:white; font-size:14px; font-weight:normal; margin-left:8px;">(ทีมที่ ${teamIdx + 1})</span></span>
          <span class="team-power-sum" style="font-size:14px;">${totalPower.toLocaleString("en-US")}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="status-badge ${badgeClass}" style="font-size:13px;padding:4px 8px;">${badgeText}</span>
          ${isAdmin ? "<button onclick=\"deleteDungeonTeam('" + t.id + '\')" style="background:transparent;border:none;color:white;cursor:pointer;font-size:16px;" title="ลบทีม">✕</button>' : ""}
        </div>
      </div>
      <div style="padding:0 8px 8px;">
        <table class="team-table" style="width:100%;table-layout:auto;">
          <thead><tr>
            <th style="width:30px;">#</th>
            <th>ชื่อ</th>
            <th style="text-align:center;">อาชีพ</th>
            <th style="width:36px;"></th>
          </tr></thead>
          <tbody>${mHtml}</tbody>
        </table>
        <div style="display:flex;gap:8px;margin-top:8px;">
          ${isAdmin ? '<button class="btn-secondary" style="flex:1;border-radius:8px;padding:6px;font-size:13px;border-color:var(--ok);color:var(--ok);" onclick="clearDungeonTeam(\'' + t.id + '\')\">ลงสำเร็จ</button>' : ""}
        </div>
      </div>
    </div>`;
        })
        .join("");
    }

    // Drag-and-drop: drag from queue panel → drop into team slot
    window.onDungeonQueueDragStart = function (event) {
      const el = event.currentTarget;
      const data = {
        name: el.dataset.queueName || "",
        job: el.dataset.queueJob || "",
        power: el.dataset.queuePower || "",
        time: el.dataset.queueTime || "",
      };
      event.dataTransfer.setData("text/plain", JSON.stringify(data));
    };

    window.onDungeonSlotDrop = function (event, teamId, slotIdx) {
      event.preventDefault();
      try {
        const data = JSON.parse(event.dataTransfer.getData("text/plain"));
        if (!data.name) return;
        const t = dungeonData.teams.find((x) => x.id === teamId);
        if (t) {
          t.members[slotIdx] = {
            name: data.name,
            job: data.job,
            power: data.power ? Number(data.power) : null,
          };
          let detailText = "จัด " + data.name + " ลงช่องที่ " + (slotIdx + 1);
          if (data.power && Number(data.power) > 0)
            detailText +=
              " | พลัง: " + Number(data.power).toLocaleString("en-US");
          if (data.time)
            detailText +=
              " | เวลาจอง: " +
              new Date(Number(data.time)).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              }) +
              " น.";
          if (window.writeSystemLog)
            window.writeSystemLog(
              "dungeon",
              "DROP_TO_TEAM",
              data.name,
              t.type,
              detailText,
              null,
            );
          saveDungeonState();
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Global Exports

    window.setupDungeonFirebase = setupDungeonFirebase;
    window.renderDungeonPage = renderDungeonPage;
    // ==========================================

    // Initialize
    if (typeof setupDungeonFirebase === "function" && !window._dungeonReady) {
      window._dungeonReady = true;
      await setupDungeonFirebase();
    }
    // ====== DUNGEON BOOKING SCHEDULE ======
    window.saveDungeonSchedule = async function() {
      if (!window.isUserAdmin || !window.isUserAdmin()) return;
      const openDate = document.getElementById('dqOpenDate')?.value || '';
      const openTime = document.getElementById('dqOpenTime')?.value || '';
      const closeTime = document.getElementById('dqCloseTime')?.value || '';
      if (!openDate || !openTime || !closeTime) return window.showToast('กรุณากรอกวันที่และเวลาให้ครบ', 'error');
      try {
        const scheduleRef = doc(window.db, 'guild_system', 'dungeon_schedule');
        await setDoc(scheduleRef, { openDate, openTime, closeTime, updatedAt: Date.now() });
        dungeonData._schedule = { openDate, openTime, closeTime };
        window.showToast('บันทึกตั้งค่าช่วงเวลาเปิดจองเรียบร้อยแล้ว', 'success');
        if (typeof renderDungeonScheduleStatus === 'function') renderDungeonScheduleStatus(true);
      } catch(e) { window.showToast('เกิดข้อผิดพลาด', 'error'); }
    };

    window.clearDungeonSchedule = async function() {
      if (!window.isUserAdmin || !window.isUserAdmin()) return;
      try {
        const scheduleRef = doc(window.db, 'guild_system', 'dungeon_schedule');
        await setDoc(scheduleRef, { openDate: '', openTime: '', closeTime: '' });
        dungeonData._schedule = null;
        window.showToast('เปิดจองไม่จำกัดเวลาแล้ว', 'success');
        if (typeof renderDungeonScheduleStatus === 'function') renderDungeonScheduleStatus(window.isUserAdmin && window.isUserAdmin());
      } catch(e) { window.showToast('เกิดข้อผิดพลาด', 'error'); }
    };

    function renderDungeonScheduleStatus(isAdmin) {
      const statusEl = document.getElementById('dqScheduleStatus');
      const bookBtn = document.getElementById('btnBookDungeon');
      if (!statusEl) return;
      const sched = dungeonData._schedule;
      if (!sched || !sched.openDate || !sched.openTime || !sched.closeTime) {
        statusEl.style.display = 'none';
        if (bookBtn) { bookBtn.disabled = false; bookBtn.style.opacity = '1'; }
        return;
      }
      const now = new Date();
      const nowDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
      const nowTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' });
      // Handle midnight/23:59 as end of day
      const effectiveClose = sched.closeTime === '24:00' ? '23:59' : sched.closeTime;
      const isOpen = nowDateStr === sched.openDate && nowTimeStr >= sched.openTime && nowTimeStr <= effectiveClose;
      if (isOpen) {
        statusEl.style.cssText = 'display:block;background:rgba(22,163,74,0.12);color:var(--ok);border:1px solid var(--ok);padding:10px 14px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:12px;';
        statusEl.textContent = 'เปิดรับจองอยู่ (ถึง ' + sched.closeTime + ' น.)';
        if (bookBtn) { bookBtn.disabled = false; bookBtn.style.opacity = '1'; }
      } else {
        statusEl.style.cssText = 'display:block;background:rgba(239,68,68,0.08);color:var(--danger);border:1px solid var(--danger);padding:10px 14px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:12px;';
        const futureOpen = nowDateStr < sched.openDate || (nowDateStr === sched.openDate && nowTimeStr < sched.openTime);
        statusEl.textContent = futureOpen
          ? 'จะเปิดจองวันที่ ' + sched.openDate + ' เวลา ' + sched.openTime + '–' + sched.closeTime + ' น.'
          : 'ปิดรับการจองแล้ว';
        if (bookBtn && !isAdmin) { bookBtn.disabled = true; bookBtn.style.opacity = '0.5'; }
      }
    }
    window.renderDungeonScheduleStatus = renderDungeonScheduleStatus;



  } catch (err) {
    console.error("[Module Dungeon] ระบบดันเจี้ยนมีปัญหา:", err);
    const area = document.getElementById("dungeonTeamsArea");
    if (area)
      area.innerHTML =
        '<div style="padding:24px;text-align:center;color:var(--danger);">ระบบดันเจี้ยนขัดข้อง กรุณารีเฟรชหน้าจอ</div>';
  }
})();
