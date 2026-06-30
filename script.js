const studentForm = document.getElementById('studentForm');
const tableBody = document.getElementById('studentTableBody');
const emptyState = document.getElementById('emptyState');
const undoToast = document.getElementById('undoToast');

let students = JSON.parse(localStorage.getItem('students')) || [];
let currentSortOrder = 'asc'; // 'asc' သို့မဟုတ် 'desc'
let recentlyDeleted = null;   // ယာယီဖျက်လိုက်တဲ့ student ကိုသိမ်းဖို့
let toastTimeout = null;

// 1. Table Render လုပ်ခြင်း (Sorting Logic အပါအဝင်)
function renderTable() {
    tableBody.innerHTML = '';
    
    if (students.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    // Roll Number အလိုက် Sort စီခြင်း
    students.sort((a, b) => {
        // စာသား သို့မဟုတ် ကိန်းဂဏန်း နှစ်မျိုးလုံး စီလို့ရအောင် localeCompare သုံးထားပါတယ်
        return currentSortOrder === 'asc' 
            ? a.roll.localeCompare(b.roll, undefined, {numeric: true, sensitivity: 'base'})
            : b.roll.localeCompare(a.roll, undefined, {numeric: true, sensitivity: 'base'});
    });

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="py-3 px-4 font-medium">${student.roll}</td>
            <td class="py-3 px-4">${student.name}</td>
            <td class="py-3 px-4">${student.class}</td>
            <td class="py-3 px-4">${student.dob}</td>
            <td class="py-3 px-4 text-center">
                <button onclick="deleteStudent(${index})" class="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 px-2 py-1 rounded border border-red-200 hover:bg-red-100 transition">
                    Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 2. Sorting ကို အပြောင်းအလဲလုပ်မည့် Function
function toggleSort() {
    currentSortOrder = (currentSortOrder === 'asc') ? 'desc' : 'asc';
    document.getElementById('sortIcon').innerText = (currentSortOrder === 'asc') ? '🔼' : '🔽';
    renderTable();
}

// 3. Add Student
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newStudent = {
        name: document.getElementById('studentName').value.trim(),
        roll: document.getElementById('studentRoll').value.trim(),
        class: document.getElementById('studentClass').value.trim(),
        dob: document.getElementById('studentDOB').value
    };

    if (students.some(s => s.roll === newStudent.roll)) {
        alert('This Roll Number/ID is already registered!');
        return;
    }

    students.push(newStudent);
    saveAndRefresh();
    studentForm.reset();
});

// 4. Delete Student & Show Undo Notification
function deleteStudent(index) {
    // ပျက်သွားတဲ့အချက်အလက်ကို မပျောက်အောင် ခေတ္တသိမ်းထားမယ်
    recentlyDeleted = {
        data: students[index],
        index: index
    };

    students.splice(index, 1);
    saveAndRefresh();
    showToast(`Deleted ${recentlyDeleted.data.name}`);
}

// 5. Undo လုပ်ဆောင်ချက်
function triggerUndo() {
    if (recentlyDeleted) {
        // မူလဖျက်ခဲ့တဲ့ နေရာ (index) ထဲကို ပြန်ထည့်ပေးတာပါ
        students.splice(recentlyDeleted.index, 0, recentlyDeleted.data);
        recentlyDeleted = null;
        saveAndRefresh();
        hideToast();
    }
}

// 6. Toast Notification Helpers
function showToast(message) {
    document.getElementById('toastMessage').innerText = message;
    undoToast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    
    // ယခင် timer ရှိရင် ဖျက်ပြီး ၅ စက္ကန့်အသစ် ပြန်စမယ်
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(hideToast, 5000); 
}

function hideToast() {
    undoToast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    recentlyDeleted = null; // ၅ စက္ကန့်ကျော်သွားရင် ပြန်ယူလို့မရတော့အောင် ဖျက်ပစ်မယ်
}

function saveAndRefresh() {
    localStorage.setItem('students', JSON.stringify(students));
    renderTable();
}

renderTable();