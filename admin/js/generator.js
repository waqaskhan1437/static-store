/**
 * admin/js/generator.js
 * FIXED: 
 * - Handles Legacy Data
 * - Smooth Sliding Animation for Conditional Fields (CSS Transitions)
 * - Improved Mobile UI
 * - SEO Fields Added (Title, Keywords, Description)
 */

export function generateProductHTML(product) {
    if (!product) return '';

    // 1. Data Setup
    const images = (product.images && product.images.length > 0) 
        ? product.images 
        : ['https://placehold.co/600x600?text=No+Image'];
    
    // --- SEO UPDATES START ---
    // Page Title: Agar SEO Title diya hai to wo use karein, warna Product Title
    const pageTitle = product.seoTitle || product.title || 'Untitled Product';
    
    // Keywords: Agar SEO Keywords diye hain to wo use karein
    const keywords = product.seoKeywords || '';
    
    // Description: SEO Description > Product Description > Title
    const desc = product.description || '';
    const seoDesc = (product.seoDescription || desc || product.title || '').substring(0, 160).replace(/"/g, "'");
    // --- SEO UPDATES END ---

    // Display Title (H1 ke liye hamesha Product Title hi rahega)
    const title = product.title || 'Untitled Product';
    
    const price = parseFloat(product.price) || 0;
    const oldPrice = parseFloat(product.old_price) || 0;

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
        let ariaLabel = `View ${title} Image ${idx + 1}`;
        let playIconOverlay = '';

        if (idx === 0 && product.video_url) {
            clickAction = `switchMedia('video','${product.video_url}')`;
            ariaLabel = `Play Product Video`;
            playIconOverlay = `<span class="play-icon-overlay" aria-hidden="true">▶</span>`;
        }

        return `
        <button type="button" class="t-btn" onclick="${clickAction}" aria-label="${ariaLabel}">
            <img src="${img}" alt="${title} view ${idx + 1}" loading="lazy">
            ${playIconOverlay}
        </button>
        `;
    }).join('');

    // 3. Form Logic
    const formHtml = generateDynamicForm(product.customForm || []);

    // 4. Final HTML Structure
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${pageTitle}</title>
<meta name="description" content="${seoDesc}">
${keywords ? `<meta name="keywords" content="${keywords.replace(/"/g, "'")}">` : ''}

<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../product.css">
<style>
/* --- CORE STYLES --- */
:root { --primary: #4f46e5; --dark: #111; }
* { box-sizing: border-box; } 
body { 
    font-family: 'Segoe UI', system-ui, sans-serif; 
    color: #1f2937; 
    line-height: 1.5; 
    margin: 0; 
    background: #f9fafb;
    overflow-x: hidden;
}

/* --- ANIMATION CSS FOR SLIDING EFFECT --- */
.conditional-wrap {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.4s ease-in-out; /* Smooth Slide */
    padding: 0 15px; /* Start with 0 padding vertical */
    background: #f8fafc;
    border-radius: 8px;
    border-left: 3px solid var(--primary);
    margin-top: 0;
}

.conditional-wrap.show {
    max-height: 1000px; /* Allow expansion */
    opacity: 1;
    padding: 15px; /* Restore padding */
    margin-top: 10px;
    margin-bottom: 10px;
    border: 1px solid #e2e8f0;
    border-left: 3px solid var(--primary);
}

/* --- LAYOUT --- */
.product-container { 
    display: grid; 
    grid-template-columns: 1.2fr 1fr; 
    gap: 40px; 
    margin: 40px auto; 
    max-width: 1200px; 
    padding: 0 20px; 
    align-items: start;
}

.media-col { 
    position: sticky; top: 20px; 
    display: flex; flex-direction: column; gap: 20px; 
}

.media-frame { 
    width: 100%; aspect-ratio: 16/9; background: #000; 
    border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; 
    display: flex; align-items: center; justify-content: center;
}
.media-frame img, .media-frame video { width: 100%; height: 100%; object-fit: contain; }

.t-wrapper {
    display: flex; align-items: center; gap: 10px; width: 100%;
    background: white; padding: 10px; border-radius: 12px; border: 1px solid #e5e7eb;
}
.t-box { 
    display: flex; gap: 12px; overflow-x: auto; scroll-behavior: smooth;
    width: 100%; white-space: nowrap; scrollbar-width: none;
}
.t-box::-webkit-scrollbar { display: none; }

.t-btn { 
    flex: 0 0 80px; height: 60px;
    position: relative; background: white; border: 2px solid transparent; 
    padding: 0; cursor: pointer; border-radius: 6px; overflow: hidden; transition: 0.2s;
}
.t-btn:hover { border-color: var(--primary); transform: translateY(-2px); }
.t-btn img { width: 100%; height: 100%; object-fit: cover; }

.t-arrow {
    background: #f3f4f6; border: none; border-radius: 50%; width: 32px; height: 32px; 
    cursor: pointer; font-weight: bold; color: #374151;
}

/* --- FORM AREA --- */
.form-col { 
    background: white; padding: 30px; border-radius: 16px; 
    border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.cards-row { display: flex; gap: 15px; margin-bottom: 20px; }
.delivery-card { flex: 1; padding: 15px; border-radius: 10px; color: white; }
.bg-green { background: #059669; }
.bg-purple { background: #7c3aed; }

.price-card2 { 
    flex: 1; background: var(--primary); color: white; 
    padding: 15px; border-radius: 10px; text-align: center; 
    display: flex; flex-direction: column; justify-content: center; 
}
.price-card2 .price { font-size: 1.6rem; font-weight: 800; line-height: 1; }
.price-card2 .old-price { font-size: 0.9rem; opacity: 0.8; text-decoration: line-through; }

.form-group { margin-bottom: 15px; }
.form-label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: #374151; }
.form-control { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }
.form-control:focus { border-color: var(--primary); outline: 4px solid #e0e7ff; }

/* Option Styling */
.opt-label {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px; background: white; border: 1px solid #e5e7eb;
    border-radius: 8px; cursor: pointer; transition: 0.1s;
}
.opt-label:hover { background: #f9fafb; border-color: var(--primary); }
.opt-label input { margin-right: 10px; transform: scale(1.2); }

.checkout-btn { 
    width: 100%; background: #047857; color: white; padding: 18px; 
    font-size: 1.1rem; font-weight: 800; border: none; border-radius: 10px; 
    cursor: pointer; display: flex; justify-content: space-between; 
    margin-top: 20px; transition: 0.2s; box-shadow: 0 4px 6px rgba(4, 120, 87, 0.2); 
}
.checkout-btn:hover { background: #065f46; transform: translateY(-2px); }

/* --- MOBILE --- */
@media (max-width: 768px) {
    .product-container { display: flex; flex-direction: column; width: 100%; padding: 0; }
    .media-col, .form-col { width: 100%; border-radius: 0; box-shadow: none; border: none; }
    .media-frame { border-radius: 0; }
    .form-col { padding: 20px; }
}
</style>
</head>
<body>

<main class="product-container">
  <div class="media-col">
    <div class="media-frame" id="main-media">
       ${product.video_url 
         ? `<video controls src="${product.video_url}" poster="${images[0]}" width="600" height="337"></video>` 
         : `<img src="${images[0]}" alt="${title}">`
       }
    </div>
    
    <div class="t-wrapper">
        <button class="t-arrow" onclick="scrollThumbs(-1)">❮</button>
        <div class="t-box" id="thumbs-box">
            ${thumbsHtml}
        </div>
        <button class="t-arrow" onclick="scrollThumbs(1)">❯</button>
    </div>
    
    <div style="background:white; padding:20px; border-radius:12px; margin-top:20px; border:1px solid #e5e7eb;">
      <h2 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">Description</h2>
      <p style="color:#4b5563; line-height:1.7;">${desc.replace(/\n/g, '<br>')}</p>
    </div>
  </div>

  <div class="form-col">
    <div>
        <h1 style="font-size:1.8rem; margin:0; line-height:1.3;">${title}</h1>
        <div style="color:#b45309; font-weight:bold; margin-top:5px;">★ 5.0 (Best Seller)</div>
    </div>

    <div class="cards-row" style="margin-top:20px;">
        <div class="delivery-card ${deliveryClass}">
            <small style="text-transform:uppercase;">Delivery Time</small>
            <div style="font-weight:bold; font-size:1.1rem; margin-top:5px;">${deliveryText}</div>
        </div>
        <div class="price-card2">
            <span class="price" id="display-price">$${price}</span>
            ${oldPrice > 0 ? `<span class="old-price">$${oldPrice}</span>` : ''}
        </div>
    </div>

    <form id="orderForm" onsubmit="submitOrder(event)">
        ${formHtml}

        <button type="submit" class="checkout-btn">
            <span>Place Order</span>
            <span id="btn-price">$${price}</span>
        </button>
    </form>
  </div>
</main>

<script>
let BASE_PRICE = ${price};

function switchMedia(type, url){
  const main = document.getElementById('main-media');
  if(type === 'video'){
    main.innerHTML = '<video controls autoplay src="'+url+'" poster="${images[0]}" style="width:100%;height:100%;object-fit:contain;"></video>';
  } else {
    main.innerHTML = '<img src="'+url+'" style="width:100%;height:100%;object-fit:contain;">';
  }
}

function scrollThumbs(direction) {
    const container = document.getElementById('thumbs-box');
    container.scrollLeft += (direction * 200);
}

// 🔥 CORE LOGIC FOR PRICE & SLIDE ANIMATION
function updatePrice(){
  let total = BASE_PRICE;
  
  // 1. Handle Select Dropdowns
  document.querySelectorAll('select.price-ref').forEach(sel => {
    const opt = sel.options[sel.selectedIndex];
    total += parseFloat(opt.dataset.price) || 0;
    
    const target = sel.dataset.condTarget;
    if(target){
        const wrap = document.getElementById(target);
        const fQty = parseInt(opt.dataset.fileQty)||0;
        const tLbl = opt.dataset.textLabel;
        
        if(fQty > 0 || tLbl){
            // Build Fields if they don't exist
            let h = '';
            if(fQty) for(let i=1;i<=fQty;i++) h+= '<div class="form-group"><label class="form-label">Upload File '+i+' <span style="color:red">*</span></label><input type="file" required class="form-control"></div>';
            if(tLbl) h+= '<div class="form-group"><label class="form-label">'+tLbl+' <span style="color:red">*</span></label><input type="text" required class="form-control"></div>';
            
            wrap.innerHTML = h;
            // Trigger Animation
            setTimeout(() => wrap.classList.add('show'), 10);
            wrap.querySelectorAll('input').forEach(i => i.disabled = false);
        } else {
            // Hide Animation
            wrap.classList.remove('show');
            setTimeout(() => { wrap.innerHTML = ''; }, 400); // Wait for transition
        }
    }
  });

  // 2. Handle Radio & Checkboxes
  document.querySelectorAll('input.price-ref').forEach(inp => {
    const condId = inp.dataset.condId;
    const wrap = document.getElementById(condId);

    if(inp.checked){
        total += parseFloat(inp.dataset.price) || 0;
        if(wrap) {
            // Show Slide
            wrap.classList.add('show');
            wrap.querySelectorAll('input').forEach(i => i.disabled = false);
        }
    } else {
        // Handle Uncheck logic
        if(wrap && inp.type !== 'radio') {
             wrap.classList.remove('show');
             wrap.querySelectorAll('input').forEach(i => i.disabled = true);
        }
        // If Radio, we need to hide others that share same name but aren't checked
        // (Logic handled by iteration, just ensure we remove 'show')
        if(inp.type === 'radio' && !inp.checked && wrap){
             wrap.classList.remove('show');
             wrap.querySelectorAll('input').forEach(i => i.disabled = true);
        }
    }
  });

  const finalPrice = '$' + total.toFixed(2);
  const btnPriceSpan = document.getElementById('btn-price');
  if(btnPriceSpan) btnPriceSpan.innerText = finalPrice;
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

// --- HELPER: Form Generator with Wrapper Classes ---

function generateDynamicForm(fields) {
    if (!fields || fields.length === 0) return '<p>No options available.</p>';
    
    return fields.map((f, i) => {
        // NORMALIZE
        let type = f._type;
        if(type === 'textField') type = 'text';
        if(type === 'textAreaField') type = 'textarea';
        if(type === 'selectField') type = 'select';
        if(type === 'radioField') type = 'radio';
        if(type === 'checkboxField') type = 'checkbox_group';
        if(type === 'fileUploadField') type = 'file';

        let optionsList = f.options_list || [];
        if(optionsList.length === 0 && f.options && typeof f.options === 'string') {
            optionsList = f.options.split(',').map(s => ({
                label: s.trim(), price: 0, file_qty: 0, text_label: ''
            })).filter(o => o.label);
        }

        const label = f.label;
        const req = f.required ? 'required' : '';
        const star = f.required ? '<span style="color:red">*</span>' : '';
        const fieldId = `f_${i}`;
        
        if(type === 'header') return `<h3 style="margin:25px 0 15px 0; border-bottom:1px solid #ddd; padding-bottom:5px; font-size:1.1rem;">${label}</h3>`;
        
        if(['text','email','number','date'].includes(type)) 
            return `<div class="form-group"><label class="form-label">${label} ${star}</label><input type="${type}" class="form-control" ${req}></div>`;
        
        if(type === 'textarea') 
            return `<div class="form-group"><label class="form-label">${label} ${star}</label><textarea class="form-control" rows="${f.rows||3}" ${req}></textarea></div>`;
        
        if(type === 'file') 
            return `<div class="form-group"><label class="form-label">${label} ${star}</label><input type="file" class="form-control" ${req}></div>`;
        
        if(type === 'select') {
            const condTarget = `cond_sel_${i}`;
            const opts = optionsList.map(o => `<option value="${o.label}" data-price="${o.price||0}" data-file-qty="${o.file_qty||0}" data-text-label="${o.text_label||''}">${o.label} ${o.price>0 ? '(+$'+o.price+')' : ''}</option>`).join('');
            return `<div class="form-group"><label class="form-label">${label} ${star}</label><select class="form-control price-ref" data-cond-target="${condTarget}" ${req}><option value="" data-price="0">Select Option</option>${opts}</select><div id="${condTarget}" class="conditional-wrap"></div></div>`;
        }
        
        if(type === 'radio' || type === 'checkbox_group') {
            const isRadio = type === 'radio';
            const opts = optionsList.map((o, idx) => {
                const condId = `cond_opt_${i}_${idx}`;
                const hasCond = (o.file_qty > 0 || o.text_label);
                let condHtml = '';
                if(hasCond) {
                    condHtml = `<div id="${condId}" class="conditional-wrap">`;
                    if(o.file_qty) for(let k=1; k<=o.file_qty; k++) condHtml += `<div class="form-group" style="margin-top:10px"><label class="form-label">Upload File ${k} *</label><input type="file" class="form-control" disabled required></div>`;
                    if(o.text_label) condHtml += `<div class="form-group" style="margin-top:10px"><label class="form-label">${o.text_label} *</label><input type="text" class="form-control" disabled required></div>`;
                    condHtml += `</div>`;
                }
                return `<div style="margin-bottom:8px"><label class="opt-label"><span style="display:flex; align-items:center;"><input type="${isRadio?'radio':'checkbox'}" name="${label}${isRadio?'':'[]'}" class="price-ref" data-price="${o.price||0}" data-cond-id="${hasCond?condId:''}" ${isRadio&&f.required?'required':''}> ${o.label}</span><b style="color:#4f46e5">${o.price>0 ? '+$'+o.price : ''}</b></label>${condHtml}</div>`;
            }).join('');
            return `<div class="form-group"><label class="form-label">${label} ${star}</label>${opts}</div>`;
        }
        return '';
    }).join('');
}
