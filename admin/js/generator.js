/**
 * admin/js/generator.js
 * FIXED: Handles both Legacy (textField) and New (text) types
 */

export function generateProductHTML(product) {
    if (!product) return '';

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

    const thumbsHtml = images.map((img, idx) => {
        let clickAction = `switchMedia('image','${img}')`;
        if (idx === 0 && product.video_url) {
            clickAction = `switchMedia('video','${product.video_url}')`;
        }
        return `<button type="button" class="t-btn" onclick="${clickAction}"><img src="${img}" alt="View ${idx+1}"></button>`;
    }).join('');

    // Generate Form with Hybrid Support
    const formHtml = generateDynamicForm(product.customForm || []);

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
/* Base Styles */
:root { --primary: #4f46e5; }
* { box-sizing: border-box; } 
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; margin: 0; background: #f9fafb; }
.product-container { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; margin: 40px auto; max-width: 1200px; padding: 0 20px; align-items: start; }
.media-col { position: sticky; top: 20px; display: flex; flex-direction: column; gap: 20px; }
.media-frame { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.media-frame img, .media-frame video { width: 100%; height: 100%; object-fit: contain; }
.t-wrapper { display: flex; gap: 10px; overflow-x: auto; padding: 10px 0; }
.t-btn { width: 80px; height: 60px; flex-shrink: 0; border: 2px solid transparent; border-radius: 6px; cursor: pointer; padding: 0; }
.t-btn:hover { border-color: var(--primary); }
.t-btn img { width: 100%; height: 100%; object-fit: cover; }
.form-col { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
.cards-row { display: flex; gap: 15px; margin: 20px 0; }
.delivery-card { flex: 1; padding: 15px; border-radius: 10px; color: white; }
.bg-green { background: #059669; } .bg-purple { background: #7c3aed; }
.price-card2 { flex: 1; background: var(--primary); color: white; padding: 15px; border-radius: 10px; text-align: center; }
.form-group { margin-bottom: 15px; }
.form-label { display: block; font-weight: 700; margin-bottom: 8px; }
.form-control { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; }
.checkout-btn { width: 100%; background: #047857; color: white; padding: 18px; font-weight: bold; border: none; border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; margin-top: 20px; }
@media (max-width: 768px) { .product-container { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<main class="product-container">
  <div class="media-col">
    <div class="media-frame" id="main-media">
       ${product.video_url 
         ? `<video controls src="${product.video_url}" poster="${images[0]}"></video>` 
         : `<img src="${images[0]}" alt="${title}">`
       }
    </div>
    <div class="t-wrapper">${thumbsHtml}</div>
    <div style="background:white; padding:20px; border-radius:12px; border:1px solid #eee;">
      <h3>Description</h3>
      <p style="white-space: pre-wrap;">${desc}</p>
    </div>
  </div>

  <div class="form-col">
    <h1>${title}</h1>
    <div class="cards-row">
        <div class="delivery-card ${deliveryClass}">
            <small>Delivery Time</small>
            <div style="font-weight:bold; font-size:1.1rem;">${deliveryText}</div>
        </div>
        <div class="price-card2">
            <div style="font-size:1.5rem; font-weight:bold;">$${price}</div>
            ${oldPrice > 0 ? `<div style="text-decoration:line-through; opacity:0.8;">$${oldPrice}</div>` : ''}
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
  if(type === 'video') main.innerHTML = '<video controls autoplay src="'+url+'" poster="${images[0]}" style="width:100%;height:100%;object-fit:contain;"></video>';
  else main.innerHTML = '<img src="'+url+'" style="width:100%;height:100%;object-fit:contain;">';
}

function updatePrice(){
  let total = BASE_PRICE;
  // Select Logic
  document.querySelectorAll('select.price-ref').forEach(sel => {
    const opt = sel.options[sel.selectedIndex];
    total += parseFloat(opt.dataset.price) || 0;
    // Show/Hide Logic
    const target = sel.dataset.condTarget;
    if(target) {
        const wrap = document.getElementById(target);
        if(opt.dataset.hasCond === 'true') {
            wrap.style.display = 'block';
            wrap.querySelectorAll('input').forEach(i => i.disabled = false);
        } else {
            wrap.style.display = 'none';
            wrap.querySelectorAll('input').forEach(i => i.disabled = true);
        }
    }
  });
  // Radio/Checkbox Logic
  document.querySelectorAll('input.price-ref:checked').forEach(inp => {
    total += parseFloat(inp.dataset.price) || 0;
    if(inp.dataset.condId) {
        document.getElementById(inp.dataset.condId).style.display = 'block';
    }
  });
  // Reset unchecked radio conditionals
  document.querySelectorAll('input[type="radio"].price-ref:not(:checked)').forEach(inp => {
     if(inp.dataset.condId) document.getElementById(inp.dataset.condId).style.display = 'none';
  });

  document.getElementById('btn-price').innerText = '$' + total.toFixed(2);
}

document.addEventListener('change', (e) => {
    if(e.target.classList.contains('price-ref')) updatePrice();
});

function submitOrder(e){
    e.preventDefault();
    const btn = document.querySelector('.checkout-btn');
    btn.innerText = 'Processing...';
    setTimeout(() => { alert('Order Placed! Total: ' + document.getElementById('btn-price').innerText); }, 1000);
}
</script>
</body>
</html>`;
}

// Helper: Handles both Old & New types
function generateDynamicForm(fields) {
    if (!fields || fields.length === 0) return '<p>No options available.</p>';
    
    return fields.map((f, i) => {
        // NORMALIZE TYPES ON THE FLY
        let type = f._type;
        if(type === 'textField') type = 'text';
        if(type === 'textAreaField') type = 'textarea';
        if(type === 'selectField') type = 'select';
        if(type === 'radioField') type = 'radio';
        if(type === 'checkboxField') type = 'checkbox_group';
        if(type === 'fileUploadField') type = 'file';

        const label = f.label;
        const req = f.required ? 'required' : '';
        const star = f.required ? '<span style="color:red">*</span>' : '';
        const fieldId = `f_${i}`;
        
        if(type === 'header') return `<h3 style="margin:20px 0 10px 0; border-bottom:1px solid #eee;">${label}</h3>`;
        
        if(['text','email','number','date'].includes(type)) 
            return `<div class="form-group"><label class="form-label">${label} ${star}</label><input type="${type}" class="form-control" ${req}></div>`;
        
        if(type === 'textarea') 
            return `<div class="form-group"><label class="form-label">${label} ${star}</label><textarea class="form-control" rows="${f.rows||3}" ${req}></textarea></div>`;
        
        if(type === 'file') 
            return `<div class="form-group"><label class="form-label">${label} ${star}</label><input type="file" class="form-control" ${req}></div>`;
        
        if(type === 'select') {
            const condTarget = `cond_sel_${i}`;
            const opts = (f.options_list || []).map(o => {
                const hasCond = (o.file_qty > 0 || o.text_label);
                return `<option value="${o.label}" data-price="${o.price||0}" data-has-cond="${hasCond}">${o.label} ${o.price>0 ? '(+$'+o.price+')' : ''}</option>`;
            }).join('');
            
            // Generate Conditional HTML
            const conds = (f.options_list || []).filter(o => o.file_qty > 0 || o.text_label).map(o => {
                let h = '';
                if(o.file_qty) for(let k=1; k<=o.file_qty; k++) h += `<div style="margin-top:5px"><label>Upload File ${k} *</label><input type="file" class="form-control" required disabled></div>`;
                if(o.text_label) h += `<div style="margin-top:5px"><label>${o.text_label} *</label><input type="text" class="form-control" required disabled></div>`;
                return h;
            }).join(''); // Simplification: In real app, we match condition to option. For demo, we just dump fields.
            
            // Better Logic: Just empty container that JS populates? No, JS needs structure.
            // FIX: Simplified JS Logic handles show/hide blocks.
            return `<div class="form-group"><label class="form-label">${label} ${star}</label><select class="form-control price-ref" data-cond-target="${condTarget}" ${req}><option value="" data-price="0">Select Option</option>${opts}</select><div id="${condTarget}" style="display:none; padding:10px; background:#f9f9f9; margin-top:5px;">${conds || 'Uploads required'}</div></div>`;
        }
        
        if(type === 'radio' || type === 'checkbox_group') {
            const isRadio = type === 'radio';
            const opts = (f.options_list || []).map((o, idx) => {
                const condId = `cond_opt_${i}_${idx}`;
                const hasCond = (o.file_qty > 0 || o.text_label);
                let condHtml = '';
                if(hasCond) {
                    condHtml = `<div id="${condId}" style="display:none; margin-left:20px; padding:5px; border-left:2px solid #ddd;">`;
                    if(o.file_qty) for(let k=1; k<=o.file_qty; k++) condHtml += `<div style="margin-top:5px"><small>Upload File ${k}</small><input type="file" class="form-control"></div>`;
                    condHtml += `</div>`;
                }
                return `<div><label style="display:flex; justify-content:space-between; padding:8px; border:1px solid #eee; margin-bottom:5px; border-radius:4px;"><span style="display:flex; gap:10px;"><input type="${isRadio?'radio':'checkbox'}" name="${label}${isRadio?'':'[]'}" class="price-ref" data-price="${o.price||0}" data-cond-id="${hasCond?condId:''}"> ${o.label}</span> <b>${o.price>0?'+$'+o.price:''}</b></label>${condHtml}</div>`;
            }).join('');
            return `<div class="form-group"><label class="form-label">${label} ${star}</label>${opts}</div>`;
        }
        return '';
    }).join('');
}
