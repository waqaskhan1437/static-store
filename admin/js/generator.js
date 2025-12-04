/**
 * admin/js/generator.js
 * FIXED: PageSpeed Insights Issues (Accessibility, SEO, Best Practices)
 * - Added Meta Description
 * - Added Alt Attributes
 * - Fixed Heading Hierarchy
 * - Added Form Labels
 * - Fixed Color Contrast
 * - Added <main> Landmark
 * - Fixed Broken Video Poster (404 Error)
 * - Currency: USD ($)
 * - Language: Strict English
 */

export function generateProductHTML(product) {
    if (!product) return '';

    // 1. Data Setup
    const images = (product.images && product.images.length > 0) 
        ? product.images 
        : ['https://placehold.co/600x600?text=No+Image'];
    
    const title = product.title || 'Untitled Product';
    const price = parseFloat(product.price) || 0;
    const oldPrice = parseFloat(product.old_price) || 0;
    const desc = product.description || '';
    
    // SEO: Meta Description (Truncate if too long)
    const seoDesc = (product.seoDescription || desc || title).substring(0, 160).replace(/"/g, "'");

    // Delivery Logic (English & USD)
    let deliveryText = "Standard Delivery";
    let deliveryClass = "bg-green";

    if (product.is_instant) {
        deliveryText = "Instant Delivery (Within 60 Mins)";
        deliveryClass = "bg-purple";
    } else {
        const dTime = (product.delivery_time || '').toString().trim();
        if (dTime === '1' || dTime.toLowerCase() === '1 day') {
            deliveryText = "24 Hours Express Delivery";
        } else if (dTime === '2' || dTime.toLowerCase() === '2 days') {
            deliveryText = "2 Days Delivery";
        } else if (dTime) {
            deliveryText = `${dTime} Delivery`;
        }
    }

    // 2. Thumbnails (Added ALT tags for Accessibility)
    const thumbsHtml = images.map((img, idx) => `
        <img src="${img}" 
             alt="${title} - Thumbnail ${idx + 1}"
             width="80" height="60"
             onclick="switchMedia('image','${img}')">
    `).join('');

    // 3. Form Logic (Dynamic Labels for Accessibility)
    const formHtml = generateDynamicForm(product.customForm || []);

    // 4. Final HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${seoDesc}"> <link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../product.css">
<style>
/* Layout CSS */
body { font-family: 'Segoe UI', sans-serif; color: #333; }
.product-container { display:grid; grid-template-columns: 1fr 1fr; gap:2rem; margin:2rem auto; max-width:1200px; padding:0 15px; }
.media-col { flex:1 1 55%; min-width:280px; }
.form-col { display:flex; flex-direction:column; gap:1rem; box-sizing:border-box; }
.media-frame { position:relative; width:100%; aspect-ratio:16/9; background:#000; border-radius:12px; overflow:hidden; }
.media-frame img, .media-frame video { position:absolute; width:100%; height:100%; object-fit:contain; }
.thumbs { display:flex; gap:8px; margin-top:0.75rem; flex-wrap:wrap; }
.thumbs img { width:80px; height:60px; border-radius:6px; cursor:pointer; object-fit:cover; border:2px solid transparent; }
.thumbs img:hover { border-color: #6366f1; }

/* Delivery Card Dynamic Colors */
.delivery-card { flex:1; color:white; padding:1rem; border-radius:12px; display:flex; flex-direction:column; justify-content:center; }
.bg-green { background:#10b981; }
.bg-purple { background:#8e44ad; }

/* Fix: Headings Order - Changed h4 to h3/div to maintain hierarchy */
.delivery-card h3 { margin:0; font-size:1rem; font-weight:700; }
.delivery-card span { font-size:0.95rem; opacity:1; margin-top:5px; font-weight:600; }

.cards-row { display:flex; gap:1rem; margin-top:0.5rem; }
.price-card2 { flex:1; background:#8b5cf6; color:white; padding:1rem; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.25rem; }
.price-card2 .price { font-size:1.8rem; font-weight:bold; }
.price-card2 .old-price { text-decoration:line-through; opacity:0.7; font-size:1rem; }
/* Fix: Contrast - Darker purple for white text is fine, checked discount color */
.price-card2 .discount { background:white; color:#6d28d9; padding:2px 8px; border-radius:9999px; font-size:0.75rem; font-weight:700; }

.form-section { border:1px solid #e5e7eb; border-radius:12px; padding:1rem; background:#f9fafb; display:flex; flex-direction:column; gap:1rem; }
.form-section label { font-weight:600; font-size:0.9rem; display:block; margin-bottom:0.25rem; color:#374151; }
.form-control { width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:1rem; box-sizing:border-box; color:#1f2937; }

/* Custom Form Styles */
.opt-row { display:flex; justify-content:space-between; align-items:center; padding:10px; background:white; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:5px; cursor:pointer; }
.opt-row:hover { border-color:#8b5cf6; }
.conditional-wrap { background:#eff6ff; padding:10px; border-radius:8px; border-left:3px solid #8b5cf6; margin-top:5px; display:none; }
.conditional-wrap.show { display:block; animation:fadeIn 0.3s; }
@keyframes fadeIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }

.checkout-btn { width:100%; background:#047857; color:white; border:none; padding:1rem; border-radius:12px; font-size:1.1rem; font-weight:700; cursor:pointer; margin-top:10px; display:flex; justify-content:space-between; align-items:center; }
.checkout-btn:hover { background:#065f46; }

/* Fix: Contrast for Star Rating - Darker Gold */
.rating-text { color:#b45309; font-weight: bold; font-size:0.9rem; }

@media(max-width:768px){ .product-container{grid-template-columns:1fr;} }
</style>
</head>
<body>

<main class="product-container">
  <div class="media-col">
    <div class="media-frame" id="main-media">
       ${product.video_url 
         /* Fix: Removed broken hardcoded poster URL. Uses product image instead. */
         ? `<video controls src="${product.video_url}" poster="${images[0]}"><track kind="captions" src="" label="English" /></video>` 
         : `<img src="${images[0]}" alt="${title} - Main Image" width="600" height="600">`
       }
    </div>
    <div class="thumbs">
      ${product.video_url ? `<img src="https://img.icons8.com/ios-filled/50/000000/video.png" alt="Play Video" onclick="switchMedia('video','${product.video_url}')" style="padding:15px;background:#eee">` : ''}
      ${thumbsHtml}
    </div>
    
    <div style="margin-top:20px; padding:15px; background:white; border:1px solid #e5e7eb; border-radius:12px;">
      <h2 style="margin-top:0; font-size:1.2rem">Description</h2>
      <p style="color:#4b5563; line-height:1.6">${desc.replace(/\n/g, '<br>')}</p>
    </div>
  </div>

  <div class="form-col">
    <h1 style="font-size:1.8rem; margin:0">${title}</h1>
    <div class="rating-text">★ 5.0 (New Arrival)</div>

    <div class="cards-row">
        <div class="delivery-card ${deliveryClass}">
            <h3>Estimated Delivery</h3> <span>${deliveryText}</span>
        </div>

        <div class="price-card2">
            <span class="price" id="display-price">$${price}</span>
            ${oldPrice > 0 ? `<span class="old-price">$${oldPrice}</span>` : ''}
            <span class="discount">Special Offer</span>
        </div>
    </div>

    <div style="background:#d1fae5; padding:0.75rem; border-radius:8px; font-size:0.9rem; color:#065f46; margin-top:10px;">
       Note: <b>${deliveryText}</b> upon order confirmation.
    </div>

    <div class="form-section">
      <h2 style="color:#6366f1; margin:0; font-size:1.2rem;">Customize Your Order</h2>
      
      <form id="orderForm" onsubmit="submitOrder(event)">
        ${formHtml}

        <button type="submit" class="checkout-btn">
            <span>Checkout</span>
            <span id="btn-price">$${price}</span>
        </button>
      </form>
    </div>
  </div>
</main>

<script>
let BASE_PRICE = ${price};

function switchMedia(type, url){
  const main = document.getElementById('main-media');
  if(type === 'video'){
    // Fix: Dynamic poster to avoid 404
    main.innerHTML = '<video controls autoplay src="'+url+'" poster="${images[0]}" style="position:absolute;width:100%;height:100%;object-fit:contain;"></video>';
  } else {
    main.innerHTML = '<img src="'+url+'" alt="Main Image" style="position:absolute;width:100%;height:100%;object-fit:contain;" />';
  }
}

function updatePrice(){
  let total = BASE_PRICE;
  
  // 1. Selects
  document.querySelectorAll('select.price-ref').forEach(sel => {
    const opt = sel.options[sel.selectedIndex];
    total += parseFloat(opt.dataset.price) || 0;
    
    // Conditionals logic
    const target = sel.dataset.condTarget;
    if(target){
        const wrap = document.getElementById(target);
        const fQty = parseInt(opt.dataset.fileQty)||0;
        const tLbl = opt.dataset.textLabel;
        
        if(fQty > 0 || tLbl){
            let h = '';
            // Fix: Added Labels for Accessibility
            if(fQty) for(let i=1;i<=fQty;i++) h+= '<div style="margin-top:5px"><label for="file_'+i+'">Upload File '+i+' <span style="color:red">*</span></label><input type="file" id="file_'+i+'" required class="form-control"></div>';
            if(tLbl) h+= '<div style="margin-top:5px"><label for="text_lbl">'+tLbl+' <span style="color:red">*</span></label><input type="text" id="text_lbl" required class="form-control"></div>';
            wrap.innerHTML = h;
            wrap.classList.add('show');
        } else {
            wrap.classList.remove('show');
            wrap.innerHTML = '';
        }
    }
  });

  // 2. Radios / Checkboxes
  document.querySelectorAll('input.price-ref').forEach(inp => {
    const condId = inp.dataset.condId;
    const wrap = document.getElementById(condId);

    if(inp.checked){
        total += parseFloat(inp.dataset.price) || 0;
        if(wrap) {
            wrap.classList.add('show');
            wrap.querySelectorAll('input').forEach(i => i.disabled = false);
        }
    } else {
        if(wrap && inp.type !== 'radio') {
             wrap.classList.remove('show');
             wrap.querySelectorAll('input').forEach(i => i.disabled = true);
        }
        if(inp.type === 'radio' && !inp.checked && wrap){
             wrap.classList.remove('show');
             wrap.querySelectorAll('input').forEach(i => i.disabled = true);
        }
    }
  });

  document.getElementById('display-price').innerText = '$' + total.toFixed(2);
  document.getElementById('btn-price').innerText = '$' + total.toFixed(2);
}

document.addEventListener('change', (e) => {
    if(e.target.classList.contains('price-ref')) updatePrice();
});

function submitOrder(e){
    e.preventDefault();
    const btn = document.querySelector('.checkout-btn');
    btn.innerHTML = 'Processing...';
    setTimeout(() => {
        alert('Order Placed Successfully! Amount: ' + document.getElementById('btn-price').innerText);
        window.location.reload();
    }, 1500);
}
</script>
</body>
</html>`;
}

// --- HELPER FUNCTION: Fixed Accessibility Issues ---

function generateDynamicForm(fields) {
    if (!fields || fields.length === 0) return '<p>No options available.</p>';

    return fields.map((f, i) => {
        const type = f._type;
        const label = f.label;
        const req = f.required ? 'required' : '';
        const star = f.required ? '<span style="color:red">*</span>' : '';
        const fieldId = `field_${i}`; // Fix: Unique ID for Labels

        // Fix: Heading Hierarchy (h3 inside section)
        if(type === 'header') return `<h3 style="margin:1.5rem 0 0.5rem 0; border-bottom:1px solid #ddd; padding-bottom:5px; font-size:1.1rem">${label}</h3>`;

        // Text / Email / Number
        if(['text','email','number','date'].includes(type)) {
            return `<div style="margin-top:1rem"><label for="${fieldId}">${label} ${star}</label><input type="${type}" id="${fieldId}" class="form-control" ${req}></div>`;
        }

        // Textarea
        if(type === 'textarea') {
            return `<div style="margin-top:1rem"><label for="${fieldId}">${label} ${star}</label><textarea id="${fieldId}" class="form-control" rows="${f.rows||3}" ${req}></textarea></div>`;
        }

        // File
        if(type === 'file') {
            return `<div style="margin-top:1rem"><label for="${fieldId}">${label} ${star}</label><input type="file" id="${fieldId}" class="form-control" ${req}></div>`;
        }

        // Select
        if(type === 'select') {
            const condTarget = `cond_sel_${i}`;
            const opts = f.options_list.map(o => `<option value="${o.label}" data-price="${o.price||0}" data-file-qty="${o.file_qty||0}" data-text-label="${o.text_label||''}">${o.label} ${o.price>0 ? '(+$'+o.price+')' : ''}</option>`).join('');
            // Fix: Associated Label for Select
            return `
            <div style="margin-top:1rem">
                <label for="${fieldId}">${label} ${star}</label>
                <select id="${fieldId}" class="form-control price-ref" data-cond-target="${condTarget}" ${req}>
                    <option value="" data-price="0">Select Option</option>
                    ${opts}
                </select>
                <div id="${condTarget}" class="conditional-wrap"></div>
            </div>`;
        }

        // Radio / Checkbox
        if(type === 'radio' || type === 'checkbox_group') {
            const isRadio = type === 'radio';
            const opts = f.options_list.map((o, idx) => {
                const condId = `cond_opt_${i}_${idx}`;
                const optionId = `opt_${i}_${idx}`; // Unique ID per option
                const hasCond = (o.file_qty > 0 || o.text_label);
                
                let condHtml = '';
                if(hasCond) {
                    condHtml = `<div id="${condId}" class="conditional-wrap">`;
                    // Fix: Labels for conditional inputs
                    if(o.file_qty) for(let k=1; k<=o.file_qty; k++) condHtml += `<div style="margin-bottom:5px"><label for="file_${i}_${k}">Upload File ${k} *</label><input type="file" id="file_${i}_${k}" class="form-control" disabled required></div>`;
                    if(o.text_label) condHtml += `<div><label for="text_${i}_${idx}">${o.text_label} *</label><input type="text" id="text_${i}_${idx}" class="form-control" disabled required></div>`;
                    condHtml += `</div>`;
                }

                return `
                <div style="margin-bottom:8px">
                    <label class="opt-row" for="${optionId}"> <span style="display:flex;align-items:center;gap:10px">
                            <input type="${isRadio?'radio':'checkbox'}" id="${optionId}" name="${label}${isRadio?'':'[]'}" class="price-ref" data-price="${o.price||0}" data-cond-id="${hasCond?condId:''}" ${isRadio&&f.required?'required':''}>
                            ${o.label}
                        </span>
                        <span style="font-weight:bold;color:#6d28d9">${o.price>0 ? '+$'+o.price : ''}</span>
                    </label>
                    ${condHtml}
                </div>`;
            }).join('');
            
            return `<div style="margin-top:1rem"><label style="margin-bottom:10px; display:block;">${label} ${star}</label>${opts}</div>`;
        }
        return '';
    }).join('');
}
