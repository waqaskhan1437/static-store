/**
 * admin/js/generator.js
 * Updated logic to match demo-product-1.html design exactly.
 */

export function generateProductHTML(product) {
    if (!product) return '';

    // Data handling
    const images = product.images && product.images.length > 0 ? product.images : ['https://placehold.co/600x600?text=No+Image'];
    const customForm = product.customForm || [];
    
    // Generate Form Fields HTML
    const formFieldsHtml = generateFormFields(customForm);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${product.title}</title>
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../product.css">
<style>
.product-container { display:grid; grid-template-columns: 1fr 1fr; gap:2rem; margin:2rem auto; max-width:1200px; padding:0 15px; }
.media-col { flex:1 1 55%; min-width:280px; }
.form-col { display:flex; flex-direction:column; gap:1rem; box-sizing:border-box; }
.media-frame { position:relative; width:100%; aspect-ratio:16/9; background:#000; border-radius:12px; overflow:hidden; margin-bottom:10px; }
.media-frame img, .media-frame video { position:absolute; width:100%; height:100%; object-fit:contain; }
.thumbs { display:flex; gap:8px; margin-top:0.75rem; flex-wrap:wrap; }
.thumbs img { width:80px; height:60px; border-radius:6px; cursor:pointer; object-fit:cover; border:2px solid transparent; }
.thumbs img:hover { border-color: #6366f1; }

.price-card2 { background:#8b5cf6; color:white; padding:1rem; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.25rem; margin-bottom: 20px; }
.price-card2 .price { font-size:1.8rem; font-weight:bold; }
.price-card2 .old-price { text-decoration:line-through; opacity:0.7; font-size:1rem; }

.form-section { border:1px solid #e5e7eb; border-radius:12px; padding:1rem; background:#f9fafb; display:flex; flex-direction:column; gap:1rem; }
.form-section label { font-weight:600; font-size:0.9rem; display:block; margin-bottom:0.25rem; }
.form-control { width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem; }

.checkout-btn { width:100%; background:#047857; color:white; border:none; padding:1rem; border-radius:12px; font-size:1.1rem; font-weight:700; cursor:pointer; margin-top:10px; }
.checkout-btn:hover { background:#065f46; }

/* Dynamic Fields Styling */
.opt-row { display:flex; justify-content:space-between; align-items:center; padding:8px; background:white; border:1px solid #e5e7eb; border-radius:6px; margin-bottom:5px; }
.conditional-wrap { margin-top:5px; padding:10px; background:#eff6ff; border-radius:6px; display:none; }
.conditional-wrap.show { display:block; animation: fadeIn 0.3s; }
@keyframes fadeIn { from{opacity:0; transform:translateY(-5px);} to{opacity:1; transform:translateY(0);} }

@media(max-width: 768px) { .product-container { grid-template-columns: 1fr; } }
</style>
</head>
<body>

<div class="product-container">
  <div class="media-col">
    <div class="media-frame" id="main-media">
       ${product.video_url 
         ? `<video controls src="${product.video_url}" poster="${images[0]}"></video>` 
         : `<img src="${images[0]}" alt="${product.title}">`
       }
    </div>
    <div class="thumbs">
      ${images.map(img => `<img src="${img}" onclick="switchMedia('image','${img}')">`).join('')}
    </div>
    
    <div class="description-card" style="margin-top:20px; padding:15px; border:1px solid #e5e7eb; border-radius:12px;">
      <h3>Description</h3>
      <p>${product.description.replace(/\n/g, '<br>')}</p>
    </div>
  </div>

  <div class="form-col">
    <h1>${product.title}</h1>
    
    <div class="price-card2">
      <span class="price" id="display-price">${product.price} PKR</span>
      ${product.old_price ? `<span class="old-price">${product.old_price} PKR</span>` : ''}
    </div>

    <form class="form-section" id="orderForm" onsubmit="submitOrder(event)">
      ${formFieldsHtml}

      <button type="submit" class="checkout-btn">
        Checkout <span id="btn-price">${product.price} PKR</span>
      </button>
    </form>
  </div>
</div>

<script>
const BASE_PRICE = ${product.price};

function switchMedia(type, url){
  const main = document.getElementById('main-media');
  main.innerHTML = '<img src="'+url+'" style="position:absolute;width:100%;height:100%;object-fit:contain;" />';
}

// Logic for Price Update & Conditionals
function updateForm() {
    let total = BASE_PRICE;
    
    // 1. Select Dropdowns
    document.querySelectorAll('select.calc-trigger').forEach(sel => {
        const opt = sel.options[sel.selectedIndex];
        const price = parseFloat(opt.dataset.price) || 0;
        total += price;

        // Show conditional inputs if exists
        const containerId = sel.dataset.condTarget;
        if(containerId) {
            document.getElementById(containerId).innerHTML = ''; // Clear old
            const fileQty = parseInt(opt.dataset.fileQty) || 0;
            const textLabel = opt.dataset.textLabel;
            
            let html = '';
            if(fileQty > 0) {
                for(let i=1; i<=fileQty; i++) html += '<div style="margin-top:5px"><label>Upload File '+i+'</label><input type="file" required class="form-control"></div>';
            }
            if(textLabel) {
                html += '<div style="margin-top:5px"><label>'+textLabel+'</label><input type="text" required class="form-control" placeholder="'+(opt.dataset.textPh || '')+'"></div>';
            }
            if(html) document.getElementById(containerId).innerHTML = '<div class="conditional-wrap show">'+html+'</div>';
        }
    });

    // 2. Checkboxes & Radios
    document.querySelectorAll('input.calc-trigger:checked').forEach(inp => {
        total += parseFloat(inp.dataset.price) || 0;
        
        // Show conditionals
        const condId = inp.dataset.condId;
        if(condId) {
            const wrap = document.getElementById(condId);
            if(wrap) {
                wrap.classList.add('show');
                wrap.querySelectorAll('input').forEach(i => i.disabled = false);
            }
        }
    });
    
    // Hide unchecked conditionals
    document.querySelectorAll('input.calc-trigger:not(:checked)').forEach(inp => {
        const condId = inp.dataset.condId;
        if(condId) {
            const wrap = document.getElementById(condId);
            if(wrap) {
                wrap.classList.remove('show');
                wrap.querySelectorAll('input').forEach(i => i.disabled = true);
            }
        }
    });

    // Update UI
    document.getElementById('display-price').innerText = total + ' PKR';
    document.getElementById('btn-price').innerText = total + ' PKR';
}

// Add Event Listeners
document.addEventListener('change', (e) => {
    if(e.target.classList.contains('calc-trigger')) updateForm();
});

function submitOrder(e) {
    e.preventDefault();
    const btn = document.querySelector('.checkout-btn');
    btn.innerHTML = 'Processing...';
    setTimeout(() => alert('Order Placed! Total: ' + document.getElementById('btn-price').innerText), 1000);
}
</script>

</body>
</html>`;
}

// --- Helper Functions to Generate Fields ---

function generateFormFields(fields) {
    return fields.map((f, i) => {
        const reqAttr = f.required ? 'required' : '';
        const reqStar = f.required ? '<span style="color:red">*</span>' : '';
        const baseId = `field_${i}`;

        if(f._type === 'header') return `<h3 style="margin:10px 0 5px; border-bottom:2px solid #ddd; padding-bottom:5px;">${f.label}</h3>`;
        
        if(f._type === 'text' || f._type === 'email') {
            return `<div><label>${f.label} ${reqStar}</label><input type="${f._type}" name="${f.label}" class="form-control" ${reqAttr}></div>`;
        }

        if(f._type === 'textarea') {
            return `<div><label>${f.label} ${reqStar}</label><textarea name="${f.label}" rows="${f.rows||3}" class="form-control" ${reqAttr}></textarea></div>`;
        }
        
        if(f._type === 'file') {
            return `<div><label>${f.label} ${reqStar}</label><input type="file" name="${f.label}" class="form-control" ${reqAttr}></div>`;
        }

        if(f._type === 'select') {
            const opts = f.options_list.map((o, idx) => `
                <option value="${o.label}" 
                    data-price="${o.price}" 
                    data-file-qty="${o.file_qty||0}"
                    data-text-label="${o.text_label||''}"
                    data-text-ph="${o.text_placeholder||''}"
                >
                    ${o.label} ${o.price > 0 ? '(+'+o.price+')' : ''}
                </option>`).join('');
            
            return `
            <div>
                <label>${f.label} ${reqStar}</label>
                <select name="${f.label}" class="form-control calc-trigger" data-cond-target="cond_container_${i}" ${reqAttr}>
                    <option value="" data-price="0">Select Option</option>
                    ${opts}
                </select>
                <div id="cond_container_${i}"></div>
            </div>`;
        }

        if(f._type === 'radio' || f._type === 'checkbox_group') {
            const isRadio = f._type === 'radio';
            const opts = f.options_list.map((o, idx) => {
                const condId = `cond_${i}_${idx}`;
                const hasCond = (o.file_qty > 0 || o.text_label);
                
                let condHtml = '';
                if(hasCond) {
                    condHtml = `<div id="${condId}" class="conditional-wrap">`;
                    if(o.file_qty) condHtml += `<div><small>Upload Required:</small><input type="file" class="form-control" disabled required></div>`;
                    if(o.text_label) condHtml += `<div><small>${o.text_label}:</small><input type="text" class="form-control" placeholder="${o.text_placeholder}" disabled required></div>`;
                    condHtml += `</div>`;
                }

                return `
                <div style="margin-bottom:5px;">
                    <label class="opt-row">
                        <span>
                            <input type="${isRadio ? 'radio' : 'checkbox'}" 
                                   name="${f.label}${isRadio ? '' : '[]'}" 
                                   class="calc-trigger" 
                                   data-price="${o.price}"
                                   data-cond-id="${hasCond ? condId : ''}"
                                   ${isRadio && f.required ? 'required' : ''}> 
                            ${o.label}
                        </span>
                        <span style="font-weight:bold; color:#6366f1;">${o.price > 0 ? '+'+o.price : ''}</span>
                    </label>
                    ${condHtml}
                </div>`;
            }).join('');
            
            return `<div><label style="margin-bottom:5px; display:block;">${f.label} ${reqStar}</label>${opts}</div>`;
        }

        return '';
    }).join('');
}
