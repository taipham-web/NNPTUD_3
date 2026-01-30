// Biến toàn cục để lưu trạng thái
let originalData = []; // Dữ liệu gốc từ API
let filteredData = []; // Dữ liệu sau khi tìm kiếm/sắp xếp
let currentPage = 1;
let itemsPerPage = 5;
let sortDirection = {
    price: 'asc',
    title: 'asc'
};

// 1. Hàm getall: Lấy dữ liệu từ API
async function getAllProducts() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        const data = await response.json();
        
        // Lưu dữ liệu
        originalData = data;
        filteredData = [...originalData]; // Copy dữ liệu để thao tác

        renderTable();
        renderPagination();
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        document.getElementById('tableBody').innerHTML = '<tr><td colspan="4">Không thể tải dữ liệu</td></tr>';
    }
}

// 2. Hàm render bảng dữ liệu
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    // Tính toán phân trang (Slice dữ liệu)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayData = filteredData.slice(startIndex, endIndex);

    if (displayData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Không tìm thấy sản phẩm</td></tr>';
        return;
    }

    displayData.forEach(product => {
        // Xử lý hiển thị toàn bộ hình ảnh
        let imagesHtml = '';
        if (product.images && Array.isArray(product.images)) {
            // Lọc và làm sạch URL ảnh (API này đôi khi trả về chuỗi JSON lỗi trong mảng)
            imagesHtml = product.images.map(img => {
                let cleanUrl = img.replace(/[\[\]"]/g, ''); // Fix lỗi format của API EscuelaJS đôi khi gặp
                return `<img src="${cleanUrl}" class="product-img" alt="${product.title}" onerror="this.src='https://placehold.co/50'">`;
            }).join('');
        }

        const row = `
            <tr>
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>$${product.price}</td>
                <td>${imagesHtml}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// 3. Hàm render phân trang
function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Nút Previous
    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Trước';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            renderPagination();
        }
    };
    paginationDiv.appendChild(prevBtn);

    // Hiển thị số trang (rút gọn nếu cần, ở đây làm đơn giản)
    const pageInfo = document.createElement('span');
    pageInfo.style.padding = "8px";
    pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
    paginationDiv.appendChild(pageInfo);

    // Nút Next
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Sau';
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            renderPagination();
        }
    };
    paginationDiv.appendChild(nextBtn);
}

// 4. Tìm kiếm theo Title (onChange / onInput)
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function(e) {
    const keyword = e.target.value.toLowerCase();
    
    // Lọc dữ liệu từ bản gốc
    filteredData = originalData.filter(product => 
        product.title.toLowerCase().includes(keyword)
    );

    // Reset về trang 1 sau khi tìm kiếm
    currentPage = 1;
    renderTable();
    renderPagination();
});

// 5. Thay đổi số lượng hiển thị (5, 10, 20)
const pageSizeSelect = document.getElementById('pageSizeSelect');
pageSizeSelect.addEventListener('change', function(e) {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
    renderPagination();
});

// 6. Sắp xếp (Sort) tăng/giảm theo Giá và Tên
function handleSort(column) {
    // Đảo ngược trạng thái sắp xếp
    sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
    const direction = sortDirection[column];

    filteredData.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        // Nếu là tên thì chuyển về chữ thường để so sánh
        if (column === 'title') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable();
}

// Khởi chạy ứng dụng
getAllProducts();