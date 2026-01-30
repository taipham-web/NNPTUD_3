// --- 1. KHỞI TẠO BIẾN TOÀN CỤC ---
let originalData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 5;
let sortDirection = { price: 'asc', title: 'asc' };

// --- 2. HÀM XỬ LÝ URL ẢNH BẨN (QUAN TRỌNG VỚI API ESCUELA) ---
function getCleanImageUrl(imgUrl) {
    if (!imgUrl) return 'https://placehold.co/50?text=No+Img';
    
    let cleanUrl = imgUrl;

    // Trường hợp API trả về mảng dạng chuỗi: "[\"https://...\"]"
    if (typeof cleanUrl === 'string' && cleanUrl.startsWith('["')) {
        try {
            const parsed = JSON.parse(cleanUrl);
            if (Array.isArray(parsed) && parsed.length > 0) {
                cleanUrl = parsed[0];
            }
        } catch (e) {
            // Nếu lỗi parse, bỏ qua
        }
    }

    // Xóa các ký tự thừa như [ ] "
    if (typeof cleanUrl === 'string') {
        cleanUrl = cleanUrl.replace(/[\[\]"]/g, '');
    }

    // Kiểm tra tính hợp lệ
    if (!cleanUrl.startsWith('http')) {
        return 'https://placehold.co/50?text=Error';
    }

    return cleanUrl;
}

// --- 3. HÀM LẤY DỮ LIỆU TỪ API ---
async function getAllProducts() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Đang tải dữ liệu...</td></tr>';

    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        const data = await response.json();
        
        originalData = data;
        filteredData = [...originalData]; // Copy dữ liệu gốc để thao tác

        renderTable();
        renderPagination();
    } catch (error) {
        console.error('Lỗi API:', error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">Lỗi kết nối đến API</td></tr>';
    }
}

// --- 4. HÀM RENDER BẢNG (HIỂN THỊ DỮ LIỆU) ---
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    // Tính toán phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayData = filteredData.slice(startIndex, endIndex);

    // Kiểm tra nếu không có dữ liệu
    if (displayData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Không tìm thấy sản phẩm nào</td></tr>';
        return;
    }

    // Duyệt qua từng sản phẩm để tạo dòng HTML
    displayData.forEach(product => {
        
        // --- XỬ LÝ TOÀN BỘ HÌNH ẢNH ---
        let imagesHtml = '';
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            // Map qua tất cả các ảnh trong mảng
            const imgTags = product.images.map(img => {
                const cleanUrl = getCleanImageUrl(img);
                return `<img src="${cleanUrl}" class="product-img" alt="Img" loading="lazy" onerror="this.src='https://placehold.co/50?text=404'">`;
            }).join('');
            
            imagesHtml = `<div class="image-gallery">${imgTags}</div>`;
        } else {
            imagesHtml = `<div class="image-gallery"><img src="https://placehold.co/50?text=No+Img" class="product-img"></div>`;
        }
        // -------------------------------

        const row = `
            <tr>
                <td>${product.id}</td>
                <td><b>${product.title}</b></td>
                <td>
                    <div class="truncate-text" title="${product.description}">
                        ${product.description}
                    </div>
                </td>
                <td>$${product.price}</td>
                <td>${imagesHtml}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// --- 5. HÀM RENDER PHÂN TRANG ---
function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Nút Trước
    const prevBtn = document.createElement('button');
    prevBtn.innerText = '« Trước';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            renderPagination();
        }
    };
    paginationDiv.appendChild(prevBtn);

    // Thông tin trang
    const pageInfo = document.createElement('span');
    pageInfo.style.fontWeight = "bold";
    pageInfo.innerText = `Trang ${currentPage} / ${totalPages > 0 ? totalPages : 1}`;
    paginationDiv.appendChild(pageInfo);

    // Nút Sau
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Sau »';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            renderPagination();
        }
    };
    paginationDiv.appendChild(nextBtn);
}

// --- 6. CÁC SỰ KIỆN TƯƠNG TÁC ---

// Tìm kiếm
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function(e) {
    const keyword = e.target.value.toLowerCase();
    filteredData = originalData.filter(product => 
        product.title.toLowerCase().includes(keyword)
    );
    currentPage = 1; // Reset về trang 1 khi tìm kiếm
    renderTable();
    renderPagination();
});

// Thay đổi số dòng hiển thị
const pageSizeSelect = document.getElementById('pageSizeSelect');
pageSizeSelect.addEventListener('change', function(e) {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
    renderPagination();
});

// Sắp xếp
function handleSort(column) {
    // Đảo chiều sắp xếp
    sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
    const direction = sortDirection[column];

    filteredData.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        // Nếu là chữ thì chuyển về thường để so sánh chính xác
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable();
}

// --- 7. KHỞI CHẠY ỨNG DỤNG ---
getAllProducts();