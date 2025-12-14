document.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('userRole');
  if (role !== 'admin') {
    // if not admin, redirect to login
    console.warn('Not admin — redirecting to login.');
    
  }

  const table = document.getElementById('admin-users-table') || document.getElementById('usersTable');
  if (!table) {
    console.log('No users table found in DOM.');
    return;
  }

  loadUsers();

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        console.error('Failed to fetch users', res.status);
        table.innerHTML = '<tr><td colspan="6" class="text-danger small">Failed to load users.</td></tr>';
        return;
      }
      const users = await res.json();
      if (!Array.isArray(users) || users.length === 0) {
        table.innerHTML = '<tr><td colspan="6" class="text-muted small">No users found.</td></tr>';
        return;
      }

      // build table rows
      table.innerHTML = '';
      users.forEach((u, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.fullName || u.username || ('User ' + (i+1))}</td>
          <td>${u.username || ''}</td>
          <td>${u.userRole || u.role || ''}</td>
          <td>${u.station || ''}</td>
          <td>${u.email || ''}</td>
          <td>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-idx="${i}">Delete</button>
          </td>
        `;
        table.appendChild(tr);
      });

      // attach delete handlers 
      table.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (ev) => {
          const row = ev.target.closest('tr');
          const username = row?.children[1]?.textContent?.trim();
          if (!confirm(`Delete user ${username}?`)) return;
          try {
            
            const res = await fetch(`/api/admin/users/delete/${encodeURIComponent(username)}`, { method: 'DELETE' });
            if (res.ok) {
              alert('User deleted (backend handled). Refreshing list.');
              loadUsers();
            } else {
              alert('Delete not supported by server. Remove user manually.');
            }
          } catch (err) {
            console.warn('Delete user error', err);
            alert('Could not delete user. Check console.');
          }
        });
      });
    } catch (err) {
      console.error('Error loading users', err);
      table.innerHTML = '<tr><td colspan="6" class="text-danger small">Error loading users. See console.</td></tr>';
    }
  }
});
