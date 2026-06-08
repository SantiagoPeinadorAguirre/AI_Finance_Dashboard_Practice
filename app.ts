type AppView = "overview" | "portfolio" | "analytics" | "reports" | "signin";

type AuthError = {
  message: string;
};

type SupabaseUser = {
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

type SupabaseSession = {
  user: SupabaseUser;
};

type SupabaseClient = {
  auth: {
    signInWithOAuth: (credentials: {
      provider: "google";
      options?: {
        redirectTo?: string;
      };
    }) => Promise<{
      data: unknown;
      error: AuthError | null;
    }>;

    signOut: () => Promise<{
      error: AuthError | null;
    }>;

    getSession: () => Promise<{
      data: {
        session: SupabaseSession | null;
      };
      error: AuthError | null;
    }>;

    onAuthStateChange: (
      callback: (event: string, session: SupabaseSession | null) => void
    ) => {
      data: {
        subscription: {
          unsubscribe: () => void;
        };
      };
    };
  };
};

declare const supabase: {
  createClient: (supabaseUrl: string, supabaseKey: string) => SupabaseClient;
};

const SUPABASE_URL = "https://asimovttennwetjaljhh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_B1PyM1z_fe7mSGjGHNbgDw_l4pEdhrK";

const viewButtons = document.querySelectorAll<HTMLButtonElement>("[data-view-button]");
const views = document.querySelectorAll<HTMLElement>("[data-view]");

const workspaceStatus = document.querySelector<HTMLElement>("#workspaceStatus");
const authStatusCard = document.querySelector<HTMLElement>("#authStatusCard");
const googleProviderStatus = document.querySelector<HTMLElement>("#googleProviderStatus");
const supabaseProjectStatus = document.querySelector<HTMLElement>("#supabaseProjectStatus");
const supabaseStatusLabel = document.querySelector<HTMLElement>("#supabaseStatusLabel");
const googleStatusLabel = document.querySelector<HTMLElement>("#googleStatusLabel");
const sessionStatusLabel = document.querySelector<HTMLElement>("#sessionStatusLabel");
const authDescription = document.querySelector<HTMLElement>("#authDescription");
const authMessage = document.querySelector<HTMLElement>("#authMessage");
const navAuthButton = document.querySelector<HTMLButtonElement>("#navAuthButton");
const headerSignInButton = document.querySelector<HTMLButtonElement>("#headerSignInButton");
const headerUserButton = document.querySelector<HTMLButtonElement>("#headerUserButton");
const headerUserAvatar = document.querySelector<HTMLImageElement>("#headerUserAvatar");
const headerUserFirstName = document.querySelector<HTMLElement>("#headerUserFirstName");
const googleSignInButton = document.querySelector<HTMLButtonElement>("#googleSignInButton");
const signOutButton = document.querySelector<HTMLButtonElement>("#signOutButton");
const userPanel = document.querySelector<HTMLElement>("#userPanel");
const userName = document.querySelector<HTMLElement>("#userName");
const userEmail = document.querySelector<HTMLElement>("#userEmail");
const userAvatar = document.querySelector<HTMLImageElement>("#userAvatar");

const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_URL.includes(".supabase.co") &&
  SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_");

const supabaseClient = isSupabaseConfigured
  ? supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

console.log("App loaded");
console.log("Buttons found:", viewButtons.length);
console.log("Views found:", views.length);
console.log("Supabase configured:", isSupabaseConfigured);

function setText(element: HTMLElement | null, value: string): void {
  if (element) {
    element.textContent = value;
  }
}

function setStatusColor(
  element: HTMLElement | null,
  status: "positive" | "warning" | "negative" | "muted"
): void {
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

function getDisplayName(session: SupabaseSession): string {
  return (
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    session.user.email ||
    "User"
  );
}

function getFirstName(fullName: string): string {
  const cleanName = fullName.trim();

  if (!cleanName) {
    return "User";
  }

  return cleanName.split(" ")[0];
}

function getAvatarUrl(session: SupabaseSession): string {
  return (
    session.user.user_metadata?.avatar_url ||
    session.user.user_metadata?.picture ||
    ""
  );
}

function showView(selectedView: AppView): void {
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
}

function renderConfigurationState(): void {
  if (isSupabaseConfigured) {
    setText(authStatusCard, "Supabase Ready");
    setStatusColor(authStatusCard, "positive");

    setText(supabaseProjectStatus, "Project configured");
    setStatusColor(supabaseProjectStatus, "positive");

    setText(supabaseStatusLabel, "Ready");
    setStatusColor(supabaseStatusLabel, "positive");

    setText(googleProviderStatus, "Requires Google provider");
    setStatusColor(googleProviderStatus, "warning");

    setText(googleStatusLabel, "Check provider");
    setStatusColor(googleStatusLabel, "warning");

    setText(
      authDescription,
      "Supabase is configured in the frontend. Google Sign-In will work after the Google provider is enabled in your Supabase project."
    );

    setText(
      authMessage,
      "If Google provider is already configured in Supabase, this button will redirect to Google Sign-In."
    );

    if (googleSignInButton) {
      googleSignInButton.disabled = false;
      googleSignInButton.classList.remove("opacity-70");
    }

    return;
  }

  setText(authStatusCard, "Pending Supabase");
  setStatusColor(authStatusCard, "warning");

  setText(supabaseProjectStatus, "Missing project credentials");
  setStatusColor(supabaseProjectStatus, "warning");

  setText(supabaseStatusLabel, "Missing");
  setStatusColor(supabaseStatusLabel, "warning");

  setText(googleProviderStatus, "Pending configuration");
  setStatusColor(googleProviderStatus, "warning");

  setText(googleStatusLabel, "Pending");
  setStatusColor(googleStatusLabel, "warning");

  setText(
    authDescription,
    "Supabase authentication is prepared. Add your Supabase project URL and publishable key in app.ts to enable Google Sign-In."
  );

  setText(
    authMessage,
    "No fake login is enabled. Add real Supabase credentials before using Google Sign-In."
  );

  if (googleSignInButton) {
    googleSignInButton.disabled = false;
    googleSignInButton.classList.remove("opacity-70");
  }
}

function renderLoggedOutState(): void {
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

  setText(headerUserFirstName, "User");

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
}

function renderLoggedInState(session: SupabaseSession): void {
  const email = session.user.email || "No email available";
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

  if (headerSignInButton) {
    headerSignInButton.classList.add("hidden");
  }

  if (headerUserButton) {
    headerUserButton.classList.remove("hidden");
    headerUserButton.classList.add("flex");
  }

  setText(headerUserFirstName, firstName);

  if (headerUserAvatar && avatarUrl) {
    headerUserAvatar.src = avatarUrl;
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

async function handleGoogleSignIn(): Promise<void> {
  if (!supabaseClient) {
    setText(
      authMessage,
      "Supabase is not configured yet. Check your Supabase URL and publishable key in app.ts, then run npx tsc."
    );

    setStatusColor(authMessage, "warning");
    console.warn("Missing Supabase configuration.");
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

async function handleSignOut(): Promise<void> {
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

async function initializeAuth(): Promise<void> {
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
    const selectedView = button.dataset.viewButton as AppView;
    showView(selectedView);
  });
});

googleSignInButton?.addEventListener("click", () => {
  void handleGoogleSignIn();
});

signOutButton?.addEventListener("click", () => {
  void handleSignOut();
});

showView("overview");
void initializeAuth();