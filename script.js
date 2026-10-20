// Student Feedback Management System - Interactive Logic & MongoDB Sync
const state = {
	currentUser: null,
	students: [],
	myFeedbacks: [],
	allAdminFeedbacks: [],
	adminAnalytics: null,
	activeFilter: "all",
	adminFilterStatus: "all",
	activeView: "peer-students",
	targetStudent: null,
	currentRatings: {
		teamwork: 0,
		communication: 0,
		punctuality: 0,
		technical: 0,
		leadership: 0
	},
	courseFeedbacks: []
};

const ratingLabels = {
	1: "1 · Poor",
	2: "2 · Fair",
	3: "3 · Good",
	4: "4 · Very Good",
	5: "5 · Excellent"
};

// DOM References
const el = {
	authView: document.getElementById("auth-view"),
	appView: document.getElementById("app-view"),
	authForm: document.getElementById("auth-form"),
	authTitle: document.getElementById("auth-title"),
	authSubtitle: document.getElementById("auth-subtitle"),
	authEyebrow: document.getElementById("auth-eyebrow"),
	authMessage: document.getElementById("auth-message"),
	authSubmit: document.getElementById("auth-submit"),
	authSwitch: document.getElementById("auth-switch"),
	authSwitchLabel: document.getElementById("auth-switch-label"),
	nameField: document.getElementById("name-field"),
	emailInput: document.getElementById("email"),
	passwordInput: document.getElementById("password"),
	fullNameInput: document.getElementById("full-name"),

	// Navigation
	navPeerStudents: document.getElementById("nav-peer-students"),
	navMyReviews: document.getElementById("nav-my-reviews"),
	navAdminAnalytics: document.getElementById("nav-admin-analytics"),
	navAdminAllFeedbacks: document.getElementById("nav-admin-all-feedbacks"),
	navCourseFeedback: document.getElementById("nav-course-feedback"),
	adminNavItems: document.querySelectorAll(".nav-admin-item"),
	studentNavItems: document.querySelectorAll(".student-nav-item"),

	// Topbar & Profile
	avatar: document.getElementById("avatar"),
	profileName: document.getElementById("profile-name"),
	profileRole: document.getElementById("profile-role"),
	topbarRoleBadge: document.getElementById("topbar-role-badge"),
	topbarDate: document.getElementById("topbar-date"),
	breadcrumbCurrent: document.getElementById("breadcrumb-current"),
	signOutBtn: document.getElementById("sign-out"),
	toast: document.getElementById("toast-message"),

	// Views
	viewPeerStudents: document.getElementById("view-peer-students"),
	viewMyReviews: document.getElementById("view-my-reviews"),
	viewAdminAnalytics: document.getElementById("view-admin-analytics"),
	viewAdminAllFeedbacks: document.getElementById("view-admin-all-feedbacks"),
	viewCourseFeedback: document.getElementById("view-course-feedback"),

	// Peer Feedback Roster Elements
	studentsGrid: document.getElementById("students-grid"),
	studentsEmpty: document.getElementById("students-empty"),
	searchStudents: document.getElementById("search-students"),
	rosterFilterTabs: document.getElementById("roster-filter-tabs"),
	countAllStudents: document.getElementById("count-all-students"),
	countPendingStudents: document.getElementById("count-pending-students"),
	countCompletedStudents: document.getElementById("count-completed-students"),
	reviewedRatio: document.getElementById("reviewed-ratio"),
	progressText: document.getElementById("progress-text"),
	progressPercentage: document.getElementById("progress-percentage"),
	peerProgressBar: document.getElementById("peer-progress-bar"),
	navPeerCount: document.getElementById("nav-peer-count"),
	navMyReviewsCount: document.getElementById("nav-my-reviews-count"),

	// Peer Evaluation Modal
	peerModal: document.getElementById("peer-modal"),
	modalCloseBtn: document.getElementById("modal-close-btn"),
	modalCancelBtn: document.getElementById("modal-cancel-btn"),
	peerFeedbackForm: document.getElementById("peer-feedback-form"),
	modalTargetRoll: document.getElementById("modal-target-roll"),
	modalStudentAvatar: document.getElementById("modal-student-avatar"),
	modalStudentName: document.getElementById("modal-student-name"),
	modalStudentRoll: document.getElementById("modal-student-roll"),
	modalStudentSection: document.getElementById("modal-student-section"),
	modalStudentEmail: document.getElementById("modal-student-email"),
	modalAverageScore: document.getElementById("modal-average-score"),
	modalScoreDescriptor: document.getElementById("modal-score-descriptor"),
	modalComment: document.getElementById("modal-comment"),
	modalSubmitBtn: document.getElementById("modal-submit-btn"),
	modalErrorMsg: document.getElementById("modal-error-msg"),

	// My Reviews List
	myReviewsList: document.getElementById("my-reviews-list"),
	myReviewsEmpty: document.getElementById("my-reviews-empty"),
	goToRosterBtn: document.getElementById("go-to-roster-btn"),

	// Admin Elements
	kpiTotalStudents: document.getElementById("kpi-total-students"),
	kpiTotalFeedbacks: document.getElementById("kpi-total-feedbacks"),
	kpiClassAvg: document.getElementById("kpi-class-avg"),
	kpiEvaluatedStudents: document.getElementById("kpi-evaluated-students"),
	generateAiSummaryBtn: document.getElementById("generate-ai-summary-btn"),
	aiSummaryResult: document.getElementById("ai-summary-result"),
	analyticsTableBody: document.getElementById("analytics-table-body"),
	searchAnalytics: document.getElementById("search-analytics"),
	searchAdminFeedbacks: document.getElementById("search-admin-feedbacks"),
	adminFilterStatus: document.getElementById("admin-filter-status"),
	adminFeedbacksList: document.getElementById("admin-feedbacks-list"),
	clearPeerFeedbackBtn: document.getElementById("clear-peer-feedback-btn"),
	adminExportCsvBtn: document.getElementById("admin-export-csv-btn"),
	adminExportCsvBtn2: document.getElementById("admin-export-csv-btn-2"),
	navAdminFeedbacksCount: document.getElementById("nav-admin-feedbacks-count"),

	// Detail Modal
	studentDetailModal: document.getElementById("student-detail-modal"),
	detailModalClose: document.getElementById("detail-modal-close"),
	detailStudentAvatar: document.getElementById("detail-student-avatar"),
	detailStudentName: document.getElementById("detail-student-name"),
	detailStudentRoll: document.getElementById("detail-student-roll"),
	detailStudentSection: document.getElementById("detail-student-section"),
	detailReviewsContainer: document.getElementById("detail-reviews-container"),

	// Course Feedback
	newCourseFeedbackBtn: document.getElementById("new-course-feedback-btn"),
	courseComposer: document.getElementById("course-composer"),
	closeCourseComposer: document.getElementById("close-course-composer"),
	courseFeedbackForm: document.getElementById("course-feedback-form"),
	courseFeedbackList: document.getElementById("course-feedback-list"),
	courseResultsCount: document.getElementById("course-results-count"),
	courseMessage: document.getElementById("course-message"),
	navCourseCount: document.getElementById("nav-course-count")
};

let authMode = "signin";

// API Helper
async function api(path, options = {}) {
	let response;
	try {
		response = await fetch(`/api${path}`, {
			...options,
			headers: { "Content-Type": "application/json", ...options.headers },
			credentials: "same-origin"
		});
	} catch {
		throw new Error("Unable to connect to the backend server. Please verify the Node/MongoDB server is running.");
	}

	const result = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(result.error || `Server returned error (${response.status})`);
	}
	return result;
}

// Utility: Toast notifications
let toastTimeout;
function showToast(message, isError = false) {
	clearTimeout(toastTimeout);
	el.toast.textContent = message;
	el.toast.className = `toast ${isError ? "toast-error" : "toast-success"}`;
	el.toast.hidden = false;
	toastTimeout = setTimeout(() => {
		el.toast.hidden = true;
	}, 4000);
}

function showAuthMessage(msg = "", isError = false) {
	el.authMessage.textContent = msg;
	el.authMessage.className = `form-message ${isError ? "is-error" : "is-success"}`;
}

function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function formatDate(val) {
	if (!val) return "Recent";
	return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(val));
}

function getAvatarInitials(name) {
	if (!name) return "ST";
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColorClass(rollNo) {
	const num = parseInt(String(rollNo).replace(/\D/g, "") || "0", 10);
	const variants = ["avatar-c1", "avatar-c2", "avatar-c3", "avatar-c4", "avatar-c5", "avatar-c6"];
	return variants[num % variants.length];
}

// ----------------- AUTHENTICATION ----------------- //

function setAuthMode(mode) {
	authMode = mode;
	const isSignup = mode === "signup";
	el.authEyebrow.textContent = isSignup ? "JOIN OUR CLASS" : "SECURE LOGIN";
	el.authTitle.textContent = isSignup ? "Create Student Account" : "Sign in to your account";
	el.authSubtitle.textContent = isSignup ? "Register to give peer feedback for your classmates." : "Access the student feedback system and evaluate your classmates.";
	el.nameField.hidden = !isSignup;
	el.fullNameInput.required = isSignup;
	el.passwordInput.autocomplete = isSignup ? "new-password" : "current-password";
	el.authSubmit.innerHTML = isSignup ? 'Register & Sign in <span aria-hidden="true">→</span>' : 'Sign in <span aria-hidden="true">→</span>';
	el.authSwitchLabel.textContent = isSignup ? "Already have an account?" : "New to EduPeer?";
	el.authSwitch.textContent = isSignup ? "Sign in" : "Create student account";
	showAuthMessage("");
}

el.authSwitch.addEventListener("click", () => setAuthMode(authMode === "signin" ? "signup" : "signin"));

el.authForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const email = el.emailInput.value.trim();
	const password = el.passwordInput.value;
	const payload = { email, password };

	if (authMode === "signup") {
		payload.fullName = el.fullNameInput.value.trim();
	}

	el.authSubmit.disabled = true;
	showAuthMessage("Authenticating with MongoDB...");

	try {
		const res = await api(`/auth/${authMode}`, { method: "POST", body: JSON.stringify(payload) });
		el.authForm.reset();
		enterWorkspace(res.user);
	} catch (err) {
		showAuthMessage(err.message, true);
	} finally {
		el.authSubmit.disabled = false;
	}
});

el.signOutBtn.addEventListener("click", async () => {
	try {
		await api("/auth/logout", { method: "POST" });
	} catch {
		// Ignore
	}
	state.currentUser = null;
	state.students = [];
	state.myFeedbacks = [];
	el.appView.hidden = true;
	el.authView.hidden = false;
	showToast("Signed out successfully.");
});

// ----------------- WORKSPACE & NAVIGATION ----------------- //

function switchView(viewName) {
	const isAdmin = state.currentUser?.role === "admin";
	if (isAdmin && ["peer-students", "my-reviews", "course-feedback"].includes(viewName)) return;
	if (!isAdmin && ["admin-analytics", "admin-all-feedbacks"].includes(viewName)) return;

	state.activeView = viewName;

	// View elements map
	const views = {
		"peer-students": el.viewPeerStudents,
		"my-reviews": el.viewMyReviews,
		"admin-analytics": el.viewAdminAnalytics,
		"admin-all-feedbacks": el.viewAdminAllFeedbacks,
		"course-feedback": el.viewCourseFeedback
	};

	// Nav buttons map
	const navButtons = {
		"peer-students": el.navPeerStudents,
		"my-reviews": el.navMyReviews,
		"admin-analytics": el.navAdminAnalytics,
		"admin-all-feedbacks": el.navAdminAllFeedbacks,
		"course-feedback": el.navCourseFeedback
	};

	// Breadcrumb text map
	const titles = {
		"peer-students": "Classmates Roster",
		"my-reviews": "My Given Reviews",
		"admin-analytics": "Class Analytics",
		"admin-all-feedbacks": "All Peer Submissions",
		"course-feedback": "Course Feedback"
	};

	Object.keys(views).forEach((key) => {
		if (views[key]) views[key].hidden = key !== viewName;
		if (navButtons[key]) navButtons[key].classList.toggle("nav-item-active", key === viewName);
	});

	if (titles[viewName]) {
		el.breadcrumbCurrent.textContent = titles[viewName];
	}

	// Load view specific data
	if (viewName === "peer-students") loadStudents();
	if (viewName === "my-reviews") loadMyReviews();
	if (viewName === "admin-analytics") loadAdminAnalytics();
	if (viewName === "admin-all-feedbacks") loadAdminFeedbacks();
	if (viewName === "course-feedback") loadCourseFeedback();
}

// Nav Click Listeners
el.navPeerStudents.addEventListener("click", () => switchView("peer-students"));
el.navMyReviews.addEventListener("click", () => switchView("my-reviews"));
el.navAdminAnalytics.addEventListener("click", () => switchView("admin-analytics"));
el.navAdminAllFeedbacks.addEventListener("click", () => switchView("admin-all-feedbacks"));
el.navCourseFeedback.addEventListener("click", () => switchView("course-feedback"));
el.goToRosterBtn?.addEventListener("click", () => switchView("peer-students"));

async function enterWorkspace(user) {
	state.currentUser = user;
	const isAdmin = user.role === "admin";

	// Profile display
	el.profileName.textContent = user.fullName || user.email;
	el.profileRole.textContent = isAdmin ? "Administrator" : "Student";
	el.topbarRoleBadge.textContent = isAdmin ? "Admin Mode" : "Student Mode";
	el.topbarRoleBadge.className = `role-pill ${isAdmin ? "role-pill-admin" : ""}`;
	el.avatar.textContent = getAvatarInitials(user.fullName || user.email);

	el.topbarDate.textContent = new Intl.DateTimeFormat(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric"
	}).format(new Date());

	// Admin visibility
	el.adminNavItems.forEach((btn) => {
		btn.hidden = !isAdmin;
	});
	el.studentNavItems.forEach((item) => {
		item.hidden = isAdmin;
	});

	el.authView.hidden = true;
	el.appView.hidden = false;

	if (isAdmin) {
		switchView("admin-all-feedbacks");
	} else {
		switchView("peer-students");
	}
}

// ----------------- CLASSMATES PEER FEEDBACK ----------------- //

async function loadStudents() {
	el.studentsGrid.innerHTML = `
		<div class="loading-state">
			<span class="loader"></span> Loading class roster from MongoDB...
		</div>
	`;

	try {
		const data = await api("/students");
		state.students = data.students || [];
		renderStudentsGrid();
		updateProgressBanner(data.reviewedCount || 0, data.totalCount || 0);
	} catch (err) {
		el.studentsGrid.innerHTML = `<div class="notice-error">${escapeHtml(err.message)}</div>`;
	}
}

function updateProgressBanner(reviewedCount, totalCount) {
	const pct = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;
	el.peerProgressBar.style.width = `${pct}%`;
	el.progressPercentage.textContent = `${pct}%`;
	el.reviewedRatio.textContent = `${reviewedCount} / ${totalCount}`;
	el.progressText.textContent = `You have submitted peer feedback for ${reviewedCount} of ${totalCount} classmates.`;

	el.countAllStudents.textContent = totalCount;
	el.countCompletedStudents.textContent = reviewedCount;
	el.countPendingStudents.textContent = Math.max(0, totalCount - reviewedCount);
	el.navPeerCount.textContent = totalCount;
	el.navMyReviewsCount.textContent = reviewedCount;
}

function renderStudentsGrid() {
	const query = el.searchStudents.value.trim().toLowerCase();
	const filter = state.activeFilter;

	const filtered = state.students.filter((st) => {
		// Filter by status tab
		if (filter === "pending" && st.hasReviewed) return false;
		if (filter === "completed" && !st.hasReviewed) return false;

		// Search match
		if (!query) return true;
		const haystack = `${st.rollNo} ${st.name} ${st.section} ${st.email}`.toLowerCase();
		return haystack.includes(query);
	});

	if (filtered.length === 0) {
		el.studentsGrid.innerHTML = "";
		el.studentsEmpty.hidden = false;
		return;
	}

	el.studentsEmpty.hidden = true;

	el.studentsGrid.innerHTML = filtered.map((st) => {
		const avatarColor = getAvatarColorClass(st.rollNo);
		const initials = getAvatarInitials(st.name);

		let statusBadge = "";
		let actionButton = "";

		if (st.hasReviewed) {
			const myRating = st.myFeedback?.averageRating ? st.myFeedback.averageRating.toFixed(1) : "5.0";
			statusBadge = `<span class="badge-status badge-reviewed"><span>★</span> Reviewed (${myRating})</span>`;
			actionButton = `<button class="button button-secondary button-sm action-rate-btn" data-roll="${escapeHtml(st.rollNo)}">Edit Feedback</button>`;
		} else {
			statusBadge = `<span class="badge-status badge-pending">Pending Feedback</span>`;
			actionButton = `<button class="button button-primary button-sm action-rate-btn" data-roll="${escapeHtml(st.rollNo)}">Give Feedback →</button>`;
		}

		return `
			<article class="student-card ${st.hasReviewed ? "card-completed" : ""}">
				<div class="student-card-header">
					<div class="student-avatar ${avatarColor}">${initials}</div>
					<div class="student-card-info">
						<div class="student-roll-badge">${escapeHtml(st.rollNo)}</div>
						<h3 class="student-name" title="${escapeHtml(st.name)}">${escapeHtml(st.name)}</h3>
						<p class="student-section">${escapeHtml(st.section)}</p>
					</div>
				</div>

				<div class="student-card-footer">
					${statusBadge}
					${actionButton}
				</div>
			</article>
		`;
	}).join("");

	// Attach click events to rate buttons
	el.studentsGrid.querySelectorAll(".action-rate-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			const roll = btn.dataset.roll;
			const target = state.students.find((s) => s.rollNo === roll);
			if (target) openPeerModal(target);
		});
	});
}

// Student Search Input
let studentSearchTimer;
el.searchStudents.addEventListener("input", () => {
	clearTimeout(studentSearchTimer);
	studentSearchTimer = setTimeout(renderStudentsGrid, 150);
});

// Student Filter Tabs
el.rosterFilterTabs.addEventListener("click", (e) => {
	const btn = e.target.closest("[data-filter]");
	if (!btn) return;
	state.activeFilter = btn.dataset.filter;
	el.rosterFilterTabs.querySelectorAll(".filter-button").forEach((b) => b.classList.toggle("active", b === btn));
	renderStudentsGrid();
});

// ----------------- PEER EVALUATION MODAL (5 CRITERIA, 1 TO 5) ----------------- //

function openPeerModal(student) {
	state.targetStudent = student;
	el.modalTargetRoll.value = student.rollNo;
	el.modalStudentName.textContent = student.name;
	el.modalStudentRoll.textContent = student.rollNo;
	el.modalStudentSection.textContent = student.section;
	el.modalStudentEmail.textContent = student.email;
	el.modalStudentAvatar.textContent = getAvatarInitials(student.name);
	el.modalStudentAvatar.className = `modal-avatar ${getAvatarColorClass(student.rollNo)}`;

	// Pre-fill if already reviewed
	if (student.hasReviewed && student.myFeedback) {
		const fb = student.myFeedback;
		state.currentRatings = {
			teamwork: fb.ratings?.teamwork || 5,
			communication: fb.ratings?.communication || 5,
			punctuality: fb.ratings?.punctuality || 5,
			technical: fb.ratings?.technical || 5,
			leadership: fb.ratings?.leadership || 5
		};
		el.modalComment.value = fb.comment || "";
		el.modalSubmitBtn.innerHTML = 'Update Feedback <span aria-hidden="true">→</span>';
	} else {
		state.currentRatings = {
			teamwork: 0,
			communication: 0,
			punctuality: 0,
			technical: 0,
			leadership: 0
		};
		el.modalComment.value = "";
		el.modalSubmitBtn.innerHTML = 'Submit Feedback <span aria-hidden="true">→</span>';
	}

	el.modalErrorMsg.textContent = "";
	updateModalRatingsUI();
	el.peerModal.hidden = false;
	document.body.style.overflow = "hidden";
}

function closePeerModal() {
	el.peerModal.hidden = true;
	document.body.style.overflow = "";
	state.targetStudent = null;
}

el.modalCloseBtn.addEventListener("click", closePeerModal);
el.modalCancelBtn.addEventListener("click", closePeerModal);
el.peerModal.addEventListener("click", (e) => {
	if (e.target === el.peerModal) closePeerModal();
});

// Interactive 1-5 rating buttons inside modal
document.querySelectorAll(".rate-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		const criterion = btn.dataset.criterion;
		const val = parseInt(btn.dataset.value, 10);
		state.currentRatings[criterion] = val;
		updateModalRatingsUI();
	});
});

function updateModalRatingsUI() {
	const criteria = ["teamwork", "communication", "punctuality", "technical", "leadership"];
	let total = 0;
	let count = 0;

	criteria.forEach((crit) => {
		const val = state.currentRatings[crit] || 0;
		const badge = document.getElementById(`badge-${crit}`);

		if (val > 0) {
			total += val;
			count++;
			badge.textContent = ratingLabels[val] || `${val} / 5`;
			badge.className = "criterion-score-badge badge-active";
		} else {
			badge.textContent = "Select (1-5)";
			badge.className = "criterion-score-badge";
		}

		// Update button styles in bar
		const btns = document.querySelectorAll(`.rate-btn[data-criterion="${crit}"]`);
		btns.forEach((b) => {
			const bVal = parseInt(b.dataset.value, 10);
			b.classList.toggle("selected", bVal === val);
			b.classList.toggle("filled", bVal <= val);
		});
	});

	// Calculate overall average
	if (count === 5) {
		const avg = (total / 5).toFixed(1);
		el.modalAverageScore.textContent = `${avg} / 5.0`;

		let descriptor = "Average";
		let colorClass = "score-pill-neutral";
		if (avg >= 4.5) {
			descriptor = "★ Exceptional Peer Performance";
			colorClass = "score-pill-high";
		} else if (avg >= 3.8) {
			descriptor = "★ Very Strong Contributor";
			colorClass = "score-pill-good";
		} else if (avg >= 3.0) {
			descriptor = "Good Contributor";
			colorClass = "score-pill-neutral";
		} else {
			descriptor = "Needs Guidance / Development";
			colorClass = "score-pill-low";
		}

		el.modalScoreDescriptor.textContent = descriptor;
		el.modalScoreDescriptor.className = `score-pill ${colorClass}`;
	} else {
		el.modalAverageScore.textContent = count > 0 ? `${(total / count).toFixed(1)} / 5.0` : "0.0 / 5.0";
		el.modalScoreDescriptor.textContent = `${5 - count} criteria remaining to select`;
		el.modalScoreDescriptor.className = "score-pill score-pill-neutral";
	}
}

// Submit Peer Feedback Form
el.peerFeedbackForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	// Verify all 5 criteria are rated
	const criteria = ["teamwork", "communication", "punctuality", "technical", "leadership"];
	for (const crit of criteria) {
		if (!state.currentRatings[crit] || state.currentRatings[crit] < 1 || state.currentRatings[crit] > 5) {
			el.modalErrorMsg.textContent = `Please select a rating (1-5) for: ${crit.toUpperCase()}`;
			return;
		}
	}

	el.modalErrorMsg.textContent = "";
	el.modalSubmitBtn.disabled = true;

	const payload = {
		targetRollNo: el.modalTargetRoll.value,
		ratings: state.currentRatings,
		comment: el.modalComment.value.trim()
	};

	try {
		const res = await api("/peer-feedback", { method: "POST", body: JSON.stringify(payload) });
		showToast(res.message || "Feedback saved to MongoDB successfully!");
		closePeerModal();
		await loadStudents();
	} catch (err) {
		el.modalErrorMsg.textContent = err.message;
	} finally {
		el.modalSubmitBtn.disabled = false;
	}
});

// ----------------- MY GIVEN REVIEWS VIEW ----------------- //

async function loadMyReviews() {
	el.myReviewsList.innerHTML = `
		<div class="loading-state">
			<span class="loader"></span> Loading your submitted reviews...
		</div>
	`;

	try {
		const data = await api("/peer-feedback");
		state.myFeedbacks = data.feedback || [];
		renderMyReviews();
	} catch (err) {
		el.myReviewsList.innerHTML = `<div class="notice-error">${escapeHtml(err.message)}</div>`;
	}
}

function renderMyReviews() {
	if (state.myFeedbacks.length === 0) {
		el.myReviewsList.innerHTML = "";
		el.myReviewsEmpty.hidden = false;
		return;
	}

	el.myReviewsEmpty.hidden = true;
	el.myReviewsList.innerHTML = state.myFeedbacks.map((fb) => {
		const avg = (fb.averageRating || 5).toFixed(1);
		const ratings = fb.ratings || {};

		return `
			<article class="review-card">
				<div class="review-card-header">
					<div class="review-target-info">
						<span class="modal-avatar avatar-sm ${getAvatarColorClass(fb.targetRollNo)}">${getAvatarInitials(fb.targetStudentName)}</span>
						<div>
							<div class="review-target-name">${escapeHtml(fb.targetStudentName)} <span class="roll-pill">${escapeHtml(fb.targetRollNo)}</span></div>
							<div class="review-date">Submitted: ${formatDate(fb.createdAt)}</div>
						</div>
					</div>
					<div class="review-score-pill">
						<span>★ ${avg}</span> / 5.0
					</div>
				</div>

				<div class="review-criteria-grid">
					<div class="criteria-metric">
						<span class="label">Teamwork</span>
						<strong class="val">${ratings.teamwork || "-"}/5</strong>
					</div>
					<div class="criteria-metric">
						<span class="label">Communication</span>
						<strong class="val">${ratings.communication || "-"}/5</strong>
					</div>
					<div class="criteria-metric">
						<span class="label">Punctuality</span>
						<strong class="val">${ratings.punctuality || "-"}/5</strong>
					</div>
					<div class="criteria-metric">
						<span class="label">Technical</span>
						<strong class="val">${ratings.technical || "-"}/5</strong>
					</div>
					<div class="criteria-metric">
						<span class="label">Leadership</span>
						<strong class="val">${ratings.leadership || "-"}/5</strong>
					</div>
				</div>

				${fb.comment ? `<div class="review-comment-box">"${escapeHtml(fb.comment)}"</div>` : ""}
			</article>
		`;
	}).join("");
}

// ----------------- CLASS ANALYTICS ----------------- //

async function loadAdminAnalytics() {
	el.analyticsTableBody.innerHTML = `<tr><td colspan="11" class="loading-state"><span class="loader"></span> Loading class analytics from MongoDB...</td></tr>`;

	try {
		const res = await api("/admin/student-analytics");
		state.adminAnalytics = res;

		// Update KPI stats
		el.kpiTotalStudents.textContent = res.metrics?.totalStudents || 0;
		el.kpiTotalFeedbacks.textContent = res.metrics?.totalFeedbacksSubmitted || 0;
		el.kpiClassAvg.textContent = `${(res.metrics?.classAverageRating || 0).toFixed(1)} / 5.0`;
		el.kpiEvaluatedStudents.textContent = `${res.metrics?.studentsWithFeedback || 0} / ${res.metrics?.totalStudents || 0}`;

		renderAnalyticsTable();
	} catch (err) {
		el.analyticsTableBody.innerHTML = `<tr><td colspan="11" class="notice-error">${escapeHtml(err.message)}</td></tr>`;
	}
}

el.generateAiSummaryBtn.addEventListener("click", async () => {
	el.generateAiSummaryBtn.disabled = true;
	el.aiSummaryResult.hidden = false;
	el.aiSummaryResult.classList.remove("is-error");
	el.aiSummaryResult.textContent = "Generating an AI summary...";

	try {
		const result = await api("/admin/ai-summary", { method: "POST" });
		el.aiSummaryResult.textContent = result.summary;
	} catch (err) {
		el.aiSummaryResult.classList.add("is-error");
		el.aiSummaryResult.textContent = err.message;
	} finally {
		el.generateAiSummaryBtn.disabled = false;
	}
});

function renderAnalyticsTable() {
	if (!state.adminAnalytics || !state.adminAnalytics.students) return;

	const query = el.searchAnalytics.value.trim().toLowerCase();
	const students = state.adminAnalytics.students.filter((st) => {
		if (!query) return true;
		return `${st.rollNo} ${st.name} ${st.section}`.toLowerCase().includes(query);
	});

	if (students.length === 0) {
		el.analyticsTableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 25px; color: var(--muted);">No students matched your search.</td></tr>`;
		return;
	}

	el.analyticsTableBody.innerHTML = students.map((st) => {
		const cr = st.criteriaAverages || {};
		const avg = st.reviewCount > 0 ? st.overallAvg.toFixed(1) : "-";
		const badgeClass = st.reviewCount === 0 ? "score-neutral" : (st.overallAvg >= 4.0 ? "score-high" : (st.overallAvg >= 3.0 ? "score-mid" : "score-low"));

		return `
			<tr>
				<td><strong>${escapeHtml(st.rollNo)}</strong></td>
				<td>
					<div class="table-student-name">
						<span class="avatar-table ${getAvatarColorClass(st.rollNo)}">${getAvatarInitials(st.name)}</span>
						<div>
							<strong>${escapeHtml(st.name)}</strong>
							<small style="display:block; color:var(--muted); font-size:10px;">${escapeHtml(st.email)}</small>
						</div>
					</div>
				</td>
				<td><span class="section-tag">${escapeHtml(st.section)}</span></td>
				<td><span class="count-bubble">${st.reviewCount}</span></td>
				<td><span class="cell-rating">${cr.teamwork > 0 ? cr.teamwork.toFixed(1) : "-"}</span></td>
				<td><span class="cell-rating">${cr.communication > 0 ? cr.communication.toFixed(1) : "-"}</span></td>
				<td><span class="cell-rating">${cr.punctuality > 0 ? cr.punctuality.toFixed(1) : "-"}</span></td>
				<td><span class="cell-rating">${cr.technical > 0 ? cr.technical.toFixed(1) : "-"}</span></td>
				<td><span class="cell-rating">${cr.leadership > 0 ? cr.leadership.toFixed(1) : "-"}</span></td>
				<td><span class="rating-badge-pill ${badgeClass}">${avg} ${avg !== "-" ? "★" : ""}</span></td>
				<td>
					<button class="button button-quiet button-sm view-student-reviews-btn" data-roll="${escapeHtml(st.rollNo)}">
						Audit Reviews
					</button>
				</td>
			</tr>
		`;
	}).join("");

	// Attach Audit review handlers
	el.analyticsTableBody.querySelectorAll(".view-student-reviews-btn").forEach((btn) => {
		btn.addEventListener("click", () => openStudentDetailModal(btn.dataset.roll));
	});
}

el.searchAnalytics.addEventListener("input", () => {
	renderAnalyticsTable();
});

// Student Detail Audit Modal
async function openStudentDetailModal(rollNo) {
	const student = state.adminAnalytics?.students?.find((s) => s.rollNo === rollNo);
	if (!student) return;

	el.detailStudentName.textContent = student.name;
	el.detailStudentRoll.textContent = student.rollNo;
	el.detailStudentSection.textContent = student.section;
	el.detailStudentAvatar.textContent = getAvatarInitials(student.name);
	el.detailStudentAvatar.className = `modal-avatar ${getAvatarColorClass(student.rollNo)}`;

	el.detailReviewsContainer.innerHTML = `<div class="loading-state"><span class="loader"></span> Loading submitted reviews for ${escapeHtml(student.name)}...</div>`;
	el.studentDetailModal.hidden = false;
	document.body.style.overflow = "hidden";

	try {
		const res = await api(`/peer-feedback?rollNo=${encodeURIComponent(rollNo)}`);
		const reviews = res.feedback || [];

		if (reviews.length === 0) {
			el.detailReviewsContainer.innerHTML = `
				<div class="empty-state">
					<span class="empty-mark">📝</span>
					<h3>No peer reviews received yet</h3>
					<p>Classmates have not yet submitted feedback for ${escapeHtml(student.name)}.</p>
				</div>
			`;
			return;
		}

		el.detailReviewsContainer.innerHTML = reviews.map((r) => {
			const ratings = r.ratings || {};
			return `
				<article class="review-card">
					<div class="review-card-header">
						<div class="review-target-info">
							<div>
								<div class="review-target-name">Evaluated by: <strong>${escapeHtml(r.reviewerName)}</strong> <small>(${escapeHtml(r.reviewerEmail)})</small></div>
								<div class="review-date">${formatDate(r.createdAt)}</div>
							</div>
						</div>
						<div class="review-score-pill">
							<span>★ ${(r.averageRating || 5).toFixed(1)}</span> / 5.0
						</div>
					</div>

					<div class="review-criteria-grid">
						<div class="criteria-metric"><span class="label">Teamwork</span><strong class="val">${ratings.teamwork || "-"}/5</strong></div>
						<div class="criteria-metric"><span class="label">Communication</span><strong class="val">${ratings.communication || "-"}/5</strong></div>
						<div class="criteria-metric"><span class="label">Punctuality</span><strong class="val">${ratings.punctuality || "-"}/5</strong></div>
						<div class="criteria-metric"><span class="label">Technical</span><strong class="val">${ratings.technical || "-"}/5</strong></div>
						<div class="criteria-metric"><span class="label">Leadership</span><strong class="val">${ratings.leadership || "-"}/5</strong></div>
					</div>

					${r.comment ? `<div class="review-comment-box">"${escapeHtml(r.comment)}"</div>` : ""}
				</article>
			`;
		}).join("");
	} catch (err) {
		el.detailReviewsContainer.innerHTML = `<div class="notice-error">${escapeHtml(err.message)}</div>`;
	}
}

el.detailModalClose.addEventListener("click", () => {
	el.studentDetailModal.hidden = true;
	document.body.style.overflow = "";
});
el.studentDetailModal.addEventListener("click", (e) => {
	if (e.target === el.studentDetailModal) {
		el.studentDetailModal.hidden = true;
		document.body.style.overflow = "";
	}
});

// CSV Export Buttons (optional)
function downloadCsv() {
	window.open("/api/admin/export-peer-feedback", "_blank");
}
el.adminExportCsvBtn?.addEventListener("click", downloadCsv);
el.adminExportCsvBtn2?.addEventListener("click", downloadCsv);

// ----------------- ADMIN ALL PEER FEEDBACKS FEED ----------------- //

async function loadAdminFeedbacks() {
	el.adminFeedbacksList.innerHTML = `<div class="loading-state"><span class="loader"></span> Loading all feedback records from MongoDB...</div>`;

	try {
		const res = await api("/peer-feedback");
		state.allAdminFeedbacks = res.feedback || [];
		el.navAdminFeedbacksCount.textContent = state.allAdminFeedbacks.length;
		renderAdminFeedbacks();
	} catch (err) {
		el.adminFeedbacksList.innerHTML = `<div class="notice-error">${escapeHtml(err.message)}</div>`;
	}
}

function renderAdminFeedbacks() {
	const query = el.searchAdminFeedbacks.value.trim().toLowerCase();
	const statusFilter = state.adminFilterStatus;

	const filtered = state.allAdminFeedbacks.filter((fb) => {
		if (statusFilter !== "all" && fb.status !== statusFilter) return false;
		if (!query) return true;
		const haystack = `${fb.targetRollNo} ${fb.targetStudentName} ${fb.reviewerName} ${fb.reviewerEmail} ${fb.comment}`.toLowerCase();
		return haystack.includes(query);
	});

	if (filtered.length === 0) {
		el.adminFeedbacksList.innerHTML = `
			<div class="empty-state">
				<span class="empty-mark">📋</span>
				<h3>No feedback entries match your criteria</h3>
				<p>Try clearing your search query or filter.</p>
			</div>
		`;
		return;
	}

	el.adminFeedbacksList.innerHTML = filtered.map((fb) => {
		const avg = (fb.averageRating || 5).toFixed(1);
		const ratings = fb.ratings || {};
		const currentStatus = fb.status || "submitted";

		return `
			<article class="review-card">
				<div class="review-card-header">
					<div class="review-target-info">
						<span class="modal-avatar avatar-sm ${getAvatarColorClass(fb.targetRollNo)}">${getAvatarInitials(fb.targetStudentName)}</span>
						<div>
							<div class="review-target-name">
								${escapeHtml(fb.targetStudentName)} <span class="roll-pill">${escapeHtml(fb.targetRollNo)}</span>
							</div>
							<div class="review-date">
								Reviewed by: <strong>${escapeHtml(fb.reviewerName)}</strong> (${escapeHtml(fb.reviewerEmail)}) · ${formatDate(fb.createdAt)}
							</div>
						</div>
					</div>

					<div class="admin-review-actions">
						<div class="review-score-pill">
							<span>★ ${avg}</span> / 5.0
						</div>
						<select class="status-select" data-feedback-id="${escapeHtml(fb.id)}" aria-label="Update review status">
							<option value="submitted" ${currentStatus === "submitted" ? "selected" : ""}>Submitted</option>
							<option value="reviewed" ${currentStatus === "reviewed" ? "selected" : ""}>Reviewed</option>
							<option value="flagged" ${currentStatus === "flagged" ? "selected" : ""}>Flagged</option>
							<option value="approved" ${currentStatus === "approved" ? "selected" : ""}>Approved</option>
						</select>
					</div>
				</div>

				<div class="review-criteria-grid">
					<div class="criteria-metric"><span class="label">Teamwork</span><strong class="val">${ratings.teamwork || "-"}/5</strong></div>
					<div class="criteria-metric"><span class="label">Communication</span><strong class="val">${ratings.communication || "-"}/5</strong></div>
					<div class="criteria-metric"><span class="label">Punctuality</span><strong class="val">${ratings.punctuality || "-"}/5</strong></div>
					<div class="criteria-metric"><span class="label">Technical</span><strong class="val">${ratings.technical || "-"}/5</strong></div>
					<div class="criteria-metric"><span class="label">Leadership</span><strong class="val">${ratings.leadership || "-"}/5</strong></div>
				</div>

				${fb.comment ? `<div class="review-comment-box">"${escapeHtml(fb.comment)}"</div>` : ""}
			</article>
		`;
	}).join("");

	// Status change listener
	el.adminFeedbacksList.querySelectorAll(".status-select").forEach((sel) => {
		sel.addEventListener("change", async () => {
			const id = sel.dataset.feedbackId;
			sel.disabled = true;
			try {
				await api(`/peer-feedback/${id}`, { method: "PATCH", body: JSON.stringify({ status: sel.value }) });
				showToast("Review status updated in MongoDB.");
			} catch (err) {
				showToast(`Update failed: ${err.message}`, true);
			} finally {
				sel.disabled = false;
			}
		});
	});
}

el.searchAdminFeedbacks.addEventListener("input", () => renderAdminFeedbacks());

el.clearPeerFeedbackBtn.addEventListener("click", async () => {
	if (!window.confirm("Delete all peer reviews? This cannot be undone.")) return;

	el.clearPeerFeedbackBtn.disabled = true;
	try {
		const result = await api("/admin/peer-feedback", { method: "DELETE" });
		state.allAdminFeedbacks = [];
		el.navAdminFeedbacksCount.textContent = "0";
		renderAdminFeedbacks();
		showToast(`${result.deletedCount} peer reviews deleted.`);
	} catch (err) {
		showToast(`Could not delete peer reviews: ${err.message}`, true);
	} finally {
		el.clearPeerFeedbackBtn.disabled = false;
	}
});

el.adminFilterStatus.addEventListener("click", (e) => {
	const btn = e.target.closest("[data-admin-filter]");
	if (!btn) return;
	state.adminFilterStatus = btn.dataset.adminFilter;
	el.adminFilterStatus.querySelectorAll(".filter-button").forEach((b) => b.classList.toggle("active", b === btn));
	renderAdminFeedbacks();
});

// ----------------- COURSE/GENERAL FEEDBACK ----------------- //

async function loadCourseFeedback() {
	el.courseFeedbackList.innerHTML = `<div class="loading-state"><span class="loader"></span> Loading course feedback...</div>`;

	try {
		const res = await api("/feedback");
		state.courseFeedbacks = res.feedback || [];
		el.courseResultsCount.textContent = `${state.courseFeedbacks.length} course entries`;
		el.navCourseCount.textContent = state.courseFeedbacks.length;
		renderCourseFeedback();
	} catch (err) {
		el.courseFeedbackList.innerHTML = `<div class="notice-error">${escapeHtml(err.message)}</div>`;
	}
}

function renderCourseFeedback() {
	if (state.courseFeedbacks.length === 0) {
		el.courseFeedbackList.innerHTML = `
			<div class="empty-state">
				<span class="empty-mark">🎓</span>
				<h3>No course feedback recorded yet</h3>
				<p>Submit feedback about course curriculum, teachers, or labs.</p>
			</div>
		`;
		return;
	}

	el.courseFeedbackList.innerHTML = state.courseFeedbacks.map((item) => `
		<article class="feedback-item">
			<div class="feedback-marker" aria-hidden="true">${escapeHtml(item.course.slice(0, 1).toUpperCase())}</div>
			<div class="feedback-main">
				<div class="feedback-title-row">
					<h3>${escapeHtml(item.course)}</h3>
					<span class="category-tag">${escapeHtml(item.category)}</span>
				</div>
				<p class="feedback-meta">${escapeHtml(item.instructor)} <span>·</span> ${formatDate(item.createdAt)} ${item.studentName ? `<span class="feedback-student">by ${escapeHtml(item.studentName)}</span>` : ""}</p>
				<p class="feedback-comment">${escapeHtml(item.comment)}</p>
				<div class="feedback-bottom">
					<span class="rating-display">${"★".repeat(item.rating)}<span>${"★".repeat(5 - item.rating)}</span></span>
					<span class="rating-number">${item.rating}/5</span>
				</div>
			</div>
			<div class="feedback-status">
				<span class="status-badge status-${escapeHtml(item.status || "new")}">
					<span></span>${escapeHtml(item.status || "new")}
				</span>
			</div>
		</article>
	`).join("");
}

el.newCourseFeedbackBtn?.addEventListener("click", () => {
	el.courseComposer.hidden = false;
	el.courseComposer.scrollIntoView({ behavior: "smooth" });
});
el.closeCourseComposer?.addEventListener("click", () => {
	el.courseComposer.hidden = true;
});

el.courseFeedbackForm?.addEventListener("submit", async (e) => {
	e.preventDefault();
	const formData = new FormData(el.courseFeedbackForm);
	const payload = {
		course: document.getElementById("course").value.trim(),
		instructor: document.getElementById("instructor").value.trim(),
		category: document.getElementById("category").value,
		rating: Number(formData.get("course-rating")),
		comment: document.getElementById("comment").value.trim()
	};

	const submitBtn = document.getElementById("course-submit-btn");
	submitBtn.disabled = true;

	try {
		await api("/feedback", { method: "POST", body: JSON.stringify(payload) });
		showToast("Course feedback submitted successfully!");
		el.courseFeedbackForm.reset();
		el.courseComposer.hidden = true;
		loadCourseFeedback();
	} catch (err) {
		el.courseMessage.textContent = err.message;
		el.courseMessage.className = "form-message is-error";
	} finally {
		submitBtn.disabled = false;
	}
});

// Check existing login session on boot
api("/auth/me")
	.then(({ user }) => enterWorkspace(user))
	.catch(() => {
		el.authView.hidden = false;
		el.appView.hidden = true;
	});
