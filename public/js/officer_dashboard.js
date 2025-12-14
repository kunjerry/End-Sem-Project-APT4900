document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  const res = await fetch(`/api/evidence/my/${userId}`);
  const data = await res.json();
  document.getElementById("stat-total-submitted").textContent = data.totalSubmitted;
  document.getElementById("stat-current-custody").textContent = data.currentCustody;
});
