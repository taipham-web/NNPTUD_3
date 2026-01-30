// Biến toàn cục
let originalData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 5; // Mặc định hiển thị 5 dòng (khớp với screenshot)
let sortDirection = { price: 'asc', title: 'asc' };

// --- HÀM MỚI: XỬ LÝ LỖI URL ẢNH ---
function getCleanImageUrl(imgUrl) {
    if (!imgUrl) return 'https://placehold.co/50?text=No+Image';
    
    let cleanUrl = imgUrl;

    // Trường hợp 1: API trả về chuỗi JSON stringified (ví dụ: "[\"https://...\"]")
    if (typeof cleanUrl === 'string' && cleanUrl.startsWith('["')) {
        try {
            // Cố gắng parse chuỗi JSON để lấy mảng thật
            const parsed = JSON.parse(cleanUrl);
            // Nếu parse thành công và ra mảng, lấy phần tử đầu tiên
            if (Array.isArray(parsed) && parsed.length > 0) {
                cleanUrl = parsed[0];
            }
        } catch (e) {
            // Nếu lỗi parse, giữ nguyên để regex xử lý
        }
    }

    // Trường hợp 2: Vẫn còn dính ký tự thừa [] hoặc "
    if (typeof cleanUrl === 'string') {
        cleanUrl = cleanUrl.replace(/[\[\]"]/g, '');
    }

    // Kiểm tra nếu URL không hợp lệ (không bắt đầu bằng http)
    if (!cleanUrl.startsWith('http')) {
        return 'https://placehold.co/50?text=Error';
    }

    return cleanUrl;
}
// ------------------------------------

async function getAllProducts() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        const data = await response.json();
        
        originalData = data;
        filteredData = [...originalData];

        renderTable(); // Hoặc renderGrid() nếu bạn đang dùng Grid
        renderPagination();
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        document.getElementById('tableBody').innerHTML = '<tr><td colspan="4">Không thể tải dữ liệu</td></tr>';
    }
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return; 
    
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayData = filteredData.slice(startIndex, endIndex);

    if (displayData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Không tìm thấy sản phẩm</td></tr>'; // Lưu ý colspan="5" vì thêm 1 cột
        return;
    }

    displayData.forEach(product => {
        // Xử lý hình ảnh (Giữ nguyên logic cũ của bạn)
        let imagesHtml = '';
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            let cleanUrl = getCleanImageUrl(product.images[0]);
            imagesHtml = `<img src="${cleanUrl}" class="product-img" alt="${product.title}" 
                          onerror="this.src='https://placehold.co/50?text=404'">`;
        } else {
            imagesHtml = `<img src="https://placehold.co/50?text=No+Image" class="product-img">`;
        }

        // --- CẬP NHẬT DÒNG HTML DƯỚI ĐÂY ---
        // Thêm class 'truncate-text' vào mô tả để nó không làm bảng quá dài
        const row = `
            <tr>
                <td>${product.id}</td>
                <td><b>${product.title}</b></td>
                <td><div class="truncate-text" title="${product.description}">${product.description}</div></td>
                <td>$${product.price}</td>
                <td>${imagesHtml}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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

    const pageInfo = document.createElement('span');
    pageInfo.style.padding = "8px";
    pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
    paginationDiv.appendChild(pageInfo);

    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Sau';
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

// Xử lý tìm kiếm
const searchInput = document.getElementById('searchInput');
if(searchInput) {
    searchInput.addEventListener('input', function(e) {
        const keyword = e.target.value.toLowerCase();
        filteredData = originalData.filter(product => 
            product.title.toLowerCase().includes(keyword)
        );
        currentPage = 1;
        renderTable();
        renderPagination();
    });
}

// Xử lý thay đổi số lượng dòng
const pageSizeSelect = document.getElementById('pageSizeSelect');
if(pageSizeSelect) {
    pageSizeSelect.addEventListener('change', function(e) {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
        renderPagination();
    });
}

// Xử lý sắp xếp
function handleSort(column) {
    sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
    const direction = sortDirection[column];

    filteredData.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

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

// Khởi chạy
getAllProducts();