const SUPABASE_URL = "https://asimovttennwetjaljhh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_B1PyM1z_fe7mSGjGHNbgDw_l4pEdhrK";

const viewButtons = document.querySelectorAll("[data-view-button]");
const views = document.querySelectorAll("[data-view]");

const workspaceStatus = document.querySelector("#workspaceStatus");
const authStatusCard = document.querySelector("#authStatusCard");
const googleProviderStatus = document.querySelector("#googleProviderStatus");
const supabaseProjectStatus = document.querySelector("#supabaseProjectStatus");
const supabaseStatusLabel = document.querySelector("#supabaseStatusLabel");
const googleStatusLabel = document.querySelector("#googleStatusLabel");
const sessionStatusLabel = document.querySelector("#sessionStatusLabel");
const authDescription = document.querySelector("#authDescription");
const authMessage = document.querySelector("#authMessage");

const navAuthButton = document.querySelector("#navAuthButton");
const headerSignInButton = document.querySelector("#headerSignInButton");
const headerUserButton = document.querySelector("#headerUserButton");
const headerUserAvatar = document.querySelector("#headerUserAvatar");
const headerUserFirstName = document.querySelector("#headerUserFirstName");
const accountDropdown = document.querySelector("#accountDropdown");
const dropdownUserAvatar = document.querySelector("#dropdownUserAvatar");
const dropdownUserName = document.querySelector("#dropdownUserName");
const dropdownUserEmail = document.querySelector("#dropdownUserEmail");
const headerSignOutButton = document.querySelector("#headerSignOutButton");

const mobileMenuButton = document.querySelector("#mobileMenuButton");
const mobileMenu = document.querySelector("#mobileMenu");

const googleSignInButton = document.querySelector("#googleSignInButton");
const signOutButton = document.querySelector("#signOutButton");
const userPanel = document.querySelector("#userPanel");
const userName = document.querySelector("#userName");
const userEmail = document.querySelector("#userEmail");
const userAvatar = document.querySelector("#userAvatar");

const transactionsTableBody = document.querySelector("#transactionsTableBody");

const recordForm = document.querySelector("#recordForm");
const recordDateInput = document.querySelector("#recordDateInput");
const recordTypeInput = document.querySelector("#recordTypeInput");
const recordCategoryInput = document.querySelector("#recordCategoryInput");
const recordDescriptionInput = document.querySelector("#recordDescriptionInput");
const recordAmountInput = document.querySelector("#recordAmountInput");
const recordSubmitButton = document.querySelector("#recordSubmitButton");
const cancelEditButton = document.querySelector("#cancelEditButton");

const recordsFilterForm = document.querySelector("#recordsFilterForm");
const filterTypeInput = document.querySelector("#filterTypeInput");
const filterCategoryInput = document.querySelector("#filterCategoryInput");
const filterMonthInput = document.querySelector("#filterMonthInput");
const clearFiltersButton = document.querySelector("#clearFiltersButton");

const netRevenueValue = document.querySelector("#netRevenueValue");
const netRevenueTrend = document.querySelector("#netRevenueTrend");
const operatingCostValue = document.querySelector("#operatingCostValue");
const operatingCostTrend = document.querySelector("#operatingCostTrend");
const grossMarginValue = document.querySelector("#grossMarginValue");
const grossMarginTrend = document.querySelector("#grossMarginTrend");
const riskIndexValue = document.querySelector("#riskIndexValue");
const riskIndexTrend = document.querySelector("#riskIndexTrend");

let latestFinancialRecords = [];
let editingRecordId = null;

const currencyFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_URL.includes(".supabase.co") &&
  SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_");

const supabaseClient =
  isSupabaseConfigured && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

console.log("App loaded");
console.log("Buttons found:", viewButtons.length);
console.log("Views found:", views.length);
console.log("Supabase configured:", Boolean(supabaseClient));

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setStatusColor(element, status) {
  if (!element) {
    return;
  }

  element.classList.remove(
    "text-[var(--color-positive)]",
    "text-[var(--color-warning)]",
    "text-[var(--color-negative)]",
    "text-[var(--color-text-muted)]"
  );

  if (status === "positive") {
    element.classList.add("text-[var(--color-positive)]");
  }

  if (status === "warning") {
    element.classList.add("text-[var(--color-warning)]");
  }

  if (status === "negative") {
    element.classList.add("text-[var(--color-negative)]");
  }

  if (status === "muted") {
    element.classList.add("text-[var(--color-text-muted)]");
  }
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function formatSignedCurrency(value) {
  const amount = Number(value || 0);
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}${currencyFormatter.format(Math.abs(amount))}`;
}

function formatStatus(value) {
  const cleanValue = String(value || "confirmed").trim();

  if (!cleanValue) {
    return "Confirmed";
  }

  return cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1);
}

function getLocalIsoDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRecordMonthKey(recordDate) {
  return String(recordDate || "").slice(0, 7);
}

function getMonthDateRange(monthValue) {
  if (!monthValue) {
    return null;
  }

  const [yearValue, monthValueNumber] = monthValue.split("-").map(Number);

  if (!yearValue || !monthValueNumber) {
    return null;
  }

  const start = `${yearValue}-${String(monthValueNumber).padStart(2, "0")}-01`;
  const nextMonthDate = new Date(yearValue, monthValueNumber, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = String(nextMonthDate.getMonth() + 1).padStart(2, "0");
  const end = `${nextYear}-${nextMonth}-01`;

  return {
    start,
    end,
  };
}

function getLastSixMonths() {
  const months = [];
  const today = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    months.push({
      key: `${year}-${month}`,
      label: date.toLocaleString("en", { month: "short" }),
      revenue: 0,
      cost: 0,
    });
  }

  return months;
}

function setTodayAsDefaultRecordDate() {
  if (!recordDateInput || recordDateInput.value) {
    return;
  }

  recordDateInput.value = getLocalIsoDate();
}

function setCreateMode() {
  editingRecordId = null;

  if (recordSubmitButton) {
    recordSubmitButton.disabled = false;
    recordSubmitButton.textContent = "Save Record";
  }

  if (cancelEditButton) {
    cancelEditButton.classList.add("hidden");
  }
}

function setEditMode(recordId) {
  editingRecordId = recordId;

  if (recordSubmitButton) {
    recordSubmitButton.disabled = false;
    recordSubmitButton.textContent = "Update Record";
  }

  if (cancelEditButton) {
    cancelEditButton.classList.remove("hidden");
  }
}

function resetRecordForm() {
  if (!recordForm) {
    return;
  }

  recordForm.reset();
  setCreateMode();
  setTodayAsDefaultRecordDate();
}

function resetFilterForm() {
  if (!recordsFilterForm) {
    return;
  }

  recordsFilterForm.reset();
}

function renderTableState(message) {
  if (!transactionsTableBody) {
    return;
  }

  transactionsTableBody.textContent = "";

  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = 7;
  cell.className = "px-4 py-6 text-center text-[var(--color-text-muted)]";
  cell.textContent = message;

  row.appendChild(cell);
  transactionsTableBody.appendChild(row);
}

function resetFinancialDashboard(message = "Sign in to load your financial records.") {
  latestFinancialRecords = [];

  setText(netRevenueValue, formatCurrency(0));
  setText(netRevenueTrend, "Waiting for records");
  setStatusColor(netRevenueTrend, "muted");

  setText(operatingCostValue, formatCurrency(0));
  setText(operatingCostTrend, "Waiting for records");
  setStatusColor(operatingCostTrend, "muted");

  setText(grossMarginValue, "0%");
  setText(grossMarginTrend, "Waiting for records");
  setStatusColor(grossMarginTrend, "muted");

  setText(riskIndexValue, "Pending");
  setText(riskIndexTrend, "Waiting for records");
  setStatusColor(riskIndexTrend, "muted");

  renderTableState(message);

  if (window.updateRevenueChart) {
    const months = getLastSixMonths();

    window.updateRevenueChart(
      months.map((month) => month.label),
      months.map(() => 0),
      months.map(() => 0)
    );
  }
}

function renderTransactions(records) {
  if (!transactionsTableBody) {
    return;
  }

  transactionsTableBody.textContent = "";

  if (!records.length) {
    renderTableState("No financial records match the current filters.");
    return;
  }

  records.slice(0, 8).forEach((record) => {
    const amount = Number(record.amount || 0);
    const type = record.record_type || record.category || (amount < 0 ? "Expense" : "Revenue");
    const categoryName = record.category_name || "General";

    const row = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.className = "px-4 py-4 text-[var(--color-text-muted)]";
    dateCell.textContent = record.record_date || "-";

    const typeCell = document.createElement("td");
    typeCell.className = "px-4 py-4";
    typeCell.textContent = type;

    const categoryCell = document.createElement("td");
    categoryCell.className = "px-4 py-4 text-[var(--color-text-subtle)]";
    categoryCell.textContent = categoryName;

    const descriptionCell = document.createElement("td");
    descriptionCell.className = "px-4 py-4 text-[var(--color-text-subtle)]";
    descriptionCell.textContent = record.description || "No description";

    const amountCell = document.createElement("td");
    amountCell.className = amount >= 0
      ? "px-4 py-4 text-right text-[var(--color-positive)]"
      : "px-4 py-4 text-right text-[var(--color-negative)]";
    amountCell.textContent = formatSignedCurrency(amount);

    const statusCell = document.createElement("td");
    statusCell.className = "px-4 py-4 text-right text-[var(--color-text-muted)]";
    statusCell.textContent = formatStatus(record.status);

    const actionCell = document.createElement("td");
    actionCell.className = "px-4 py-4 text-right";

    const actionWrapper = document.createElement("div");
    actionWrapper.className = "flex justify-end gap-2";

    const editButton = document.createElement("button");
    editButton.className = "border border-[var(--color-border-medium)] bg-[var(--color-bg-main)] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-warning)]";
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.dataset.recordId = record.id;
    editButton.dataset.editRecord = "true";

    const deleteButton = document.createElement("button");
    deleteButton.className = "border border-[var(--color-border-medium)] bg-[var(--color-bg-main)] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-negative)]";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.recordId = record.id;
    deleteButton.dataset.deleteRecord = "true";

    actionWrapper.append(editButton, deleteButton);
    actionCell.appendChild(actionWrapper);

    row.append(
      dateCell,
      typeCell,
      categoryCell,
      descriptionCell,
      amountCell,
      statusCell,
      actionCell
    );

    transactionsTableBody.appendChild(row);
  });
}

function renderFinancialSummary(records) {
  const revenue = records
    .filter((record) => Number(record.amount || 0) > 0)
    .reduce((total, record) => total + Number(record.amount || 0), 0);

  const cost = Math.abs(
    records
      .filter((record) => Number(record.amount || 0) < 0)
      .reduce((total, record) => total + Number(record.amount || 0), 0)
  );

  const grossMargin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
  const costRatio = revenue > 0 ? cost / revenue : cost > 0 ? 1 : 0;

  const riskIndex = records.length === 0
    ? "Pending"
    : costRatio > 0.75
      ? "High"
      : costRatio > 0.5
        ? "Medium"
        : "Low";

  const revenueRecords = records.filter((record) => Number(record.amount || 0) > 0).length;
  const expenseRecords = records.filter((record) => Number(record.amount || 0) < 0).length;

  setText(netRevenueValue, formatCurrency(revenue));
  setText(netRevenueTrend, `${revenueRecords} revenue records`);
  setStatusColor(netRevenueTrend, revenueRecords > 0 ? "positive" : "muted");

  setText(operatingCostValue, formatCurrency(cost));
  setText(operatingCostTrend, `${expenseRecords} expense records`);
  setStatusColor(operatingCostTrend, expenseRecords > 0 ? "warning" : "muted");

  setText(grossMarginValue, `${grossMargin.toFixed(1)}%`);
  setText(grossMarginTrend, records.length ? "Calculated from current records" : "Waiting for records");
  setStatusColor(grossMarginTrend, records.length ? "positive" : "muted");

  setText(riskIndexValue, riskIndex);
  setText(riskIndexTrend, records.length ? "Based on cost ratio" : "Waiting for records");

  if (riskIndex === "High") {
    setStatusColor(riskIndexTrend, "negative");
  } else if (riskIndex === "Medium") {
    setStatusColor(riskIndexTrend, "warning");
  } else if (riskIndex === "Low") {
    setStatusColor(riskIndexTrend, "positive");
  } else {
    setStatusColor(riskIndexTrend, "muted");
  }
}

function renderRevenueChart(records) {
  if (!window.updateRevenueChart) {
    return;
  }

  const months = getLastSixMonths();
  const monthMap = new Map(months.map((month) => [month.key, month]));

  records.forEach((record) => {
    const month = monthMap.get(getRecordMonthKey(record.record_date));

    if (!month) {
      return;
    }

    const amount = Number(record.amount || 0);

    if (amount >= 0) {
      month.revenue += amount;
    } else {
      month.cost += Math.abs(amount);
    }
  });

  window.updateRevenueChart(
    months.map((month) => month.label),
    months.map((month) => Math.round(month.revenue)),
    months.map((month) => Math.round(month.cost))
  );
}

async function loadFinancialRecords() {
  if (!supabaseClient) {
    resetFinancialDashboard("Supabase is not available.");
    return;
  }

  renderTableState("Loading financial records...");

  const selectedType = filterTypeInput?.value || "All";
  const selectedCategory = filterCategoryInput?.value.trim() || "";
  const selectedMonth = filterMonthInput?.value || "";
  const monthRange = getMonthDateRange(selectedMonth);

  let query = supabaseClient
    .from("financial_records")
    .select("id, record_date, record_type, category, category_name, description, amount, status, created_at");

  if (selectedType !== "All") {
    query = query.eq("record_type", selectedType);
  }

  if (selectedCategory) {
    query = query.ilike("category_name", `%${selectedCategory}%`);
  }

  if (monthRange) {
    query = query
      .gte("record_date", monthRange.start)
      .lt("record_date", monthRange.end);
  }

  const { data, error } = await query
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error.message);
    renderTableState("Could not load financial records. Check the browser console for details.");
    setText(authMessage, error.message);
    setStatusColor(authMessage, "negative");
    return;
  }

  const records = data || [];
  latestFinancialRecords = records;

  renderTransactions(records);
  renderFinancialSummary(records);
  renderRevenueChart(records);
}

function getFormRecordPayload() {
  const recordDate = recordDateInput?.value;
  const recordType = recordTypeInput?.value;
  const categoryName = recordCategoryInput?.value.trim();
  const description = recordDescriptionInput?.value.trim();
  const rawAmount = Number(recordAmountInput?.value || 0);

  if (!recordDate || !recordType || !categoryName || !description || rawAmount <= 0) {
    return null;
  }

  const amount = recordType === "Expense"
    ? -Math.abs(rawAmount)
    : Math.abs(rawAmount);

  return {
    record_date: recordDate,
    category: recordType,
    record_type: recordType,
    category_name: categoryName,
    description,
    amount,
    status: "confirmed",
  };
}

async function handleCreateRecord(event) {
  event.preventDefault();

  if (!supabaseClient) {
    setText(authMessage, "Supabase is not available.");
    setStatusColor(authMessage, "negative");
    return;
  }

  const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
  const session = sessionData?.session;

  if (sessionError || !session) {
    setText(authMessage, sessionError?.message || "Sign in before saving records.");
    setStatusColor(authMessage, "warning");
    showView("signin");
    return;
  }

  const recordPayload = getFormRecordPayload();

  if (!recordPayload) {
    setText(authMessage, "Complete date, type, category, description and amount before saving.");
    setStatusColor(authMessage, "warning");
    return;
  }

  if (recordSubmitButton) {
    recordSubmitButton.disabled = true;
    recordSubmitButton.textContent = editingRecordId ? "Updating..." : "Saving...";
  }

  if (editingRecordId) {
    const { error } = await supabaseClient
      .from("financial_records")
      .update(recordPayload)
      .eq("id", editingRecordId);

    if (recordSubmitButton) {
      recordSubmitButton.disabled = false;
      recordSubmitButton.textContent = "Update Record";
    }

    if (error) {
      console.error(error.message);
      setText(authMessage, error.message);
      setStatusColor(authMessage, "negative");
      return;
    }

    setText(authMessage, "Financial record updated successfully.");
    setStatusColor(authMessage, "positive");

    resetRecordForm();
    await loadFinancialRecords();
    return;
  }

  const { error } = await supabaseClient
    .from("financial_records")
    .insert({
      user_id: session.user.id,
      ...recordPayload,
    });

  if (recordSubmitButton) {
    recordSubmitButton.disabled = false;
    recordSubmitButton.textContent = "Save Record";
  }

  if (error) {
    console.error(error.message);
    setText(authMessage, error.message);
    setStatusColor(authMessage, "negative");
    return;
  }

  setText(authMessage, "Financial record saved successfully.");
  setStatusColor(authMessage, "positive");

  resetRecordForm();
  await loadFinancialRecords();
}

function handleEditRecord(recordId) {
  const record = latestFinancialRecords.find((item) => item.id === recordId);

  if (!record) {
    setText(authMessage, "Could not find that record in the current table.");
    setStatusColor(authMessage, "warning");
    return;
  }

  if (recordDateInput) {
    recordDateInput.value = record.record_date || getLocalIsoDate();
  }

  if (recordTypeInput) {
    recordTypeInput.value = record.record_type || (Number(record.amount || 0) < 0 ? "Expense" : "Revenue");
  }

  if (recordCategoryInput) {
    recordCategoryInput.value = record.category_name || "General";
  }

  if (recordDescriptionInput) {
    recordDescriptionInput.value = record.description || "";
  }

  if (recordAmountInput) {
    recordAmountInput.value = String(Math.abs(Number(record.amount || 0)));
  }

  setEditMode(record.id);
  setText(authMessage, "Editing selected financial record.");
  setStatusColor(authMessage, "warning");

  recordForm?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

async function handleDeleteRecord(recordId) {
  if (!recordId) {
    return;
  }

  if (!supabaseClient) {
    setText(authMessage, "Supabase is not available.");
    setStatusColor(authMessage, "negative");
    return;
  }

  const confirmed = window.confirm("Delete this financial record? This action cannot be undone.");

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("financial_records")
    .delete()
    .eq("id", recordId);

  if (error) {
    console.error(error.message);
    setText(authMessage, error.message);
    setStatusColor(authMessage, "negative");
    return;
  }

  if (editingRecordId === recordId) {
    resetRecordForm();
  }

  setText(authMessage, "Financial record deleted successfully.");
  setStatusColor(authMessage, "positive");

  await loadFinancialRecords();
}

function getDisplayName(session) {
  return (
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email ||
    "User"
  );
}

function getFirstName(fullName) {
  const cleanName = String(fullName || "").trim();

  if (!cleanName) {
    return "User";
  }

  return cleanName.split(" ")[0];
}

function getAvatarUrl(session) {
  return (
    session?.user?.user_metadata?.avatar_url ||
    session?.user?.user_metadata?.picture ||
    ""
  );
}

function closeAccountDropdown() {
  accountDropdown?.classList.add("hidden");
}

function closeMobileMenu() {
  mobileMenu?.classList.add("hidden");
}

function showView(selectedView) {
  console.log("Selected view:", selectedView);

  views.forEach((view) => {
    const viewName = view.dataset.view;

    if (viewName === selectedView) {
      view.classList.remove("hidden");
    } else {
      view.classList.add("hidden");
    }
  });

  viewButtons.forEach((button) => {
    const buttonView = button.dataset.viewButton;

    if (buttonView === selectedView) {
      button.classList.add("text-[var(--color-text-main)]");
      button.classList.remove("text-[var(--color-text-muted)]");
    } else {
      button.classList.remove("text-[var(--color-text-main)]");
      button.classList.add("text-[var(--color-text-muted)]");
    }
  });

  closeMobileMenu();
  closeAccountDropdown();
}

function renderConfigurationState() {
  if (supabaseClient) {
    setText(authStatusCard, "Private Workspace");
    setStatusColor(authStatusCard, "positive");

    setText(supabaseProjectStatus, "Access enabled");
    setStatusColor(supabaseProjectStatus, "positive");

    setText(supabaseStatusLabel, "Ready");
    setStatusColor(supabaseStatusLabel, "positive");

    setText(googleProviderStatus, "Google account");
    setStatusColor(googleProviderStatus, "positive");

    setText(googleStatusLabel, "Connected");
    setStatusColor(googleStatusLabel, "positive");

    setText(
      authDescription,
      "Your private workspace is protected with Google Sign-In. Use this page to review your account session and access details."
    );

    setText(
      authMessage,
      "Sign in with Google to access your workspace."
    );

    if (googleSignInButton) {
      googleSignInButton.disabled = false;
      googleSignInButton.classList.remove("opacity-70");
    }

    return;
  }

  setText(authStatusCard, "Workspace unavailable");
  setStatusColor(authStatusCard, "warning");

  setText(supabaseProjectStatus, "Access unavailable");
  setStatusColor(supabaseProjectStatus, "warning");

  setText(supabaseStatusLabel, "Unavailable");
  setStatusColor(supabaseStatusLabel, "warning");

  setText(googleProviderStatus, "Pending client");
  setStatusColor(googleProviderStatus, "warning");

  setText(googleStatusLabel, "Pending");
  setStatusColor(googleStatusLabel, "warning");

  setText(
    authDescription,
    "The Supabase client is not available. Check the Supabase CDN script and app.js configuration."
  );

  setText(
    authMessage,
    "Navigation still works, but authentication needs the Supabase client to load correctly."
  );
}

function renderLoggedOutState() {
  setText(workspaceStatus, "Guest Session");
  setText(navAuthButton, "Sign In");

  setText(sessionStatusLabel, "Inactive");
  setStatusColor(sessionStatusLabel, "warning");

  if (headerSignInButton) {
    headerSignInButton.classList.remove("hidden");
  }

  if (headerUserButton) {
    headerUserButton.classList.add("hidden");
    headerUserButton.classList.remove("flex");
  }

  if (headerUserAvatar) {
    headerUserAvatar.src = "";
  }

  if (dropdownUserAvatar) {
    dropdownUserAvatar.src = "";
  }

  setText(headerUserFirstName, "User");
  setText(dropdownUserName, "Signed in user");
  setText(dropdownUserEmail, "No email available");

  if (googleSignInButton) {
    googleSignInButton.classList.remove("hidden");
  }

  if (signOutButton) {
    signOutButton.classList.add("hidden");
  }

  if (userPanel) {
    userPanel.classList.add("hidden");
  }

  if (userAvatar) {
    userAvatar.classList.add("hidden");
    userAvatar.src = "";
  }

  if (recordForm) {
    recordForm.classList.add("hidden");
  }

  if (recordsFilterForm) {
    recordsFilterForm.classList.add("hidden");
  }

  resetRecordForm();
  resetFilterForm();
  resetFinancialDashboard();
  closeAccountDropdown();
}

function renderLoggedInState(session) {
  const email = session?.user?.email || "No email available";
  const displayName = getDisplayName(session);
  const firstName = getFirstName(displayName);
  const avatarUrl = getAvatarUrl(session);

  setText(workspaceStatus, "Personal Workspace");
  setText(navAuthButton, "Account");

  setText(authStatusCard, "Authenticated");
  setStatusColor(authStatusCard, "positive");

  setText(sessionStatusLabel, "Active");
  setStatusColor(sessionStatusLabel, "positive");

  setText(googleProviderStatus, "Google account");
  setStatusColor(googleProviderStatus, "positive");

  setText(googleStatusLabel, "Connected");
  setStatusColor(googleStatusLabel, "positive");

  setText(authMessage, "You are signed in securely.");
  setStatusColor(authMessage, "positive");

  setText(userName, displayName);
  setText(userEmail, email);

  setText(headerUserFirstName, firstName);
  setText(dropdownUserName, displayName);
  setText(dropdownUserEmail, email);

  if (headerSignInButton) {
    headerSignInButton.classList.add("hidden");
  }

  if (headerUserButton) {
    headerUserButton.classList.remove("hidden");
    headerUserButton.classList.add("flex");
  }

  if (headerUserAvatar && avatarUrl) {
    headerUserAvatar.src = avatarUrl;
  }

  if (dropdownUserAvatar && avatarUrl) {
    dropdownUserAvatar.src = avatarUrl;
  }

  if (googleSignInButton) {
    googleSignInButton.classList.add("hidden");
  }

  if (signOutButton) {
    signOutButton.classList.remove("hidden");
  }

  if (userPanel) {
    userPanel.classList.remove("hidden");
  }

  if (userAvatar && avatarUrl) {
    userAvatar.src = avatarUrl;
    userAvatar.classList.remove("hidden");
  }

  if (recordForm) {
    recordForm.classList.remove("hidden");
  }

  if (recordsFilterForm) {
    recordsFilterForm.classList.remove("hidden");
  }

  setTodayAsDefaultRecordDate();
}

async function handleGoogleSignIn() {
  if (!supabaseClient) {
    setText(
      authMessage,
      "Supabase is not available. Check that the Supabase CDN script loads before app.js."
    );

    setStatusColor(authMessage, "warning");
    console.warn("Missing Supabase client.");
    return;
  }

  const redirectTo = `${window.location.origin}${window.location.pathname}`;

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    setText(authMessage, error.message);
    setStatusColor(authMessage, "negative");
    console.error(error.message);
  }
}

async function handleSignOut() {
  if (!supabaseClient) {
    return;
  }

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    setText(authMessage, error.message);
    setStatusColor(authMessage, "negative");
    console.error(error.message);
    return;
  }

  renderLoggedOutState();
  renderConfigurationState();

  setText(authMessage, "You have signed out of your workspace.");
  setStatusColor(authMessage, "muted");
}

async function initializeAuth() {
  renderConfigurationState();

  if (!supabaseClient) {
    renderLoggedOutState();
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    setText(authMessage, error.message);
    setStatusColor(authMessage, "negative");
    console.error(error.message);
    renderLoggedOutState();
    return;
  }

  if (data.session) {
    renderLoggedInState(data.session);
    await loadFinancialRecords();
  } else {
    renderLoggedOutState();
  }

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth event:", event);

    if (session) {
      renderLoggedInState(session);
      await loadFinancialRecords();
      return;
    }

    renderLoggedOutState();
  });
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedView = button.dataset.viewButton;
    showView(selectedView);
  });
});

googleSignInButton?.addEventListener("click", () => {
  handleGoogleSignIn();
});

signOutButton?.addEventListener("click", () => {
  handleSignOut();
});

recordForm?.addEventListener("submit", (event) => {
  handleCreateRecord(event);
});

recordsFilterForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  loadFinancialRecords();
});

filterTypeInput?.addEventListener("change", () => {
  loadFinancialRecords();
});

filterMonthInput?.addEventListener("change", () => {
  loadFinancialRecords();
});

clearFiltersButton?.addEventListener("click", () => {
  resetFilterForm();
  loadFinancialRecords();
});

cancelEditButton?.addEventListener("click", () => {
  resetRecordForm();
  setText(authMessage, "Edit cancelled.");
  setStatusColor(authMessage, "muted");
});

transactionsTableBody?.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const editButton = target.closest("[data-edit-record]");

  if (editButton) {
    handleEditRecord(editButton.dataset.recordId);
    return;
  }

  const deleteButton = target.closest("[data-delete-record]");

  if (deleteButton) {
    handleDeleteRecord(deleteButton.dataset.recordId);
  }
});

headerSignOutButton?.addEventListener("click", () => {
  handleSignOut();
});

headerUserButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  accountDropdown?.classList.toggle("hidden");
});

mobileMenuButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  mobileMenu?.classList.toggle("hidden");
});

document.addEventListener("click", (event) => {
  const target = event.target;

  if (
    accountDropdown &&
    headerUserButton &&
    target instanceof Element &&
    !accountDropdown.contains(target) &&
    !headerUserButton.contains(target)
  ) {
    closeAccountDropdown();
  }
});

showView("overview");
initializeAuth();
