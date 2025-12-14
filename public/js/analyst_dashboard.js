document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  document.getElementById("admin-username").textContent = username || "Admin";
});
