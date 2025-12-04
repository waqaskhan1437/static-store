/**
 * admin/js/generator.js
 * Logic Updated for Instant vs Standard Delivery
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
    
    // --- DELIVERY LOGIC START ---
    let deliveryText = "Standard Delivery"; // Default
    let deliveryClass = "bg-green"; // Green color default

    if (product.is_instant) {
        // Agar Instant checkbox on hai
        deliveryText = "Instant Delivery In 60 Minutes";
        deliveryClass = "bg-purple"; // Purple color for Instant
    } else {
        // Agar checkbox off hai, to text check karo
        const dTime = (product.delivery_time || '').toString().trim();
        
        if (dTime === '1' || dTime.toLowerCase() === '1 day') {
            deliveryText = "24 Hours Express Delivery";
        } else if (dTime === '2' || dTime.toLowerCase() === '2 days') {
            deliveryText = "2 Days Delivery";
        } else if (dTime) {
            deliveryText = dTime + " Delivery"; // Fallback (e.g. "5 Days Delivery")
        }
    }
    // --- DELIVERY LOGIC END ---

    // 2. Thumbnails
    const thumbsHtml = images.map((img, idx) => `
        <img src="${img}" onclick="switchMedia('image','${img}')">
    `).join('');

    // 3. Form Logic
    const formHtml = generateDynamicForm(product.customForm || []);

    // 4. Final HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../product.css">
<style>
/* ... (Purana Layout Style Same Rahega) ... */
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

.delivery-card h4 { margin:0; font-size:1rem; font-weight:700; }
.delivery-card span { font-size:0.95rem; opacity:1; margin-top:5px; font-weight:600; }

.cards-row { display:flex; gap:1rem; margin-top:0.5rem; }
.price-card2 { flex:1; background:#8b5cf6; color:white; padding:1rem; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.25rem; }
.price-card2 .price { font-size:1.8rem; font-weight:bold; }
.price-card2 .old-price { text-decoration:line-through; opacity:0.7; font-size:1rem; }
.price-card2 .discount { background:white; color:#8b5cf6; padding:2px 6px; border-radius:9999px; font-size:0.75rem; font-weight:700; }

.form-section { border:1px solid #e5e7eb; border-radius:12px; padding:1rem; background:#f9fafb; display:flex; flex-direction:column; gap:1rem; }
.form-section label { font-weight:600; font-size:0.9rem; display:block; margin-bottom:0.25rem; }
.form-control { width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem; box-sizing:border-box; }

/* Custom Form Styles */
.opt-row { display:flex; justify-content:space-between; align-items:center; padding:10px; background:white; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:5px; cursor:pointer; }
.opt-row:hover { border-color:#8b5cf6; }
.conditional-wrap { background:#eff6ff; padding:10px; border-radius:8px; border-left:3px solid #8b5cf6; margin-top:5px; display:none; }
.conditional-wrap.show { display:block; animation:fadeIn 0.3s; }
@keyframes fadeIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }

.checkout-btn { width:100%; background:#047857; color:white; border:none; padding:1rem; border-radius:12px; font-size:1.1rem; font-weight:700; cursor:pointer; margin-top:10px; display:flex; justify-content:space-between; align-items:center; }
.checkout-btn:hover { background:#065f46; }

@media(max-width:768px){ .product-container{grid-template-columns:1fr;} }
</style>
</head>
<body>

<div class="product-container">
  <div class="media-col">
    <div class="media-frame" id="main-media">
       ${product.video_url 
         ? `<video controls src="${product.video_url}" poster="${images[0]}"></video>` 
         : `<img src="${images[0]}" alt="${title}">`
       }
    </div>
    <div class="thumbs">
      ${product.video_url ? `<img src="https://img.icons8.com/ios-filled/50/000000/video.png" onclick="switchMedia('video','${product.video_url}')" style="padding:15px;background:#eee">` : ''}
      ${thumbsHtml}
    </div>
    
    <div style="margin-top:20px; padding:15px; background:white; border:1px solid #e5e7eb; border-radius:12px;">
      <h3 style="margin-top:0">Description</h3>
      <p style="color:#666; line-height:1.6">${desc.replace(/\n/g, '<br>')}</p>
    </div>
  </div>

  <div class="form-col">
    <h1 style="font-size:1.8rem; margin:0">${title}</h1>
    <div style="color:#fbbf24; font-weight:bold; font-size:0.9rem">★ 5.0 (New Arrival)</div>

    <div class="cards-row">
        <div class="delivery-card ${deliveryClass}">
            <h4>Estimated Delivery</h4>
            <span>${deliveryText}</span>
        </div>

        <div class="price-card2">
            <span class="price" id="display-price">${price} PKR</span>
            ${oldPrice > 0 ? `<span class="old-price">${oldPrice} PKR</span>` : ''}
            <span class="discount">Special Offer</span>
        </div>
    </div>

    <div style="background:#d1fae5; padding:0.75rem; border-radius:8px; font-size:0.9rem; color:#065f46; margin-top:10px;">
       Note: <b>${deliveryText}</b> upon order confirmation.
    </div>

    <div class="form-section">
      <h3 style="color:#6366f1; margin:0; font-size:1.2rem;">Customize Your Order</h3>
      
      <form id="orderForm" onsubmit="submitOrder(event)">
        ${formHtml}

        <button type="submit" class="checkout-btn">
            <span>Checkout</span>
            <span id="btn-price">${price} PKR</span>
        </button>
      </form>
    </div>
  </div>
</div>

<script>
let BASE_PRICE = ${price};

function switchMedia(type, url){
  const main = document.getElementById('main-media');
  if(type === 'video'){
    main.innerHTML = '<video controls autoplay src="'+url+'" style="position:absolute;width:100%;height:100%;object-fit:contain;"></video>';
  } else {
    main.innerHTML = '<img src="'+url+'" style="position:absolute;width:100%;height:100%;object-fit:contain;" />';
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
            if(fQty) for(let i=1;i<=fQty;i++) h+= '<div style="margin-top:5px"><label>Upload File '+i+' <span style="color:red">*</span></label><input type="file" required class="form-control"></div>';
            if(tLbl) h+= '<div style="margin-top:5px"><label>'+tLbl+' <span style="color:red">*</span></label><input type="text" required class="form-control"></div>';
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

  document.getElementById('display-price').innerText = total + ' PKR';
  document.getElementById('btn-price').innerText = total + ' PKR';
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

// --- HELPER FUNCTION: Same as before ---

function generateDynamicForm(fields) {
    if (!fields || fields.length === 0) return '<p>No options available.</p>';

    return fields.map((f, i) => {
        const type = f._type;
        const label = f.label;
        const req = f.required ? 'required' : '';
        const star = f.required ? '<span style="color:red">*</span>' : '';

        if(type === 'header') return `<h3 style="margin:1.5rem 0 0.5rem 0; border-bottom:1px solid #ddd; padding-bottom:5px;">${label}</h3>`;

        if(['text','email','number','date'].includes(type)) {
            return `<div style="margin-top:1rem"><label>${label} ${star}</label><input type="${type}" class="form-control" ${req}></div>`;
        }

        if(type === 'textarea') {
            return `<div style="margin-top:1rem"><label>${label} ${star}</label><textarea class="form-control" rows="${f.rows||3}" ${req}></textarea></div>`;
        }

        if(type === 'file') {
            return `<div style="margin-top:1rem"><label>${label} ${star}</label><input type="file" class="form-control" ${req}></div>`;
        }

        if(type === 'select') {
            const condTarget = `cond_sel_${i}`;
            const opts = f.options_list.map(o => `<option value="${o.label}" data-price="${o.price||0}" data-file-qty="${o.file_qty||0}" data-text-label="${o.text_label||''}">${o.label} ${o.price>0 ? '(+'+o.price+')' : ''}</option>`).join('');
            return `
            <div style="margin-top:1rem">
                <label>${label} ${star}</label>
                <select class="form-control price-ref" data-cond-target="${condTarget}" ${req}>
                    <option value="" data-price="0">Select Option</option>
                    ${opts}
                </select>
                <div id="${condTarget}" class="conditional-wrap"></div>
            </div>`;
        }

        if(type === 'radio' || type === 'checkbox_group') {
            const isRadio = type === 'radio';
            const opts = f.options_list.map((o, idx) => {
                const condId = `cond_opt_${i}_${idx}`;
                const hasCond = (o.file_qty > 0 || o.text_label);
                
                let condHtml = '';
                if(hasCond) {
                    condHtml = `<div id="${condId}" class="conditional-wrap">`;
                    if(o.file_qty) for(let k=1; k<=o.file_qty; k++) condHtml += `<div style="margin-bottom:5px"><small>Upload File ${k} *</small><input type="file" class="form-control" disabled required></div>`;
                    if(o.text_label) condHtml += `<div><small>${o.text_label} *</small><input type="text" class="form-control" disabled required></div>`;
                    condHtml += `</div>`;
                }

                return `
                <div style="margin-bottom:8px">
                    <label class="opt-row">
                        <span style="display:flex;align-items:center;gap:10px">
                            <input type="${isRadio?'radio':'checkbox'}" name="${label}${isRadio?'':'[]'}" class="price-ref" data-price="${o.price||0}" data-cond-id="${hasCond?condId:''}" ${isRadio&&f.required?'required':''}>
                            ${o.label}
                        </span>
                        <span style="font-weight:bold;color:#8b5cf6">${o.price>0 ? '+'+o.price : ''}</span>
                    </label>
                    ${condHtml}
                </div>`;
            }).join('');
            
            return `<div style="margin-top:1rem"><label style="margin-bottom:10px; display:block;">${label} ${star}</label>${opts}</div>`;
        }
        return '';
    }).join('');
}
