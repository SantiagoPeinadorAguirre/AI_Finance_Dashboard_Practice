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
    setText(authStatusCard, "Supabase Ready");
    setStatusColor(authStatusCard, "positive");

    setText(supabaseProjectStatus, "Project configured");
    setStatusColor(supabaseProjectStatus, "positive");

    setText(supabaseStatusLabel, "Ready");
    setStatusColor(supabaseStatusLabel, "positive");

    setText(googleProviderStatus, "Google provider active");
    setStatusColor(googleProviderStatus, "positive");

    setText(googleStatusLabel, "Connected");
    setStatusColor(googleStatusLabel, "positive");

    setText(
      authDescription,
      "Supabase and Google Sign-In are configured. You can access your authenticated workspace with your Google account."
    );

    setText(
      authMessage,
      "Authentication is ready. Sign in with Google to start your session."
    );

    if (googleSignInButton) {
      googleSignInButton.disabled = false;
      googleSignInButton.classList.remove("opacity-70");
    }

    return;
  }

  setText(authStatusCard, "Supabase unavailable");
  setStatusColor(authStatusCard, "warning");

  setText(supabaseProjectStatus, "Client unavailable");
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

  closeAccountDropdown();
}

function renderLoggedInState(session) {
  const email = session?.user?.email || "No email available";
  const displayName = getDisplayName(session);
  const firstName = getFirstName(displayName);
  const avatarUrl = getAvatarUrl(session);

  setText(workspaceStatus, "Authenticated Session");
  setText(navAuthButton, "Account");

  setText(authStatusCard, "Authenticated");
  setStatusColor(authStatusCard, "positive");

  setText(sessionStatusLabel, "Active");
  setStatusColor(sessionStatusLabel, "positive");

  setText(googleProviderStatus, "Google connected");
  setStatusColor(googleProviderStatus, "positive");

  setText(googleStatusLabel, "Connected");
  setStatusColor(googleStatusLabel, "positive");

  setText(authMessage, "You are signed in with Google.");
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

  setText(authMessage, "You have signed out.");
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
  } else {
    renderLoggedOutState();
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("Auth event:", event);

    if (session) {
      renderLoggedInState(session);
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
    !accountDropdown.contains(target) &&
    !headerUserButton.contains(target)
  ) {
    closeAccountDropdown();
  }
});

showView("overview");
initializeAuth();
