import { supabase } from '../auth/supabaseClient.js';
import { authManager } from '../auth/authManager.js';

export async function initializeAdminDashboard() {
  const adminDashboardBtn = document.getElementById('adminDashboardBtn');

  if (adminDashboardBtn) {
    adminDashboardBtn.addEventListener('click', showAdminDashboard);
  }

  authManager.onAuthChange(updateAdminButtonVisibility);
  updateAdminButtonVisibility();
}

function updateAdminButtonVisibility() {
  const adminDashboardBtn = document.getElementById('adminDashboardBtn');

  if (adminDashboardBtn) {
    if (authManager.isUniversityAdmin()) {
      adminDashboardBtn.style.display = 'block';
    } else {
      adminDashboardBtn.style.display = 'none';
    }
  }
}

async function showAdminDashboard() {
  if (!authManager.isUniversityAdmin()) {
    alert('Admin access required');
    return;
  }

  const licenseId = authManager.userProfile.license_id;

  const { data: license, error: licenseError } = await supabase
    .from('university_licenses')
    .select('*')
    .eq('id', licenseId)
    .maybeSingle();

  if (licenseError || !license) {
    alert('Failed to load license information');
    return;
  }

  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('id, email, created_at, last_active')
    .eq('license_id', licenseId)
    .order('created_at', { ascending: false });

  if (usersError) {
    alert('Failed to load users');
    return;
  }

  displayAdminModal(license, users);
}

function displayAdminModal(license, users) {
  const modal = document.getElementById('adminModal');
  const modalContent = document.getElementById('adminModalContent');

  const usagePercent = (license.used_seats / license.total_seats) * 100;
  const seatsRemaining = license.total_seats - license.used_seats;

  let usersHTML = users.map(user => {
    const lastActive = user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never';
    return `
      <tr>
        <td>${user.email}</td>
        <td>${new Date(user.created_at).toLocaleDateString()}</td>
        <td>${lastActive}</td>
      </tr>
    `;
  }).join('');

  modalContent.innerHTML = `
    <h2>University Admin Dashboard</h2>
    <div class="admin-stats">
      <div class="stat-card">
        <h3>${license.university_name}</h3>
        <p>Institution</p>
      </div>
      <div class="stat-card">
        <h3>${license.used_seats} / ${license.total_seats}</h3>
        <p>Seats Used</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${usagePercent}%"></div>
        </div>
      </div>
      <div class="stat-card">
        <h3>${seatsRemaining}</h3>
        <p>Seats Remaining</p>
      </div>
    </div>

    <h3>Active Users (${users.length})</h3>
    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Created</th>
            <th>Last Active</th>
          </tr>
        </thead>
        <tbody>
          ${usersHTML}
        </tbody>
      </table>
    </div>

    <button id="closeAdminModal" class="close-admin-btn">Close</button>
  `;

  modal.style.display = 'flex';

  document.getElementById('closeAdminModal').addEventListener('click', () => {
    modal.style.display = 'none';
  });
}
