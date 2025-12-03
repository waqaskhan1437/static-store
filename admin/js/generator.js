/**
 * admin/js/generator.js
 * Generates product HTML matching the EXACT structure of demo-product-1.html
 * Integrates: Dynamic Form Builder + Globol Layout
 */

export function generateProductHTML(product) {
    if (!product) return '';

    // 1. Setup Data
    // Agar images nahi hain to placeholder lagaye
    const images = (product.images && product.images.length > 0) 
        ? product.images 
        : ['https://placehold.co/600x600?text=No+Image'];
        
    const title = product.title || 'Untitled Product';
    const price = product.price || 0;
    const oldPrice = product.old_price || 0;
    const desc = product.description || '';
    
    // 2. Generate Thumbnails HTML (Exactly like demo-product-1)
    const thumbsHtml = images.map((img, index) => 
        `<img src="${img}" class="${index === 0 ? 'active-thumb' : ''}" onclick="changeMedia('${img}', this)" alt="Thumb">`
    ).join('');

    // 3. Generate Form Fields (Dynamic from Form Builder)
    const formFieldsHtml = generateFormFields(product.customForm || []);

    // 4. Return Full HTML Page
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${product.seoDescription || title}">
    
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="../product.css">
    
    <style>
        /* Fallback CSS agar product.css load na ho */
        .product-container { display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; max-width: 1100px; margin: 40px auto; padding: 0 20px; }
        .media-col { display: flex; flex-direction: column; gap: 15px; }
        .media-frame { width: 100%; aspect-ratio: 1/1; background: #f3f4f6; border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; }
        .media-frame img, .media-frame video { max-width: 100%; max-height: 100%; object-fit: contain; }
        .thumbs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; }
        .thumbs img { width: 70px; height: 70px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; object-fit: cover; opacity: 0.7; transition: 0.3s; }
        .thumbs img:hover, .thumbs img.active-thumb { border-color: #4f46e5; opacity: 1; }
        
        .form-col { padding: 10px; }
        .product-title { font-size: 2rem; margin-bottom: 10px; color: #111; }
        .price-box { font-size: 1.5rem; color: #4f46e5; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; }
        .old-price { color: #999; text-decoration: line-through; font-size: 1rem; font-weight: normal; }
        
        /* Form Field Styles */
        .custom-field { margin-bottom: 15px; }
        .custom-field label { display: block; font-weight: 600; margin-bottom: 5px; color: #374151; font-size: 0.95rem; }
        .form-control { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; }
        .req-star { color: red; }
        
        /* Options & Conditional Logic Styles */
        .opt-group { display: flex; flex-direction: column; gap: 8px; }
        .opt-row { display: flex; align-items: center; justify-content: space-between; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; transition: 0.2s; }
        .opt-row:hover { background: #f9fafb; border-color: #cbd5e1; }
        .opt-row input { margin-right: 10px; accent-color: #4f46e5; transform: scale(1.2); }
        .opt-price { font-weight: bold; color: #4f46e5; font-size: 0.9rem; }
        
        .cond-wrap { margin-top: 10px; padding: 12px; background: #eff6ff; border-radius: 6px; display: none; border-left: 3px solid #4f46e5; }
        .cond-wrap.show { display: block; animation: fadeIn 0.3s ease-in-out; }
        
        .btn-buy { background: #4f46e5; color: white; border: none; width: 100%; padding: 15px; font-size: 1.1rem; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 20px; transition: 0.3s; }
        .btn-buy:hover { background: #4338ca; }
        
        .desc-box { margin-top: 30px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; line-height: 1.6; color: #4b5563; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        @media(max-width: 768px) { .product-container { grid-template-columns: 1fr; } }
    </style>
</head>
<body>

    <div class="product-container">
        <div class="media-col">
            <div class="media-frame" id="main-frame">
                ${product.video_url 
                  ? `<video src="${product.video_url}" controls poster="${images[0]}"></video>` 
                  : `<img src="${images[0]}" id="main-img" alt="${title}">`
                }
            </div>
            <div class="thumbs">
                ${product.video_url ? `<img src="https://img.icons8.com/ios-filled/50/000000/video.png" onclick="playVideo('${product.video_url}')" style="padding:15px; background:#eee">` : ''}
                ${thumbsHtml}
            </div>
            
            <div class="desc-box">
                <h3>Product Details</h3>
                <p>${desc.replace(/\n/g, '<br>')}</p>
            </div>
        </div>

        <div class="form-col">
            <h1 class="product-title">${title}</h1>
            
            <div class="price-box">
                <span id="display-price">${price}</span> PKR
                ${oldPrice > 0 ? `<span class="old-price">${oldPrice} PKR</span>` : ''}
            </div>

            <form id="orderForm" onsubmit="handleSubmit(event)">
                ${formFieldsHtml}
                
                <button type="submit" class="btn-buy">
                    Order Now - <span id="btn-price">${price}</span> PKR
                </button>
            </form>
        </div>
    </div>

    <script>
        const BASE_PRICE = ${price};
        
        // 1. Image Switcher
        function changeMedia(src, el) {
            const frame = document.getElementById('main-frame');
            frame.innerHTML = '<img src="' + src + '" style="max-width:100%; max-height:100%; object-fit:contain;">';
            
            // Highlight active thumb
            document.querySelectorAll('.thumbs img').forEach(img => img.classList.remove('active-thumb'));
            if(el) el.classList.add('active-thumb');
        }
        
        function playVideo(url) {
            const frame = document.getElementById('main-frame');
            frame.innerHTML = '<video src="' + url + '" controls autoplay style="width:100%; height:100%"></video>';
        }

        // 2. Price Calculation & Conditionals Logic
        function updatePrice() {
            let total = BASE_PRICE;
            
            // Select Inputs
            document.querySelectorAll('select.price-trigger').forEach(sel => {
                const opt = sel.options[sel.selectedIndex];
                total += parseFloat(opt.getAttribute('data-price')) || 0;
                
                // Show/Hide Conditionals for Select
                const condId = sel.getAttribute('data-cond-id');
                if (condId) {
                    const wrap = document.getElementById(condId);
                    wrap.innerHTML = ''; // Clear
                    
                    const fileQty = parseInt(opt.getAttribute('data-file-qty')) || 0;
                    const textLabel = opt.getAttribute('data-text-label');
                    
                    let html = '';
                    if(fileQty > 0) {
                        for(let i=1; i<=fileQty; i++) html += '<div style="margin-top:10px"><label style="font-size:0.9rem">Upload File '+i+' <span style="color:red">*</span></label><input type="file" required class="form-control"></div>';
                    }
                    if(textLabel) {
                        html += '<div style="margin-top:10px"><label style="font-size:0.9rem">'+textLabel+' <span style="color:red">*</span></label><input type="text" required class="form-control" placeholder="Type here..."></div>';
                    }
                    
                    if(html) {
                        wrap.innerHTML = html;
                        wrap.classList.add('show');
                    } else {
                        wrap.classList.remove('show');
                    }
                }
            });

            // Radio/Checkbox Inputs
            document.querySelectorAll('input.price-trigger').forEach(inp => {
                const condId = inp.getAttribute('data-cond-target');
                const wrap = document.getElementById(condId);
                
                if (inp.checked) {
                    total += parseFloat(inp.getAttribute('data-price')) || 0;
                    if(wrap) {
                        wrap.classList.add('show');
                        wrap.querySelectorAll('input').forEach(i => i.disabled = false);
                    }
                } else {
                    if(wrap) {
                        wrap.classList.remove('show');
                        wrap.querySelectorAll('input').forEach(i => i.disabled = true);
                    }
                }
            });

            document.getElementById('display-price').innerText = total;
            document.getElementById('btn-price').innerText = total;
        }

        // Event Listeners for Live Update
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('price-trigger') || e.target.tagName === 'SELECT') {
                updatePrice();
            }
        });

        // 3. Form Submit
        function handleSubmit(e) {
            e.preventDefault();
            const btn = document.querySelector('.btn-buy');
            btn.innerHTML = 'Processing...';
            setTimeout(() => {
                alert('Thank you! Order Placed for ' + document.getElementById('btn-price').innerText + ' PKR');
                btn.innerHTML = 'Order Placed';
            }, 1000);
        }
    </script>
</body>
</html>`;
}

// --- HELPER FUNCTIONS ---

function generateFormFields(fields) {
    if (!fields || fields.length === 0) return '<p>No options available.</p>';

    return fields.map((field, idx) => {
        const type = field._type;
        const label = field.label || 'Field';
        const req = field.required ? 'required' : '';
        const reqHtml = field.required ? '<span class="req-star">*</span>' : '';

        // 1. HEADER
        if (type === 'header') return `<h3 style="margin-top:20px; border-bottom:1px solid #ddd; padding-bottom:5px;">${label}</h3>`;

        // 2. TEXT / EMAIL / DATE
        if (['text', 'email', 'date', 'number'].includes(type)) {
            return `
            <div class="custom-field">
                <label>${label} ${reqHtml}</label>
                <input type="${type}" name="${label}" class="form-control" ${req}>
            </div>`;
        }
        
        // 3. TEXTAREA
        if (type === 'textarea') {
            return `
            <div class="custom-field">
                <label>${label} ${reqHtml}</label>
                <textarea name="${label}" rows="3" class="form-control" ${req}></textarea>
            </div>`;
        }

        // 4. FILE
        if (type === 'file') {
            return `
            <div class="custom-field">
                <label>${label} ${reqHtml}</label>
                <input type="file" name="${label}" class="form-control" ${req}>
            </div>`;
        }

        // 5. SELECT (Dropdown)
        if (type === 'select') {
            const condContainerId = `cond_select_${idx}`;
            let optionsHtml = `<option value="" data-price="0">Select Option</option>`;
            
            field.options_list.forEach((opt) => {
                const priceTxt = opt.price > 0 ? ` (+${opt.price})` : '';
                optionsHtml += `
                    <option value="${opt.label}" 
                            data-price="${opt.price || 0}"
                            data-file-qty="${opt.file_qty || 0}"
                            data-text-label="${opt.text_label || ''}">
                        ${opt.label}${priceTxt}
                    </option>`;
            });

            return `
            <div class="custom-field">
                <label>${label} ${reqHtml}</label>
                <select name="${label}" class="form-control price-trigger" data-cond-id="${condContainerId}" ${req}>
                    ${optionsHtml}
                </select>
                <div id="${condContainerId}" class="cond-wrap"></div>
            </div>`;
        }

        // 6. RADIO & CHECKBOX
        if (type === 'radio' || type === 'checkbox_group') {
            const isRadio = type === 'radio';
            let optionsHtml = `<div class="opt-group">`;
            
            field.options_list.forEach((opt, optIdx) => {
                const uniqueId = `opt_${idx}_${optIdx}`;
                const condId = `cond_opt_${idx}_${optIdx}`;
                const hasCond = (opt.file_qty > 0 || opt.text_label);
                
                // Prepare Conditional Inputs HTML (Hidden by default)
                let condInputs = '';
                if (hasCond) {
                    condInputs = `<div id="${condId}" class="cond-wrap">`;
                    if (opt.file_qty) {
                         for(let i=1; i<=opt.file_qty; i++) condInputs += `<div style="margin-bottom:5px"><small>Upload File ${i} *</small><input type="file" class="form-control" disabled required></div>`;
                    }
                    if (opt.text_label) {
                         condInputs += `<div><small>${opt.text_label} *</small><input type="text" class="form-control" disabled required></div>`;
                    }
                    condInputs += `</div>`;
                }

                optionsHtml += `
                <div>
                    <label class="opt-row" for="${uniqueId}">
                        <div style="display:flex; align-items:center;">
                            <input type="${isRadio ? 'radio' : 'checkbox'}" 
                                   id="${uniqueId}"
                                   name="${label}${isRadio ? '' : '[]'}" 
                                   class="price-trigger"
                                   data-price="${opt.price || 0}"
                                   data-cond-target="${hasCond ? condId : ''}"
                                   ${isRadio && field.required ? 'required' : ''}>
                            <span>${opt.label}</span>
                        </div>
                        ${opt.price > 0 ? `<span class="opt-price">+${opt.price}</span>` : ''}
                    </label>
                    ${condInputs}
                </div>`;
            });
            optionsHtml += `</div>`;

            return `
            <div class="custom-field">
                <label>${label} ${reqHtml}</label>
                ${optionsHtml}
            </div>`;
        }

        return '';
    }).join('');
}
