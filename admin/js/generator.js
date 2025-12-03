/**
 * admin/js/generator.js
 * COMPLETE FIX: Self-contained styles + Dynamic Form Builder
 */

export function generateProductHTML(product) {
    if (!product) return '';

    // 1. Data Setup (Handle missing images safely)
    const images = (product.images && product.images.length > 0) 
        ? product.images 
        : ['https://placehold.co/600x600?text=No+Image'];
    
    // Default Title/Price
    const title = product.title || 'Untitled Product';
    const price = product.price || 0;
    const oldPrice = product.old_price || 0;
    const desc = product.description || 'No description available.';

    // 2. Build Thumbnails HTML
    const thumbsHtml = images.map((img, idx) => `
        <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="changeImage('${img}', this)">
            <img src="${img}" alt="Thumb ${idx + 1}">
        </div>
    `).join('');

    // 3. Build Dynamic Form (New Form Builder Logic)
    const formHtml = generateDynamicForm(product.customForm || []);

    // 4. Return Final HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="../product.css">

    <style>
        /* Base Reset */
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f9f9f9; }
        
        /* Layout Grid */
        .product-page-container {
            max-width: 1200px;
            margin: 40px auto;
            display: grid;
            grid-template-columns: 1fr 1fr; /* 2 Columns */
            gap: 40px;
            padding: 20px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        /* Left Column: Media */
        .media-column { display: flex; flex-direction: column; gap: 15px; }
        .main-image-frame {
            width: 100%;
            aspect-ratio: 1/1;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #ddd;
        }
        .main-image-frame img, .main-image-frame video {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        /* Thumbnails - Explicitly Styled */
        .thumbs-container {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 5px 0;
        }
        .thumb-item {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
            border: 2px solid transparent;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            opacity: 0.7;
            transition: all 0.2s;
        }
        .thumb-item.active, .thumb-item:hover {
            border-color: #4f46e5;
            opacity: 1;
        }
        .thumb-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Right Column: Form */
        .details-column { display: flex; flex-direction: column; gap: 20px; }
        .product-title { font-size: 2rem; margin: 0; color: #111; line-height: 1.2; }
        
        .price-tag { font-size: 1.8rem; color: #4f46e5; font-weight: 800; display: flex; align-items: center; gap: 15px; }
        .old-price { font-size: 1.1rem; color: #999; text-decoration: line-through; font-weight: normal; }

        /* Form Styling */
        .custom-form-group { margin-bottom: 15px; }
        .form-label { display: block; font-weight: 600; margin-bottom: 6px; color: #333; }
        .form-input { 
            width: 100%; padding: 12px; 
            border: 1px solid #ddd; border-radius: 6px; 
            font-size: 1rem; transition: 0.2s;
        }
        .form-input:focus { border-color: #4f46e5; outline: none; }

        /* Options (Radio/Checkbox) */
        .options-grid { display: flex; flex-direction: column; gap: 8px; }
        .option-card {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 15px;
            border: 1px solid #eee; border-radius: 6px;
            cursor: pointer; transition: 0.1s;
        }
        .option-card:hover { background: #f5f7ff; border-color: #4f46e5; }
        .option-card input { transform: scale(1.2); margin-right: 10px; }
        .extra-price { color: #4f46e5; font-weight: 700; font-size: 0.9rem; }

        /* Conditionals */
        .conditional-field {
            margin-top: 10px;
            padding: 15px;
            background: #f0f7ff;
            border-radius: 8px;
            border-left: 4px solid #4f46e5;
            display: none; /* Hidden by default */
        }
        .conditional-field.visible { display: block; animation: fadeIn 0.3s; }

        /* Checkout Button */
        .btn-checkout {
            width: 100%;
            padding: 18px;
            background: #4f46e5;
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
            transition: 0.2s;
        }
        .btn-checkout:hover { background: #3730a3; transform: translateY(-2px); }

        @keyframes fadeIn { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:translateY(0); } }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .product-page-container { grid-template-columns: 1fr; padding: 15px; margin: 10px; }
        }
    </style>
</head>
<body>

    <div class="product-page-container">
        <div class="media-column">
            <div class="main-image-frame" id="mainDisplay">
                ${product.video_url 
                  ? `<video src="${product.video_url}" controls poster="${images[0]}" style="width:100%;height:100%"></video>` 
                  : `<img src="${images[0]}" alt="Main Product Image">`
                }
            </div>
            
            <div class="thumbs-container">
                ${product.video_url ? `
                <div class="thumb-item" onclick="playMainVideo('${product.video_url}')">
                    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#eee; font-size:24px;">▶</div>
                </div>` : ''}
                ${thumbsHtml}
            </div>

            <div style="margin-top: 20px; color: #555; line-height: 1.6;">
                <h3>Description</h3>
                <p>${desc.replace(/\n/g, '<br>')}</p>
            </div>
        </div>

        <div class="details-column">
            <div>
                <h1 class="product-title">${title}</h1>
                <div class="price-tag">
                    <span id="displayPrice">${price}</span> PKR
                    ${oldPrice > 0 ? `<span class="old-price">${oldPrice} PKR</span>` : ''}
                </div>
            </div>

            <form id="productForm" onsubmit="handleOrder(event)">
                ${formHtml}

                <button type="submit" class="btn-checkout">
                    Order Now - <span id="btnPrice">${price}</span> PKR
                </button>
            </form>
        </div>
    </div>

    <script>
        const BASE_PRICE = ${price};

        // 1. Image Switcher
        function changeImage(src, thumbEl) {
            const display = document.getElementById('mainDisplay');
            display.innerHTML = '<img src="' + src + '" style="max-width:100%; max-height:100%; object-fit:contain;">';
            
            // Update active styling
            document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
            if(thumbEl) thumbEl.classList.add('active');
        }

        function playMainVideo(url) {
            const display = document.getElementById('mainDisplay');
            display.innerHTML = '<video src="' + url + '" controls autoplay style="width:100%; height:100%"></video>';
        }

        // 2. Price & Logic Calculation
        function updateCalculations() {
            let total = BASE_PRICE;
            
            // Handle Selects
            document.querySelectorAll('select.calc-trigger').forEach(sel => {
                const opt = sel.options[sel.selectedIndex];
                total += parseFloat(opt.getAttribute('data-price')) || 0;
                
                // Show Conditionals
                const targetId = sel.getAttribute('data-cond-target');
                if(targetId) {
                    const wrap = document.getElementById(targetId);
                    wrap.innerHTML = ''; // Reset
                    
                    const fQty = parseInt(opt.getAttribute('data-file-qty')) || 0;
                    const tLbl = opt.getAttribute('data-text-label');
                    
                    if(fQty > 0 || tLbl) {
                        let h = '';
                        if(fQty) for(let i=1; i<=fQty; i++) h += '<div style="margin-bottom:10px"><label>Upload File '+i+' *</label><input type="file" required class="form-input"></div>';
                        if(tLbl) h += '<div><label>'+tLbl+' *</label><input type="text" required class="form-input"></div>';
                        
                        wrap.innerHTML = h;
                        wrap.classList.add('visible');
                    } else {
                        wrap.classList.remove('visible');
                    }
                }
            });

            // Handle Radios/Checkboxes
            document.querySelectorAll('input.calc-trigger').forEach(inp => {
                const condId = inp.getAttribute('data-cond-id');
                const wrap = document.getElementById(condId);

                if(inp.checked) {
                    total += parseFloat(inp.getAttribute('data-price')) || 0;
                    if(wrap) {
                        wrap.classList.add('visible');
                        wrap.querySelectorAll('input').forEach(i => i.disabled = false);
                    }
                } else {
                    if(wrap && inp.type !== 'radio') { // Radio logic handled by other radio checking
                         wrap.classList.remove('visible');
                         wrap.querySelectorAll('input').forEach(i => i.disabled = true);
                    }
                     // Special case for radio: we need to hide the unchecked sibling's conditional
                    if(inp.type === 'radio' && !inp.checked && wrap) {
                         wrap.classList.remove('visible');
                         wrap.querySelectorAll('input').forEach(i => i.disabled = true);
                    }
                }
            });

            document.getElementById('displayPrice').innerText = total;
            document.getElementById('btnPrice').innerText = total;
        }

        // Listen for changes
        document.addEventListener('change', (e) => {
            if(e.target.classList.contains('calc-trigger')) updateCalculations();
        });

        // 3. Submit Handler
        function handleOrder(e) {
            e.preventDefault();
            const btn = document.querySelector('.btn-checkout');
            btn.innerText = 'Processing...';
            setTimeout(() => {
                alert('Order Placed Successfully! (Demo)');
                window.location.reload();
            }, 1000);
        }
    </script>
</body>
</html>`;
}

// --- HELPER: FORM FIELD GENERATOR ---

function generateDynamicForm(fields) {
    if(!fields || fields.length === 0) return '<p style="color:#666;">No customization options.</p>';

    return fields.map((f, i) => {
        const type = f._type;
        const label = f.label;
        const req = f.required ? 'required' : '';
        const star = f.required ? '<span style="color:red">*</span>' : '';

        // Header
        if(type === 'header') return `<h3 style="border-bottom:2px solid #eee; padding-bottom:5px; margin-top:25px;">${label}</h3>`;

        // Text Inputs
        if(['text','email','number','date'].includes(type)) {
            return `
            <div class="custom-form-group">
                <label class="form-label">${label} ${star}</label>
                <input type="${type}" name="${label}" class="form-input" ${req}>
            </div>`;
        }

        // File
        if(type === 'file') {
            return `
            <div class="custom-form-group">
                <label class="form-label">${label} ${star}</label>
                <input type="file" name="${label}" class="form-input" ${req}>
            </div>`;
        }

        // Select (Dropdown)
        if(type === 'select') {
            const condTarget = `cond_select_${i}`;
            const opts = f.options_list.map(o => `
                <option value="${o.label}" 
                    data-price="${o.price}"
                    data-file-qty="${o.file_qty||0}"
                    data-text-label="${o.text_label||''}">
                    ${o.label} ${o.price>0 ? '(+'+o.price+')' : ''}
                </option>
            `).join('');

            return `
            <div class="custom-form-group">
                <label class="form-label">${label} ${star}</label>
                <select name="${label}" class="form-input calc-trigger" data-cond-target="${condTarget}" ${req}>
                    <option value="" data-price="0">Select Option</option>
                    ${opts}
                </select>
                <div id="${condTarget}" class="conditional-field"></div>
            </div>`;
        }

        // Radio / Checkbox
        if(type === 'radio' || type === 'checkbox_group') {
            const isRadio = type === 'radio';
            const opts = f.options_list.map((o, idx) => {
                const condId = `cond_opt_${i}_${idx}`;
                const hasCond = (o.file_qty > 0 || o.text_label);
                
                let condHtml = '';
                if(hasCond) {
                    condHtml = `<div id="${condId}" class="conditional-field">`;
                    if(o.file_qty) for(let k=1; k<=o.file_qty; k++) condHtml += `<div style="margin-bottom:5px"><small>Upload File ${k} *</small><input type="file" class="form-input" disabled required></div>`;
                    if(o.text_label) condHtml += `<div><small>${o.text_label} *</small><input type="text" class="form-input" disabled required></div>`;
                    condHtml += `</div>`;
                }

                return `
                <div>
                    <label class="option-card">
                        <div style="display:flex; align-items:center;">
                            <input type="${isRadio?'radio':'checkbox'}" 
                                   name="${label}${isRadio?'':'[]'}" 
                                   class="calc-trigger"
                                   data-price="${o.price}"
                                   data-cond-id="${hasCond ? condId : ''}"
                                   ${isRadio && f.required ? 'required' : ''}>
                            <span>${o.label}</span>
                        </div>
                        ${o.price>0 ? `<span class="extra-price">+${o.price}</span>` : ''}
                    </label>
                    ${condHtml}
                </div>`;
            }).join('');

            return `
            <div class="custom-form-group">
                <label class="form-label">${label} ${star}</label>
                <div class="options-grid">${opts}</div>
            </div>`;
        }
        return '';
    }).join('');
}
