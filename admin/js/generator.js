/**
 * admin/js/generator.js
 * FIXED: 
 * - First Image acts as Video Thumbnail (No separate video icon).
 * - Clicking 1st Image -> Plays Video (if video exists).
 * - Video Player Poster is always the 1st Image.
 * - Accessibility & Layout intact.
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
    
    // SEO & Meta
    const seoDesc = (product.seoDescription || desc || title).substring(0, 160).replace(/"/g, "'");

    // Delivery Logic
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

    // 2. Thumbnails Logic (UPDATED)
    // Pehli image agar video hai to video play karegi, warna normal image switch
    const thumbsHtml = images.map((img, idx) => {
        let clickAction = `switchMedia('image','${img}')`;
        let ariaLabel = `View Image ${idx + 1}`;
        let playIconOverlay = '';

        // Agar yeh pehli image hai AUR product me video hai -> Video Play karega
        if (idx === 0 && product.video_url) {
            clickAction = `switchMedia('video','${product.video_url}')`;
            ariaLabel = `Play Video`;
            // Chota sa play icon overlay taake user ko pata chale ye video hai
            playIconOverlay = `<span class="play-icon-overlay">▶</span>`;
        }

        return `
        <button type="button" class="thumb-btn" onclick="${clickAction}" aria-label="${ariaLabel}">
            <img src="${img}" alt="Thumbnail ${idx + 1}" width="80" height="60" loading="lazy">
            ${playIconOverlay}
        </button>
        `;
    }).join('');

    // 3. Form Logic
    const formHtml = generateDynamicForm(product.customForm || []);

    // 4. Final HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${seoDesc}">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../product.css">
<style>
/* --- CORE STYLES --- */
:root { --primary: #4f46e5; --dark: #111; }
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; line-height: 1.5; margin:0; }

/* Layout: Desktop Sticky Player */
.product-container { 
    display: grid; 
    grid-template-columns: 1.2fr 1fr; 
    gap: 3rem; 
    margin: 3rem auto; 
    max-width: 1200px; 
    padding: 0 20px; 
    align-items: start;
}

.media-col { 
    position: sticky; 
    top: 20px; 
    display: flex; 
    flex-direction: column; 
    gap: 15px; 
}

/* Horizontal Player (16:9) */
.media-frame { 
    width: 100%; 
    aspect-ratio: 16/9; 
    background: #000; 
    border-radius: 12px; 
    overflow: hidden; 
    border: 1px solid #e5e7eb; 
    display: flex; 
    align-items: center; 
    justify-content: center;
}
.media-frame img, .media-frame video { 
    width: 100%; height: 100%; object-fit: contain; 
}

/* Thumbnails */
.thumbs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; }
.thumb-btn { 
    position: relative; /* For play icon overlay */
    background: none; border: 2px solid transparent; padding: 0; 
    cursor: pointer; border-radius: 8px; overflow: hidden; transition: 0.2s; flex-shrink: 0;
}
.thumb-btn:hover, .thumb-btn:focus { border-color: var(--primary); }
.thumb-btn img { display: block; width: 80px; height: 60px; object-fit: cover; }

/* Play Icon Overlay on Thumbnail */
.play-icon-overlay {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.6); color: white; border-radius: 50%;
    width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
    font-size: 12px; pointer-events: none;
}

/* Right Column */
.form-col { display: flex; flex-direction: column; gap: 1.5rem; }

/* Cards */
.cards-row { display: flex; gap: 15px; }
.delivery-card { flex: 1; padding: 15px; border-radius: 10px; color: white; display: flex; flex-direction: column; justify-content: center; }
.bg-green { background: #059669; }
.bg-purple { background: #7c3aed; }
.delivery-card h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.delivery-card span { font-size: 0.95rem; font-weight: 600; margin-top: 4px; }

.price-card2 { flex: 1; background: var(--primary); color: white; padding: 15px; border-radius: 10px; text-align: center; }
.price-card2 .price { font-size: 1.8rem; font-weight: 800; display: block; }
.price-card2 .old-price { font-size: 1rem; opacity: 0.8; text-decoration: line-through; }
.price-card2 .discount { background: white; color: var(--primary); font-size: 0.75rem; font-weight: bold; padding: 2px 8px; border-radius: 12px; }

/* Forms */
.form-section { background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; }
.form-group { margin-bottom: 15px; }
.form-label { display: block; font-weight: 600; font-size: 0.95rem; margin-bottom: 6px; color: #374151; }
.form-control { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
.form-control:focus { border-color: var(--primary); outline: 2px solid #c7d2fe; }

.checkout-btn { width: 100%; background: #047857; color: white; padding: 16px; font-size: 1.1rem; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; transition: 0.2s; }
.checkout-btn:hover { background: #064e3b; }

.rating-text { color: #b45309; font-weight: bold; font-size: 0.9rem; margin-top: 5px; }
.desc-box { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; }

/* Mobile Logic */
@media (max-width: 768px) {
    .product-container { display: flex; flex-direction: column; gap: 1.5rem; margin: 1.5rem auto; }
    .media-col { display: contents; } 
    .media-frame { order: 1; width: 100%; aspect-ratio: 16/9; }
    .thumbs { order: 2; }
    .form-col { order: 3; }
    .desc-box { order: 4; }
}
</style>
</head>
<body>

<main class="product-container">
  <div class="media-col">
    <div class="media-frame" id="main-media" role="region" aria-label="Media Player">
       ${product.video_url 
         ? `<video controls src="${product.video_url}" poster="${images[0]}" width="600" height="337"><track kind="captions" src="" label="English" /></video>` 
         : `<img src="${images[0]}" alt="${title} - Main View" width="600" height="337">`
       }
    </div>
    
    <div class="thumbs" role="group" aria-label="Gallery">
      ${thumbsHtml}
    </div>
    
    <section class="desc-box">
      <h2 style="margin-top:0; font-size:1.3rem; border-bottom:1px solid #eee; padding-bottom:10px;">Description</h2>
      <p style="color:#4b5563; line-height:1.7; margin-top:15px;">${desc.replace(/\n/g, '<br>')}</p>
    </section>
  </div>

  <div class="form-col">
    <div>
        <h1 style="font-size:1.8rem; margin:0; line-height:1.2;">${title}</h1>
        <div class="rating-text">★ 5.0 (New Arrival)</div>
    </div>

    <div class="cards-row">
        <div class="delivery-card ${deliveryClass}">
            <h3>Estimated Delivery</h3>
            <span>${deliveryText}</span>
        </div>
        <div class="price-card2">
            <span class="price" id="display-price">$${price}</span>
            ${oldPrice > 0 ? `<span class="old-price">$${oldPrice}</span>` : ''}
            <span class="discount">Special Offer</span>
        </div>
    </div>

    <div style="background:#ecfdf5; padding:12px; border-radius:8px; font-size:0.9rem; color:#065f46; border:1px solid #a7f3d0;">
       <strong>Note:</strong> ${deliveryText} upon order confirmation.
    </div>

    <div class="form-section">
      <h2 style="color:#4f46e5; margin:0 0 15px 0; font-size:1.3rem;">Customize Your Order</h2>
      
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

// Media Switcher: Video poster hamesha 1st image hogi
function switchMedia(type, url){
  const main = document.getElementById('main-media');
  if(type === 'video'){
    main.innerHTML = '<video controls autoplay src="'+url+'" poster="${images[0]}" style="width:100%;height:100%;object-fit:contain;"></video>';
  } else {
    main.innerHTML = '<img src="'+url+'" alt="Main View" style="width:100%;height:100%;object-fit:contain;">';
  }
}

function updatePrice(){
  let total = BASE_PRICE;
  
  // Select Inputs
  document.querySelectorAll('select.price-ref').forEach(sel => {
    const opt = sel.options[sel.selectedIndex];
    total += parseFloat(opt.dataset.price) || 0;
    
    const target = sel.dataset.condTarget;
    if(target){
        const wrap = document.getElementById(target);
        const fQty = parseInt(opt.dataset.fileQty)||0;
        const tLbl = opt.dataset.textLabel;
        
        if(fQty > 0 || tLbl){
            let h = '';
            if(fQty) for(let i=1;i<=fQty;i++) h+= '<div style="margin-top:8px"><label class="form-label" for="file_'+i+'">Upload File '+i+' <span style="color:red">*</span></label><input type="file" id="file_'+i+'" required class="form-control"></div>';
            if(tLbl) h+= '<div style="margin-top:8px"><label class="form-label" for="text_lbl">'+tLbl+' <span style="color:red">*</span></label><input type="text" id="text_lbl" required class="form-control"></div>';
            wrap.innerHTML = h;
            wrap.classList.add('show');
        } else {
            wrap.classList.remove('show');
            wrap.innerHTML = '';
        }
    }
  });

  // Radio/Checkbox Inputs
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

  const finalPrice = '$' + total.toFixed(2);
  document.getElementById('display-price').innerText = finalPrice;
  document.getElementById('btn-price').innerText = finalPrice;
}

document.addEventListener('change', (e) => {
    if(e.target.classList.contains('price-ref')) updatePrice();
});

function submitOrder(e){
    e.preventDefault();
    const btn = document.querySelector('.checkout-btn');
    btn.innerText = 'Processing...';
    btn.disabled = true;
    setTimeout(() => {
        alert('Order Placed Successfully! Total: ' + document.getElementById('btn-price').innerText);
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
        const fieldId = `f_${i}`;

        if(type === 'header') return `<h3 style="margin:20px 0 10px 0; border-bottom:1px solid #ddd; padding-bottom:5px; font-size:1.1rem; color:#111;">${label}</h3>`;

        if(['text','email','number','date'].includes(type)) {
            return `<div class="form-group"><label class="form-label" for="${fieldId}">${label} ${star}</label><input type="${type}" id="${fieldId}" class="form-control" ${req}></div>`;
        }

        if(type === 'textarea') {
            return `<div class="form-group"><label class="form-label" for="${fieldId}">${label} ${star}</label><textarea id="${fieldId}" class="form-control" rows="${f.rows||3}" ${req}></textarea></div>`;
        }

        if(type === 'file') {
            return `<div class="form-group"><label class="form-label" for="${fieldId}">${label} ${star}</label><input type="file" id="${fieldId}" class="form-control" ${req}></div>`;
        }

        if(type === 'select') {
            const condTarget = `cond_sel_${i}`;
            const opts = f.options_list.map(o => `<option value="${o.label}" data-price="${o.price||0}" data-file-qty="${o.file_qty||0}" data-text-label="${o.text_label||''}">${o.label} ${o.price>0 ? '(+$'+o.price+')' : ''}</option>`).join('');
            return `<div class="form-group"><label class="form-label" for="${fieldId}">${label} ${star}</label><select id="${fieldId}" class="form-control price-ref" data-cond-target="${condTarget}" ${req}><option value="" data-price="0">Select Option</option>${opts}</select><div id="${condTarget}" class="conditional-wrap"></div></div>`;
        }

        if(type === 'radio' || type === 'checkbox_group') {
            const isRadio = type === 'radio';
            const opts = f.options_list.map((o, idx) => {
                const condId = `cond_opt_${i}_${idx}`;
                const optId = `opt_${i}_${idx}`;
                const hasCond = (o.file_qty > 0 || o.text_label);
                
                let condHtml = '';
                if(hasCond) {
                    condHtml = `<div id="${condId}" class="conditional-wrap">`;
                    if(o.file_qty) for(let k=1; k<=o.file_qty; k++) condHtml += `<div style="margin-bottom:8px"><label class="form-label" for="file_${i}_${k}">Upload File ${k} *</label><input type="file" id="file_${i}_${k}" class="form-control" disabled required></div>`;
                    if(o.text_label) condHtml += `<div><label class="form-label" for="text_${i}_${idx}">${o.text_label} *</label><input type="text" id="text_${i}_${idx}" class="form-control" disabled required></div>`;
                    condHtml += `</div>`;
                }

                return `<div style="margin-bottom:8px"><label class="opt-row" for="${optId}" style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:white; border:1px solid #e5e7eb; border-radius:8px; cursor:pointer;"><span style="display:flex; align-items:center; gap:10px; color:#374151;"><input type="${isRadio?'radio':'checkbox'}" id="${optId}" name="${label}${isRadio?'':'[]'}" class="price-ref" data-price="${o.price||0}" data-cond-id="${hasCond?condId:''}" ${isRadio&&f.required?'required':''}>${o.label}</span><span style="font-weight:bold; color:#4f46e5;">${o.price>0 ? '+$'+o.price : ''}</span></label>${condHtml}</div>`;
            }).join('');
            
            return `<div class="form-group"><label class="form-label" style="margin-bottom:10px;">${label} ${star}</label>${opts}</div>`;
        }
        return '';
    }).join('');
}
