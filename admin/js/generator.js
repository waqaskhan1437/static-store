/**
 * admin/js/generator.js
 * FIXED: Matches 'demo-product-1.html' layout perfectly using internal styles.
 * Integrates: Layout + New Form Builder
 */

export function generateProductHTML(product) {
    if (!product) return '';

    // 1. Data Setup
    const images = (product.images && product.images.length > 0) 
        ? product.images 
        : ['https://placehold.co/600x600?text=No+Image'];
    
    const title = product.title || 'Untitled Product';
    const price = product.price || 0;
    const oldPrice = product.old_price || 0;
    const desc = product.description || '';

    // 2. Thumbnails Logic
    const thumbsHtml = images.map((img, idx) => `
        <img src="${img}" 
             class="thumb-img ${idx === 0 ? 'active' : ''}" 
             onclick="changeMedia('${img}', this)" 
             alt="Thumbnail">
    `).join('');

    // 3. Form Logic
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
        :root { --primary: #4f46e5; --text: #1f2937; --bg: #f9fafb; --border: #e5e7eb; }
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; background: var(--bg); color: var(--text); }

        /* --- MAIN LAYOUT (Matches Old Product) --- */
        .product-container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
            display: grid;
            grid-template-columns: 1.2fr 1fr; /* Image gets slightly more space */
            gap: 3rem;
            align-items: start;
        }

        /* --- LEFT: MEDIA SECTION --- */
        .media-col { display: flex; flex-direction: column; gap: 1rem; }
        
        .media-frame {
            width: 100%;
            aspect-ratio: 1/1; /* Square Image like demo */
            background: #fff;
            border-radius: 12px;
            border: 1px solid var(--border);
            overflow: hidden;
            display: flex; align-items: center; justify-content: center;
        }
        .media-frame img, .media-frame video { width: 100%; height: 100%; object-fit: contain; }

        .thumbs-row { display: flex; gap: 0.8rem; overflow-x: auto; padding-bottom: 5px; }
        .thumb-img {
            width: 70px; height: 70px;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            object-fit: cover;
            background: #fff;
            transition: 0.2s;
        }
        .thumb-img:hover, .thumb-img.active { border-color: var(--primary); transform: translateY(-2px); }

        .desc-box { margin-top: 1.5rem; line-height: 1.6; color: #4b5563; background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); }

        /* --- RIGHT: FORM SECTION --- */
        .form-col { 
            background: #fff; 
            padding: 2rem; 
            border-radius: 16px; 
            border: 1px solid var(--border);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            position: sticky; top: 2rem; /* Floats nicely */
        }

        h1 { font-size: 1.8rem; font-weight: 800; margin: 0 0 0.5rem 0; line-height: 1.2; }
        
        .price-wrapper { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
        .current-price { font-size: 2rem; font-weight: 800; color: var(--primary); }
        .old-price { font-size: 1.1rem; color: #9ca3af; text-decoration: line-through; }

        /* Form Inputs */
        .field-group { margin-bottom: 1.2rem; }
        .field-label { display: block; font-weight: 600; margin-bottom: 0.4rem; font-size: 0.95rem; }
        .form-control { 
            width: 100%; padding: 0.8rem; 
            border: 1px solid #d1d5db; border-radius: 8px; 
            font-size: 1rem; transition: 0.2s;
        }
        .form-control:focus { border-color: var(--primary); outline: none; ring: 2px solid #e0e7ff; }

        /* Options (Radio/Checkbox) */
        .opts-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .opt-item {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.8rem 1rem;
            border: 1px solid var(--border); border-radius: 8px;
            cursor: pointer; transition: 0.1s;
        }
        .opt-item:hover { background: #f9fafb; border-color: #9ca3af; }
        .opt-item input { accent-color: var(--primary); width: 1.2rem; height: 1.2rem; }

        /* Conditionals */
        .cond-box { 
            margin-top: 0.8rem; padding: 1rem; 
            background: #eff6ff; border-radius: 8px; 
            border-left: 4px solid var(--primary);
            display: none; 
        }
        .cond-box.show { display: block; animation: fadeUp 0.3s; }

        /* Button */
        .btn-main {
            width: 100%; padding: 1rem;
            background: var(--primary); color: white;
            font-size: 1.1rem; font-weight: 700;
            border: none; border-radius: 10px;
            cursor: pointer; margin-top: 1.5rem;
            transition: 0.2s; display: flex; justify-content: center; gap: 0.5rem;
        }
        .btn-main:hover { background: #4338ca; transform: translateY(-1px); }

        @keyframes fadeUp { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        
        /* Mobile */
        @media (max-width: 768px) {
            .product-container { grid-template-columns: 1fr; gap: 2rem; margin: 1rem auto; }
            .form-col { padding: 1.5rem; position: static; }
        }
    </style>
</head>
<body>

    <div class="product-container">
        <div class="media-col">
            <div class="media-frame" id="main-display">
                ${product.video_url 
                  ? `<video src="${product.video_url}" controls poster="${images[0]}"></video>` 
                  : `<img src="${images[0]}" alt="Product Image">`
                }
            </div>
            
            <div class="thumbs-row">
                ${product.video_url ? `<img src="https://img.icons8.com/ios-filled/50/000000/video.png" class="thumb-img" onclick="playVideo('${product.video_url}')" style="padding:15px; background:#eee">` : ''}
                ${thumbsHtml}
            </div>

            <div class="desc-box">
                <h3 style="margin-top:0">Product Details</h3>
                <p>${desc.replace(/\n/g, '<br>')}</p>
            </div>
        </div>

        <div class="form-col">
            <h1>${title}</h1>
            
            <div class="price-wrapper">
                <span class="current-price" id="display-price">${price}</span> <span style="font-weight:bold; color:var(--primary)">PKR</span>
                ${oldPrice > 0 ? `<span class="old-price">${oldPrice} PKR</span>` : ''}
            </div>

            <form id="order-form" onsubmit="handleSubmit(event)">
                ${formHtml}
                
                <button type="submit" class="btn-main">
                    Order Now - <span id="btn-price">${price}</span> PKR
                </button>
            </form>
        </div>
    </div>

    <script>
        const BASE_PRICE = ${price};

        // 1. Media Switcher
        function changeMedia(src, el) {
            document.getElementById('main-display').innerHTML = '<img src="'+src+'">';
            document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
            if(el) el.classList.add('active');
        }
        
        function playVideo(url) {
            document.getElementById('main-display').innerHTML = '<video src="'+url+'" controls autoplay></video>';
        }

        // 2. Calculator Logic
        function updatePrice() {
            let total = BASE_PRICE;
            
            // Selects
            document.querySelectorAll('select.calc-ref').forEach(sel => {
                const opt = sel.options[sel.selectedIndex];
                total += parseFloat(opt.dataset.price) || 0;
                
                // Conditionals
                const target = sel.dataset.condTarget;
                if(target) {
                    const wrap = document.getElementById(target);
                    wrap.innerHTML = '';
                    const fQty = parseInt(opt.dataset.fileQty)||0;
                    const tLbl = opt.dataset.textLabel;
                    
                    if(fQty > 0 || tLbl) {
                        let h = '';
                        if(fQty) for(let i=1; i<=fQty; i++) h+= '<div style="margin-bottom:10px"><small>Upload File '+i+' *</small><input type="file" required class="form-control"></div>';
                        if(tLbl) h+= '<div><small>'+tLbl+' *</small><input type="text" required class="form-control"></div>';
                        wrap.innerHTML = h;
                        wrap.classList.add('show');
                    } else { wrap.classList.remove('show'); }
                }
            });

            // Radios/Checks
            document.querySelectorAll('input.calc-ref').forEach(inp => {
                const condId = inp.dataset.condId;
                const wrap = document.getElementById(condId);

                if(inp.checked) {
                    total += parseFloat(inp.dataset.price) || 0;
                    if(wrap) {
                        wrap.classList.add('show');
                        wrap.querySelectorAll('input').forEach(i=>i.disabled=false);
                    }
                } else {
                    if(wrap && inp.type !== 'radio') {
                        wrap.classList.remove('show');
                        wrap.querySelectorAll('input').forEach(i=>i.disabled=true);
                    }
                    if(inp.type === 'radio' && !inp.checked && wrap) {
                        wrap.classList.remove('show');
                        wrap.querySelectorAll('input').forEach(i=>i.disabled=true);
                    }
                }
            });

            document.getElementById('display-price').innerText = total;
            document.getElementById('btn-price').innerText = total;
        }

        document.addEventListener('change', (e) => {
            if(e.target.classList.contains('calc-ref')) updatePrice();
        });

        // 3. Submit
        function handleSubmit(e) {
            e.preventDefault();
            const btn = document.querySelector('.btn-main');
            btn.innerHTML = 'Processing...';
            setTimeout(() => { 
                alert('Order Placed! Total: ' + document.getElementById('btn-price').innerText); 
                window.location.reload();
            }, 1000);
        }
    </script>
</body>
</html>`;
}

// --- HELPER: FORM BUILDER ---
function generateDynamicForm(fields) {
    if(!fields || fields.length === 0) return '';

    return fields.map((f, i) => {
        const type = f._type;
        const label = f.label;
        const req = f.required ? 'required' : '';
        const star = f.required ? '<span style="color:red">*</span>' : '';

        if(type === 'header') return `<h3 style="border-bottom:1px solid #eee; padding-bottom:5px; margin-top:1.5rem;">${label}</h3>`;

        if(['text','email','number','date'].includes(type)) {
            return `<div class="field-group"><label class="field-label">${label} ${star}</label><input type="${type}" class="form-control" ${req}></div>`;
        }

        if(type === 'file') {
            return `<div class="field-group"><label class="field-label">${label} ${star}</label><input type="file" class="form-control" ${req}></div>`;
        }
        
        if(type === 'textarea') {
            return `<div class="field-group"><label class="field-label">${label} ${star}</label><textarea class="form-control" rows="3" ${req}></textarea></div>`;
        }

        if(type === 'select') {
            const target = `cond_sel_${i}`;
            const opts = f.options_list.map(o => `<option value="${o.label}" data-price="${o.price||0}" data-file-qty="${o.file_qty||0}" data-text-label="${o.text_label||''}">${o.label} ${o.price>0?`(+${o.price})`:''}</option>`).join('');
            return `<div class="field-group"><label class="field-label">${label} ${star}</label><select class="form-control calc-ref" data-cond-target="${target}" ${req}><option value="" data-price="0">Select Option</option>${opts}</select><div id="${target}" class="cond-box"></div></div>`;
        }

        if(type === 'radio' || type === 'checkbox_group') {
            const isRadio = type === 'radio';
            const opts = f.options_list.map((o, idx) => {
                const cId = `c_${i}_${idx}`;
                const hasCond = (o.file_qty>0 || o.text_label);
                let cHtml = '';
                if(hasCond) {
                    cHtml = `<div id="${cId}" class="cond-box">`;
                    if(o.file_qty) for(let k=1;k<=o.file_qty;k++) cHtml += `<div style="margin-bottom:5px"><small>File ${k} *</small><input type="file" class="form-control" disabled required></div>`;
                    if(o.text_label) cHtml += `<div><small>${o.text_label} *</small><input type="text" class="form-control" disabled required></div>`;
                    cHtml += `</div>`;
                }
                return `<div><label class="opt-item"><div style="display:flex;align-items:center;gap:10px"><input type="${isRadio?'radio':'checkbox'}" name="${label}${isRadio?'':'[]'}" class="calc-ref" data-price="${o.price||0}" data-cond-id="${hasCond?cId:''}" ${isRadio&&f.required?'required':''}><span>${o.label}</span></div>${o.price>0?`<span style="font-weight:bold;color:var(--primary)">+${o.price}</span>`:''}</label>${cHtml}</div>`;
            }).join('');
            return `<div class="field-group"><label class="field-label">${label} ${star}</label><div class="opts-list">${opts}</div></div>`;
        }
        return '';
    }).join('');
}
