// Student Management System - JavaScript

// Data structures
let students = [];
let currentUser = {
    username: '',
    role: ''
};

// Demo credentials
const credentials = {
    'admin': { password: 'admin123', role: 'ADMIN' },
    'staff': { password: 'staff123', role: 'STAFF' },
    'user': { password: 'user123', role: 'USER' },
    'guest': { password: 'guest123', role: 'GUEST' }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadDemoData();
    initializeEventListeners();
});

// Load demo student data
function loadDemoData() {
    students = [
        { roll: 1001, name: 'Rajesh Kumar', marks: 85.5 },
        { roll: 1002, name: 'Priya Sharma', marks: 92.0 },
        { roll: 1003, name: 'Amit Singh', marks: 78.5 },
        { roll: 1004, name: 'Sneha Patel', marks: 88.0 },
        { roll: 1005, name: 'Vikram Reddy', marks: 95.5 },
        { roll: 1006, name: 'Ananya Iyer', marks: 82.0 },
        { roll: 1007, name: 'Karthik Krishnan', marks: 76.5 },
        { roll: 1008, name: 'Divya Menon', marks: 91.0 },
        { roll: 1009, name: 'Rahul Verma', marks: 68.0 },
        { roll: 1010, name: 'Meera Nair', marks: 87.5 }
    ];
}

// Event Listeners
function initializeEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            navigateToView(view);
        });
    });
    
    // Add student form
    document.getElementById('addStudentForm').addEventListener('submit', handleAddStudent);
    
    // Search form
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    
    // Update forms
    document.getElementById('updateSearchForm').addEventListener('submit', handleUpdateSearch);
    document.getElementById('updateStudentForm').addEventListener('submit', handleUpdateStudent);
    
    // Delete form
    document.getElementById('deleteForm').addEventListener('submit', handleDelete);
    
    // Table controls
    document.getElementById('filterInput').addEventListener('input', filterStudents);
    document.getElementById('sortSelect').addEventListener('change', sortStudents);
}

// Login handler
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (credentials[username] && credentials[username].password === password) {
        currentUser.username = username;
        currentUser.role = credentials[username].role;
        
        showToast('Login successful!', 'success');
        showDashboard();
    } else {
        showToast('Invalid credentials. Please try again.', 'error');
    }
}

// Logout handler
function handleLogout() {
    currentUser = { username: '', role: '' };
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('dashboardScreen').classList.remove('active');
    document.getElementById('loginForm').reset();
    showToast('Logged out successfully', 'success');
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    
    // Update user info
    document.getElementById('currentUserName').textContent = currentUser.username;
    document.getElementById('currentUserRole').textContent = currentUser.role;
    
    // Setup menu based on role
    setupMenuForRole();
    
    // Show dashboard view
    navigateToView('dashboard');
}

// Setup menu items based on user role
function setupMenuForRole() {
    document.querySelectorAll('.menu-item').forEach(item => {
        const allowedRoles = item.getAttribute('data-role');
        
        if (allowedRoles === 'all') {
            item.style.display = 'flex';
        } else if (allowedRoles) {
            const roles = allowedRoles.split(',');
            if (roles.includes(currentUser.role)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// Navigate to different views
function navigateToView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected view
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.classList.add('active');
        
        // Add active class to corresponding menu item
        const menuItem = document.querySelector(`.menu-item[data-view="${viewName}"]`);
        if (menuItem) {
            menuItem.classList.add('active');
        }
        
        // Load view-specific data
        if (viewName === 'dashboard') {
            updateDashboard();
        } else if (viewName === 'students') {
            displayAllStudents();
        }
    }
}

// Update dashboard statistics
function updateDashboard() {
    const total = students.length;
    const avgMarks = total > 0 ? (students.reduce((sum, s) => sum + s.marks, 0) / total).toFixed(2) : '0.00';
    const topStudent = students.length > 0 ? students.reduce((max, s) => s.marks > max.marks ? s : max) : null;
    const passCount = students.filter(s => s.marks >= 40).length;
    const passPercentage = total > 0 ? ((passCount / total) * 100).toFixed(1) : '0.0';
    
    document.getElementById('totalStudents').textContent = total;
    document.getElementById('avgMarks').textContent = avgMarks;
    document.getElementById('topPerformer').textContent = topStudent ? topStudent.name : '-';
    document.getElementById('passPercentage').textContent = passPercentage + '%';
    
    // Display recent students (last 5)
    const recentStudents = students.slice(-5).reverse();
    displayStudentsInContainer(recentStudents, 'recentStudents');
}

// Display all students
function displayAllStudents() {
    displayStudentsInContainer(students, 'studentsTable');
}

// Display students in a container
function displayStudentsInContainer(studentList, containerId) {
    const container = document.getElementById(containerId);
    
    if (studentList.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 20px;">No students found.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Roll Number</th>
                    <th>Name</th>
                    <th>Marks</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    studentList.forEach(student => {
        const status = student.marks >= 40 ? 'Pass' : 'Fail';
        const statusClass = student.marks >= 40 ? 'status-pass' : 'status-fail';
        
        html += `
            <tr>
                <td>${student.roll}</td>
                <td>${student.name}</td>
                <td>${student.marks.toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Add student handler
function handleAddStudent(e) {
    e.preventDefault();
    
    const roll = parseInt(document.getElementById('addRoll').value);
    const name = document.getElementById('addName').value.trim();
    const marks = parseFloat(document.getElementById('addMarks').value);
    
    // Check if roll already exists
    if (students.find(s => s.roll === roll)) {
        showToast('A student with this roll number already exists!', 'error');
        return;
    }
    
    // Validate marks
    if (marks < 0 || marks > 100) {
        showToast('Marks must be between 0 and 100!', 'error');
        return;
    }
    
    // Add student
    students.push({ roll, name, marks });
    
    showToast('Student added successfully!', 'success');
    document.getElementById('addStudentForm').reset();
    
    // Update dashboard if visible
    if (document.getElementById('dashboardView').classList.contains('active')) {
        updateDashboard();
    }
}

// Search student handler
function handleSearch(e) {
    e.preventDefault();
    
    const roll = parseInt(document.getElementById('searchRoll').value);
    const student = students.find(s => s.roll === roll);
    
    const resultContainer = document.getElementById('searchResult');
    
    if (student) {
        const status = student.marks >= 40 ? 'Pass' : 'Fail';
        const statusClass = student.marks >= 40 ? 'status-pass' : 'status-fail';
        
        resultContainer.innerHTML = `
            <div class="result-card">
                <h3>Student Found</h3>
                <div class="result-item">
                    <span class="result-label">Roll Number:</span>
                    <span class="result-value">${student.roll}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Name:</span>
                    <span class="result-value">${student.name}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Marks:</span>
                    <span class="result-value">${student.marks.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Status:</span>
                    <span class="status-badge ${statusClass}">${status}</span>
                </div>
            </div>
        `;
    } else {
        resultContainer.innerHTML = `
            <div class="result-card">
                <p style="text-align: center; color: var(--text-light);">Student with roll number ${roll} not found.</p>
            </div>
        `;
    }
}

// Update search handler
function handleUpdateSearch(e) {
    e.preventDefault();
    
    const roll = parseInt(document.getElementById('updateSearchRoll').value);
    const student = students.find(s => s.roll === roll);
    
    if (student) {
        document.getElementById('updateRoll').value = student.roll;
        document.getElementById('updateName').value = student.name;
        document.getElementById('updateMarks').value = student.marks;
        document.getElementById('updateFormContainer').style.display = 'block';
        showToast('Student found! Update the details below.', 'success');
    } else {
        document.getElementById('updateFormContainer').style.display = 'none';
        showToast('Student not found!', 'error');
    }
}

// Update student handler
function handleUpdateStudent(e) {
    e.preventDefault();
    
    const roll = parseInt(document.getElementById('updateRoll').value);
    const newName = document.getElementById('updateName').value.trim();
    const newMarks = parseFloat(document.getElementById('updateMarks').value);
    
    // Validate marks
    if (newMarks < 0 || newMarks > 100) {
        showToast('Marks must be between 0 and 100!', 'error');
        return;
    }
    
    const studentIndex = students.findIndex(s => s.roll === roll);
    
    if (studentIndex !== -1) {
        students[studentIndex].name = newName;
        students[studentIndex].marks = newMarks;
        
        showToast('Student updated successfully!', 'success');
        document.getElementById('updateSearchForm').reset();
        document.getElementById('updateFormContainer').style.display = 'none';
        
        // Update dashboard if visible
        if (document.getElementById('dashboardView').classList.contains('active')) {
            updateDashboard();
        }
    } else {
        showToast('Student not found!', 'error');
    }
}

// Delete student handler
function handleDelete(e) {
    e.preventDefault();
    
    const roll = parseInt(document.getElementById('deleteRoll').value);
    const studentIndex = students.findIndex(s => s.roll === roll);
    
    const resultContainer = document.getElementById('deleteResult');
    
    if (studentIndex !== -1) {
        const student = students[studentIndex];
        
        // Confirm deletion
        if (confirm(`Are you sure you want to delete ${student.name} (Roll: ${student.roll})?`)) {
            students.splice(studentIndex, 1);
            
            resultContainer.innerHTML = `
                <div class="result-card" style="border-left: 4px solid var(--secondary);">
                    <p style="text-align: center; color: var(--secondary);">Student with roll number ${roll} deleted successfully!</p>
                </div>
            `;
            
            showToast('Student deleted successfully!', 'success');
            document.getElementById('deleteForm').reset();
            
            // Update dashboard if visible
            if (document.getElementById('dashboardView').classList.contains('active')) {
                updateDashboard();
            }
        }
    } else {
        resultContainer.innerHTML = `
            <div class="result-card" style="border-left: 4px solid var(--danger);">
                <p style="text-align: center; color: var(--danger);">Student with roll number ${roll} not found.</p>
            </div>
        `;
    }
}

// Filter students
function filterStudents() {
    const filterValue = document.getElementById('filterInput').value.toLowerCase();
    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(filterValue) || 
        s.roll.toString().includes(filterValue)
    );
    displayStudentsInContainer(filteredStudents, 'studentsTable');
}

// Sort students
function sortStudents() {
    const sortBy = document.getElementById('sortSelect').value;
    
    let sortedStudents = [...students];
    
    if (sortBy === 'roll') {
        sortedStudents.sort((a, b) => a.roll - b.roll);
    } else if (sortBy === 'name') {
        sortedStudents.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'marks') {
        sortedStudents.sort((a, b) => b.marks - a.marks);
    }
    
    displayStudentsInContainer(sortedStudents, 'studentsTable');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}