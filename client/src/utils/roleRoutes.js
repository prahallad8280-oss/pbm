export const getWorkspacePathForRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "editor":
      return "/admin/questions";
    default:
      return "/dashboard";
  }
};

export const getWorkspaceLabelForRole = (role) => {
  switch (role) {
    case "admin":
    case "editor":
      return "Dashboard";
    default:
      return "Student Dashboard";
  }
};

export const getWorkspaceTitleForRole = (role) => {
  switch (role) {
    case "admin":
      return "Admin dashboard";
    case "editor":
      return "Editor dashboard";
    default:
      return "Student dashboard";
  }
};

export const getWorkspaceEyebrowForRole = (role) => {
  switch (role) {
    case "admin":
      return "Admin workspace";
    case "editor":
      return "Editor workspace";
    default:
      return "Learner workspace";
  }
};

export const getWorkspaceHeadingForRole = (role) => {
  switch (role) {
    case "admin":
      return "Control Center";
    case "editor":
      return "Content Desk";
    default:
      return "Practice Suite";
  }
};

export const getWorkspaceCopyForRole = (role) => {
  switch (role) {
    case "admin":
      return "Manage questions, notices, feedback, and account access from one steady panel.";
    case "editor":
      return "Maintain questions, categories, and home-page notices without touching account permissions.";
    default:
      return "Move between active mocks, revision history, and your next attempt without losing context.";
  }
};

export const getRoleDisplayName = (role) => {
  switch (role) {
    case "admin":
      return "Administrator";
    case "editor":
      return "Editor";
    case "debarred":
      return "Debarred";
    default:
      return "Learner";
  }
};
