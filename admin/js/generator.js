/**
 * admin/js/generator.js
 * FIXED: 
 * - Mobile Player is Strictly Edge-to-Edge (0 Margin Left/Right)
 * - Fixed "Shifted Left" Issue on Mobile
 * - Slider & Form have proper spacing on Mobile
 * - Desktop Layout Sticky & 16:9 Preserved
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

    // 2. Thumbnails Logic
    const thumbsHtml = images.map((img, idx) => {
        let clickAction = `switchMedia('image','${img}')`;
        let ariaLabel = `View Image ${idx + 1}`;
        let playIconOverlay = '';

        if (idx === 0 && product.video_url) {
            clickAction = `switchMedia('video','${product.video_url}')`;
            ariaLabel = `Play Video`;
            playIconOverlay = `<span class="play-icon-overlay">▶</span>`;
        }

        return `
        <button type="button" class="t-btn" onclick="${clickAction}" aria-label="${ariaLabel}">
            <img src="${img}" alt="Thumbnail ${idx + 1}" loading="lazy">
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
/* --- CORE --- */
:root { --primary: #4f46e5; --dark: #111; }
* { box-sizing: border-box; } /* CRITICAL FIX */
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; line-height: 1.5; margin:0; background:#f9fafb; }

/* --- DESKTOP LAYOUT --- */
.product-container { 
    display: grid; 
    grid-template-columns: 1.2fr 1fr; 
    gap: 40px; 
    margin: 40px auto; 
    max-width: 1200px; 
    padding: 0 20px; 
    align-items: start;
    position: relative;
}

.media-col { 
    position: -webkit-sticky; position: sticky; top: 20px; 
    display: flex; flex-direction: column; gap: 20px; 
    height: fit-content; min-width: 0;
}

/* --- PLAYER (16:9) --- */
.media-frame { 
    width: 100%; aspect-ratio: 16/9 !important; background: #000; 
    border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; 
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.media-frame img, .media-frame video { width: 100%; height: 100%; object-fit: contain; }

/* --- SLIDER --- */
.t-wrapper {
    display: flex !important; align-items: center !important; gap: 10px !important; width: 100% !important;
    background: white; padding: 10px; border-radius: 12px; border: 1px solid #e5e7eb; box-sizing: border-box;
}

.t-box { 
    display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important;
    gap: 12px !important; overflow-x: auto !important; scroll-behavior: smooth;
    width: 100%; white-space: nowrap !important; scrollbar-width: none;
}
.t-box::-webkit-scrollbar { display: none; }

.t-btn { 
    flex: 0 0 80px !important; width: 80px !important; height: 60px !important; min-width: 80px !important;
    position: relative; background: white; border: 2px solid transparent; 
    padding: 0; cursor: pointer; border-radius: 6px; overflow: hidden; transition: 0.2s;
}
.t-btn:hover, .t-btn:focus { border-color: var(--primary); transform: translateY(-2px); }
.t-btn img { display: block; width: 100%; height: 100%; object-fit: cover; }

.t-arrow {
    background: #f3f4f6; border: none; border-radius: 50%; width: 32px; height: 32px; 
    display: flex; align-items: center; justify-content: center; cursor: pointer; 
    flex-shrink: 0; font-weight: bold; color: #374151; transition: 0.2s;
}
.t-arrow:hover { background: #e5e7eb; color: #111; }

.play-icon-overlay {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.6); color: white; border-radius: 50%; width: 24px; height: 24px; 
    display: flex; align-items: center; justify-content: center; font-size: 10px; pointer-events: none;
}

/* --- RIGHT PANEL --- */
.form-col { 
    background: white; padding: 30px; border-radius: 16px; 
    border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    display: flex; flex-direction: column; gap: 1.5rem; 
}

.cards-row { display: flex; gap: 15px; }
.delivery-card { flex: 1; padding: 15px; border-radius: 10px; color: white; display: flex; flex-direction: column; justify-content: center; }
.bg-green { background: #059669; }
.bg-purple { background: #7c3aed; }
.delivery-card h3 { margin: 0; font-size: 0.9rem; font-weight: 700; text-transform: uppercase; }
.delivery-card span { font-size: 1rem; font-weight: 700; margin-top: 5px; }

.price-card2 { flex: 1; background: var(--primary); color: white; padding: 15px; border-radius: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; }
.price-card2 .price { font-size: 1.6rem; font-weight: 800; line-height: 1; }
.price-card2 .old-price { font-size: 0.9rem; opacity: 0.8; text-decoration: line-through; }
.price-card2 .discount { background: white; color: var(--primary); font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; margin-top: 5px; display: inline-block; align-self: center; }

.desc-box { background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; }

/* Form Styling */
.form-group { margin-bottom: 15px; }
.form-label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: #374151; }
.form-control { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; box-sizing: border-box; transition: 0.2s; }
.form-control:focus { border-color: var(--primary); outline: 4px solid #e0e7ff; }

.checkout-btn { width: 100%; background: #047857; color: white; padding: 18px; font-size: 1.1rem; font-weight: 800; border: none; border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; transition: 0.2s; box-shadow: 0 4px 6px rgba(4, 120, 87, 0.2); }
.checkout-btn:hover { background: #065f46; transform: translateY(-2px); }

.rating-text { color: #b45309; font-weight: bold; font-size: 0.9rem; margin-top: 5px; }

/* --- MOBILE OPTIMIZED (EDGE-TO-EDGE PLAYER) --- */
@media (max-width: 768px) {
    /* 1. Reset Container Padding */
    .product-container { 
        display: flex; flex-direction: column; gap: 20px; 
        margin: 0; padding: 0; /* Full Width Container */
        width: 100%; max-width: 100%;
    }
    
    .media-col { display: contents; } 

    /* 2. Edge-to-Edge Player */
    .media-frame { 
        order: 1; 
        width: 100%; 
        border-radius: 0; 
        border-left: none; border-right: none; 
        margin: 0; 
        box-shadow: none;
    }
    
    /* 3. Slider with Margin */
    .t-wrapper { 
        order: 2; 
        width: auto !important; /* Allow margin */
        margin: 0 15px; /* Spacing from sides */
    }
    
    /* 4. Form with Margin */
    .form-col { 
        order: 3; 
        margin: 0 15px; 
        padding: 20px; 
    }
    
    /* 5. Desc with Margin */
    .desc-box { 
        order: 4; 
        margin: 0 15px 40px 15px; 
    }
}
</style>
</head>
<body>

<main class="product-container">
  <div class="media-col">
    <div class="media-frame" id="main-media" role="region" aria-label="Media Player">
       ${product.video_url 
         ? `<video controls src="${product.video_url}" poster="${images[0]}" width="600" height="337"><track kind="captions" src="" label="English" /></video>` 
         : `<img src="${images[0]}" alt="${title}" width="600" height="337">`
       }
    </div>
    
    <div class="t-wrapper" role="region" aria-label="Gallery Slider">
        <button class="t-arrow" onclick="scrollThumbs(-1)" aria-label="Previous">❮</button>
        <div class="t-box" id="thumbs-box">
            ${thumbsHtml}
        </div>
        <button class="t-arrow" onclick="scrollThumbs(1)" aria-label="Next">❯</button>
    </div>
    
    <section class="desc-box">
      <h2 style="margin-top:0; font-size:1.2rem; border-bottom:1px solid #eee; padding-bottom:10px;">Product Description</h2>
      <p style="color:#4b5563; line-height:1.7; margin-top:15px;">${desc.replace(/\n/g, '<br>')}</p>
    </section>
  </div>

  <div class="form-col">
    <div>
        <h1 style="font-size:1.8rem; margin:0; line-height:1.3;">${title}</h1>
        <div class="rating-text">★ 5.0 (Best Seller)</div>
    </div>

    <div class="cards-row">
        <div class="delivery-card ${deliveryClass}">
            <h3>Delivery Time</h3>
            <span>${deliveryText}</span>
        </div>
        <div class="price-card2">
            <span class="price" id="display-price">$${price}</span>
            ${oldPrice > 0 ? `<span class="old-price">$${oldPrice}</span>` : ''}
            <span class="discount">Special</span>
        </div>
    </div>

    <div style="background:#ecfdf5; padding:12px; border-radius:8px; font-size:0.9rem; color:#065f46; border:1px solid #a7f3d0;">
       <strong>Delivery:</strong> ${deliveryText} directly to your inbox/phone.
    </div>

    <div class="form-section">
      <h2 style="color:#4f46e5; margin:0 0 20px 0; font-size:1.2rem; border-bottom: 2px solid #e0e7ff; padding-bottom: 10px; display:inline-block;">Customize Order</h2>
      
      <form id="orderForm" onsubmit="submitOrder(event)">
        ${formHtml}

        <button type="submit" class="checkout-btn">
            <span>Place Order</span>
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
    main.innerHTML = '<video controls autoplay src="'+url+'" poster="${images[0]}" style="width:100%;height:100%;object-fit:contain;"></video>';
  } else {
    main.innerHTML = '<img src="'+url+'" alt="Main View" style="width:100%;height:100%;object-fit:contain;">';
  }
}

function scrollThumbs(direction) {
    const container = document.getElementById('thumbs-box');
    const scrollAmount = 200;
    if(direction === 1) container.scrollLeft += scrollAmount;
    else container.scrollLeft -= scrollAmount;
}

function updatePrice(){
  let total = BASE_PRICE;
  
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
            if(fQty) for(let i=1;i<=fQty;i++) h+= '<div class="form-group"><label class="form-label" for="file_'+i+'">Upload File '+i+' <span style="color:red">*</span></label><input type="file" id="file_'+i+'" required class="form-control"></div>';
            if(tLbl) h+= '<div class="form-group"><label class="form-label" for="text_lbl">'+tLbl+' <span style="color:red">*</span></label><input type="text" id="text_lbl" required class="form-control"></div>';
            wrap.innerHTML = h;
            wrap.classList.add('show');
        } else {
            wrap.classList.remove('show');
            wrap.innerHTML = '';
        }
    }
  });

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
        if(type === 'header') return `<h3 style="margin:25px 0 15px 0; border-bottom:1px solid #ddd; padding-bottom:5px; font-size:1.1rem; color:#111;">${label}</h3>`;
        if(['text','email','number','date'].includes(type)) return `<div class="form-group"><label class="form-label" for="${fieldId}">${label} ${star}</label><input type="${type}" id="${fieldId}" class="form-control" ${req}></div>`;
        if(type === 'textarea') return `<div class="form-group"><label class="form-label" for="${fieldId}">${label} ${star}</label><textarea id="${fieldId}" class="form-control" rows="${f.rows||3}" ${req}></textarea></div>`;
        if(type === 'file') return `<div class="form-group"><label class="form-label" for="${fieldId}">${label} ${star}</label><input type="file" id="${fieldId}" class="form-control" ${req}></div>`;
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
                return `<div style="margin-bottom:8px"><label class="opt-row" for="${optId}" style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:white; border:1px solid #e5e7eb; border-radius:8px; cursor:pointer; transition:0.1s;"><span style="display:flex; align-items:center; gap:10px; color:#374151;"><input type="${isRadio?'radio':'checkbox'}" id="${optId}" name="${label}${isRadio?'':'[]'}" class="price-ref" data-price="${o.price||0}" data-cond-id="${hasCond?condId:''}" ${isRadio&&f.required?'required':''}>${o.label}</span><span style="font-weight:bold; color:#4f46e5;">${o.price>0 ? '+$'+o.price : ''}</span></label>${condHtml}</div>`;
            }).join('');
            return `<div class="form-group"><label class="form-label" style="margin-bottom:10px;">${label} ${star}</label>${opts}</div>`;
        }
        return '';
    }).join('');
}
