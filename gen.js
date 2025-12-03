const fs = require('fs');

// HTML generator from admin.js
function generateProductHTML(product) {
  const fieldsHtml = product.customForm && product.customForm.length > 0 ? product.customForm.map(field => {
    const label = field.label || '';
    const placeholder = field.placeholder || '';
    const required = field.required ? 'required' : '';
    const asterisk = field.required ? '<span style="color:#ef4444;">*</span>' : '';
    switch (field._type) {
      case 'textField':
        return `<div style="margin-top:1rem;"><label>${label} ${asterisk}</label><input type="text" placeholder="${placeholder}" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;"></div>`;
      case 'textAreaField':
        return `<div style="margin-top:1rem;"><label>${label} ${asterisk}</label><textarea rows="3" placeholder="${placeholder}" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;"></textarea></div>`;
      case 'selectField': {
        const opts = field.options ? field.options.split(',').map(o => o.trim()).filter(Boolean) : [];
        const optionsHtml = opts.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        return `<div style="margin-top:1rem;"><label>${label} ${asterisk}</label><select style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;"><option value="">Select Option</option>${optionsHtml}</select></div>`;
      }
      case 'checkboxField':
        return `<div style="margin-top:1rem;"><label style="display:flex;align-items:center;gap:10px;"><input type="checkbox"> ${label} ${asterisk}</label></div>`;
      case 'radioField': {
        const opts = field.options ? field.options.split(',').map(o => o.trim()).filter(Boolean) : [];
        const radioName = label.toLowerCase().replace(/\s+/g, '-') + '-radio';
        const radios = opts.map(opt => `<label style="display:flex;align-items:center;gap:10px;margin-right:12px;"><input type="radio" name="${radioName}"> ${opt}</label>`).join('');
        return `<div style="margin-top:1rem;"><span>${label} ${asterisk}</span><div style="display:flex;gap:12px;margin-top:4px;">${radios}</div></div>`;
      }
      case 'fileUploadField':
        return `<div style="margin-top:1rem;"><label>${label} ${asterisk}</label><input type="file" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;"></div>`;
      default:
        return '';
    }
  }).join('') : '';
  const thumbnailsHtml = product.images && product.images.length > 0 ? product.images.map((img, idx) => {
    return `<img src="${img}" onclick="switchMedia('image','${img}')">`;
  }).join('') : '';
  const hasVideo = product.videos && product.videos.length > 0;
  const mainMediaHtml = hasVideo
    ? `<video controls src="${product.videos[0]}" poster="${product.images[0] || ''}"></video>`
    : `<img src="${product.images[0] || ''}" alt="${product.title}" />`;
  const hasDeliveryOptions = product.deliveryOptions && product.deliveryOptions.length > 0;
  const deliveryCostsArray = hasDeliveryOptions
    ? '[' + product.deliveryOptions.map(opt => (parseFloat(opt.price) || 0).toFixed(2)).join(',') + ']'
    : '[15,5,0]';
  const deliveryNamesArray = hasDeliveryOptions
    ? '[' + product.deliveryOptions.map(opt => '`' + opt.name.replace(/`/g, '\\`') + '`').join(',') + ']'
    : "['Instant Delivery in 60 Minutes','1 Day delivery','Standard Delivery Free']";
  let defaultDelivery = null;
  if (hasDeliveryOptions) {
    defaultDelivery = product.deliveryOptions.find(opt => opt.default) || product.deliveryOptions[0];
  }
  const deliveryTitle = defaultDelivery ? defaultDelivery.name : 'Instant Delivery in 60 Minutes';
  let deliveryTime = '';
  if (defaultDelivery) {
    const m = defaultDelivery.name.match(/(\d+\s*(?:Minute|Minutes|Hour|Hours|Day|Days))/i);
    if (m) deliveryTime = m[1];
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${product.title}</title>
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="../product.css">
<style>
.product-container { display:grid; grid-template-columns: 1fr 1fr; gap:2rem; margin:2rem auto; max-width:1200px; }
.media-col { flex:1 1 55%; min-width:280px; }
.form-col { display:flex; flex-direction:column; gap:1rem; box-sizing:border-box; }
.media-frame { position:relative; width:100%; aspect-ratio:16/9; background:#000; border-radius:12px; overflow:hidden; }
.media-frame img, .media-frame video { position:absolute; width:100%; height:100%; object-fit:cover; }
.thumbs { display:flex; gap:8px; margin-top:0.75rem; flex-wrap:wrap; }
.thumbs img { width:80px; height:60px; border-radius:6px; cursor:pointer; object-fit:cover; }
.rating { font-size:0.9rem; color:#fbbf24; font-weight:bold; }
.price-card { display:flex; align-items:center; gap:0.5rem; }
.current-price { background:#8b5cf6; color:white; padding:6px 10px; border-radius:8px; font-size:1.5rem; font-weight:bold; }
.old-price { text-decoration:line-through; color:#6b7280; font-size:1.2rem; }
.discount-badge { background:#fbbf24; color:#78350f; padding:4px 6px; border-radius:6px; font-size:0.75rem; font-weight:600; }
.digital-note { background:#d1fae5; padding:0.75rem; border-radius:8px; font-size:0.9rem; color:#065f46; }
.cards-row { display:flex; gap:1rem; margin-top:0.5rem; }
.delivery-card { flex:1; background:#10b981; color:white; padding:1rem; border-radius:12px; display:flex; flex-direction:column; justify-content:center; }
.delivery-card h4 { margin:0; font-size:1rem; font-weight:700; }
.delivery-card span { font-size:0.8rem; opacity:0.9; }
.price-card2 { flex:1; background:#8b5cf6; color:white; padding:1rem; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.25rem; }
.price-card2 .price { font-size:1.8rem; font-weight:bold; }
.price-card2 .old-price { text-decoration:line-through; opacity:0.7; font-size:1rem; }
.price-card2 .discount { background:white; color:#8b5cf6; padding:2px 6px; border-radius:9999px; font-size:0.75rem; font-weight:700; }
.cta-btn { background:#6366f1; color:white; padding:0.75rem 1rem; border-radius:8px; font-size:1rem; font-weight:700; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
.cta-btn:hover { background:#4f46e5; }
.form-section { border:1px solid #e5e7eb; border-radius:12px; padding:1rem; background:#f9fafb; display:flex; flex-direction:column; gap:1rem; box-sizing:border-box; }
.form-section label { font-weight:600; font-size:0.9rem; display:block; margin-bottom:0.25rem; }
.form-section input[type="text"], .form-section input[type="email"], .form-section textarea, .form-section select {
  width:100%;
  padding:0.6rem 0.75rem;
  border:1px solid #d1d5db;
  border-radius:8px;
  font-size:0.9rem;
  box-sizing:border-box;
}
.delivery-speed { border:1px solid #d1d5db; border-radius:8px; overflow:hidden; }
.delivery-option { display:flex; justify-content:space-between; align-items:center; padding:0.75rem; border-bottom:1px solid #d1d5db; cursor:pointer; }
.delivery-option:last-child { border-bottom:none; }
.delivery-option label { flex:1; display:flex; align-items:center; gap:10px; }
.delivery-option input[type="radio"] { width:20px; height:20px; margin-right:4px; accent-color:#047857; }
.delivery-option span { flex:none; }
.checkout-btn { width:100%; background:#047857; color:white; border:none; padding:1rem; border-radius:12px; font-size:1.1rem; font-weight:700; display:flex; justify-content:space-between; align-items:center; cursor:pointer; }
.checkout-btn:hover { background:#065f46; }
.description-card, .reviews-card { border:1px solid #e5e7eb; border-radius:12px; padding:1rem; margin-top:1.5rem; }
.description-card h3, .reviews-card h3 { font-size:1rem; margin-bottom:0.5rem; font-weight:700; }
</style>
</head>
<body>
<div class="product-container">
  <div class="media-col">
    <div class="media-frame" id="main-media">
      ${mainMediaHtml}
    </div>
    <div class="thumbs">
      ${thumbnailsHtml}
    </div>
    <div class="description-card">
      <h3>Description</h3>
      <p>${product.description || ''}</p>
    </div>
    <div class="reviews-card">
      <h3>Customer Reviews</h3>
      <p>No reviews yet.</p>
    </div>
  </div>
  <div class="form-col">
    <h1>${product.title}</h1>
    <div class="rating">★ 5.0 (0 Reviews)</div>
    <div class="cards-row">
      <div class="delivery-card">
        <h4>${deliveryTitle}</h4>
        <span>${deliveryTime}</span>
      </div>
      <div class="price-card2">
        <span class="price">$${product.price.toFixed(2)}</span>
        <span class="old-price">$${(product.price * 2).toFixed(2)}</span>
        <span class="discount">50% OFF</span>
      </div>
    </div>
    <div class="digital-note">Digital Delivery: Receive via WhatsApp/Email.</div>
    <button type="button" class="cta-btn">Start Customize Your Video <span style="font-size:1.2rem;">\u2B07</span></button>
    <div class="form-section">
      ${product.formHeadingText ? `<h3 class="form-heading" style="color:${product.formHeadingColor || '#6366f1'};margin:0;font-size:1.25rem;font-weight:700;">${product.formHeadingText}</h3>` : ''}
      ${fieldsHtml}
      <label>Email *</label>
      <input type="email" id="email" placeholder="Enter Email Address" required>
      <label>What Shall We Say *</label>
      <textarea id="message" placeholder="e.g Happy Birthday Video John" rows="3" required></textarea>
      <div>
        <label>Delivery Speed</label>
        <div class="delivery-speed" id="delivery-speed">
          ${product.deliveryOptions && product.deliveryOptions.length > 0
            ? product.deliveryOptions.map((opt, idx) => {
                const checked = opt.default ? 'checked' : '';
                const priceLabel = parseFloat(opt.price) > 0 ? '+$' + parseFloat(opt.price).toFixed(2) : 'Free';
                return `<div class="delivery-option"><label style="display:flex;align-items:center;gap:8px;"><input type="radio" name="delivery" value="${idx}" ${checked}> ${opt.name}</label><span>${priceLabel}</span></div>`;
              }).join('')
            : `<div class="delivery-option"><label style="display:flex;align-items:center;gap:8px;"><input type="radio" name="delivery" value="0" checked> Instant Delivery in 60 Minutes</label><span>+$15</span></div>
              <div class="delivery-option"><label style="display:flex;align-items:center;gap:8px;"><input type="radio" name="delivery" value="1"> 1 Day delivery</label><span>+$5</span></div>
              <div class="delivery-option"><label style="display:flex;align-items:center;gap:8px;"><input type="radio" name="delivery" value="2"> Standard Delivery Free</label><span>Free</span></div>`}
        </div>
      </div>
      <div>
        <label>Choose Photo</label>
        <select id="choose-photo-count">
          <option value="">Select number</option>
          ${product.photoOptions && product.photoOptions.length > 0
            ? product.photoOptions.map(opt => {
                const parts = opt.split(':').map(s => s.trim());
                const val = parts[0];
                const label = parts.length > 1 ? `${val} (${parts[1]})` : val;
                return `<option value="${val}">${label}</option>`;
              }).join('')
            : `<option value="1">1 Photo (Free)</option><option value="2">2 Photos</option><option value="3">3 Photos</option>`}
        </select>
        <div id="photo-upload-fields"></div>
      </div>
      ${product.addons && product.addons.length > 0 ? `<div>${product.addonsHeadingText ? `<label style="color:${product.addonsHeadingColor || '#047857'};font-weight:700;display:block;margin-bottom:0.25rem;">${product.addonsHeadingText}</label>` : '<label>Add-ons</label>'}${product.addons.map((addon, idx) => {
        return `<label style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.5rem;"><span style="display:flex;align-items:center;gap:8px;"><input type="checkbox" class="addon-checkbox" data-addon-price="${parseFloat(addon.price).toFixed(2)}"> ${addon.name}</span><span>${parseFloat(addon.price) > 0 ? '+$' + parseFloat(addon.price).toFixed(2) : 'Free'}</span></label>`;
      }).join('')}</div>` : ''}
      <button class="checkout-btn" onclick="purchase()">Checkout <span id="final-price">$${product.price.toFixed(2)}</span></button>
    </div>
  </div>
</div>
<script>
let basePrice = ${product.price.toFixed(2)};
let deliveryCosts = ${deliveryCostsArray};
let deliveryNames = ${deliveryNamesArray};
function switchMedia(type,url){
  const main = document.getElementById('main-media');
  if(type === 'image'){
    main.innerHTML = '<img src="'+url+'" alt="Media" style="position:absolute;width:100%;height:100%;object-fit:cover;" />';
  } else {
    main.innerHTML = '<video controls src="'+url+'" style="position:absolute;width:100%;height:100%;object-fit:cover;"></video>';
  }
}
function updatePrice(){
  let total = basePrice;
  const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
  if(selectedDelivery){
    const idx = parseInt(selectedDelivery.value);
    total += parseFloat(deliveryCosts[idx]) || 0;
  }
  document.querySelectorAll('input[data-addon-price]')?.forEach(chk => {
    if(chk.checked){
      total += parseFloat(chk.getAttribute('data-addon-price')) || 0;
    }
  });
  document.getElementById('final-price').textContent = '$' + total.toFixed(2);
}
document.addEventListener('change', function(e){
  if(e.target && (e.target.name === 'delivery' || e.target.hasAttribute('data-addon-price'))){
    if(e.target.name === 'delivery'){
      const idx = parseInt(e.target.value);
      const name = deliveryNames[idx] || '';
      const cardTitleEl = document.querySelector('.delivery-card h4');
      const cardTimeEl = document.querySelector('.delivery-card span');
      if(cardTitleEl) cardTitleEl.textContent = name;
      if(cardTimeEl) {
        const m = name.match(/(\d+\s*(?:Minute|Minutes|Hour|Hours|Day|Days))/i);
        cardTimeEl.textContent = m ? m[1] : '';
      }
    }
    updatePrice();
  }
  if(e.target && e.target.id === 'choose-photo-count'){
    const count = parseInt(e.target.value) || 0;
    const container = document.getElementById('photo-upload-fields');
    if(container){
      container.innerHTML = '';
      for(let i=0; i<count; i++){
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.marginTop = '0.5rem';
        input.style.width = '100%';
        input.style.padding = '0.5rem';
        input.style.border = '1px solid #d1d5db';
        input.style.borderRadius = '8px';
        input.style.boxSizing = 'border-box';
        container.appendChild(input);
      }
    }
  }
});
function purchase(){
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if(!email || !message){
    alert('Please fill in all required fields.');
    return;
  }
  updatePrice();
  const deliveryEl = document.querySelector('input[name="delivery"]:checked');
  const deliveryIndex = deliveryEl ? parseInt(deliveryEl.value) : 0;
  const deliveryName = deliveryNames[deliveryIndex] || '';
  alert('Order placed. Delivery: ' + deliveryName + '. Total price: ' + document.getElementById('final-price').textContent);
}
updatePrice();
</script>
</body>
</html>`;
}
// Product definitions
const products = [
  {
    slug: 'demo-product-1',
    title: 'Special Birthday Video',
    price: 20,
    images: [
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Personalised birthday video for your special day.',
    tags: ['birthday','video'],
    formHeadingText: 'Start Customize Your Video',
    formHeadingColor: '#6366f1',
    addons: [ { name: 'Extra Feature', price: 5 }, { name: 'Premium Support', price: 10 } ],
    addonsHeadingText: 'Enhancements',
    addonsHeadingColor: '#047857',
    deliveryOptions: [
      { name: 'Instant Delivery in 60 Minutes', price: 15, default: true },
      { name: '1 Day delivery', price: 5, default: false },
      { name: 'Standard Delivery Free', price: 0, default: false }
    ],
    photoOptions: ['1:Free','2:$5','3:$10'],
    customForm: [
      { _type:'textField', label:'Recipient Name', placeholder:'Enter name', required:true },
      { _type:'textAreaField', label:'Personal Message', placeholder:'What shall we say', required:true },
      { _type:'selectField', label:'Theme', options:'Birthday, Anniversary', required:false },
      { _type:'checkboxField', label:'Agree to Terms', required:true }
    ]
  },
  {
    slug: 'demo-product-2',
    title: 'Greeting Card Video',
    price: 25,
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Create a personalised greeting video for any occasion.',
    tags: ['greeting','video'],
    formHeadingText: 'Customize Your Greeting',
    formHeadingColor: '#2563eb',
    addons: [ { name: 'Extra Song', price: 5 } ],
    addonsHeadingText: 'Extras',
    addonsHeadingColor: '#065f46',
    deliveryOptions: [
      { name: 'Same Day', price: 10, default: true },
      { name: '2 Days', price: 0, default: false }
    ],
    photoOptions: ['1:Free','3:$5'],
    customForm: [
      { _type:'textField', label:'Recipient Name', placeholder:'Enter name', required:true },
      { _type:'textField', label:'Age', placeholder:'Enter age', required:false },
      { _type:'selectField', label:'Color Theme', options:'Blue, Pink, Green', required:false }
    ]
  },
  {
    slug: 'demo-product-3',
    title: 'Personalized Video Message',
    price: 18,
    images: [
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Send a unique personalised video message.',
    tags: ['personal','video'],
    formHeadingText: 'Customize Your Message',
    formHeadingColor: '#8b5cf6',
    addons: [],
    addonsHeadingText: '',
    addonsHeadingColor: '',
    deliveryOptions: [
      { name: '24 Hours Express', price: 10, default: true },
      { name: '3 Days', price: 0, default: false }
    ],
    photoOptions: ['1','2','4'],
    customForm: [
      { _type:'textAreaField', label:'Message', placeholder:'Your message', required:true },
      { _type:'textField', label:'Favorite Quote', placeholder:'Optional', required:false }
    ]
  },
  {
    slug: 'demo-product-4',
    title: 'Love Video Tribute',
    price: 35,
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Create a romantic tribute for your loved one.',
    tags: ['love','video'],
    formHeadingText: 'Customize Your Love Video',
    formHeadingColor: '#be185d',
    addons: [ { name:'Heart Effect', price:7 }, { name:'Fireworks', price:5 } ],
    addonsHeadingText: 'Special Effects',
    addonsHeadingColor: '#dc2626',
    deliveryOptions: [
      { name:'2 Hours Express', price:20, default:true },
      { name:'4 Hours', price:10, default:false },
      { name:'Next Day', price:0, default:false }
    ],
    photoOptions: ['1:Free','2:$5'],
    customForm: [
      { _type:'textField', label:'Partner Name', placeholder:'Name', required:true },
      { _type:'selectField', label:'Occasion', options:'Anniversary, Valentine\'s Day, Proposal', required:false },
      { _type:'textAreaField', label:'Message', placeholder:'Your message', required:true }
    ]
  },
  {
    slug: 'demo-product-5',
    title: 'Birthday Song Video',
    price: 22,
    images: [
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Celebrate birthdays with a personalised song video.',
    tags: ['birthday','song','video'],
    formHeadingText: 'Customize Your Song Video',
    formHeadingColor: '#7c3aed',
    addons: [ { name:'Music Add-on', price:5 } ],
    addonsHeadingText: 'Music Add-ons',
    addonsHeadingColor: '#d97706',
    deliveryOptions: [
      { name:'Instant 30 Minutes', price:20, default:true },
      { name:'Same Day', price:5, default:false },
      { name:'2 Days', price:0, default:false }
    ],
    photoOptions: ['1:Free','2:$5','3:$10'],
    customForm: [
      { _type:'textField', label:'Name', placeholder:'Enter name', required:true },
      { _type:'selectField', label:'Song Choice', options:'Happy Birthday, Congratulations, Custom', required:true },
      { _type:'fileUploadField', label:'Upload Photo', required:true },
      { _type:'textAreaField', label:'Special Request', placeholder:'Any special request', required:false }
    ]
  },
  {
    slug: 'demo-product-6',
    title: 'Graduation Celebration Video',
    price: 28,
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Honor academic achievements with a special video.',
    tags: ['graduation','video'],
    formHeadingText: 'Celebrate Your Achievement',
    formHeadingColor: '#22c55e',
    addons: [ { name:'Cap & Gown', price:8 }, { name:'Fireworks', price:5 }, { name:'Certificate Frame', price:3 } ],
    addonsHeadingText: 'Graduation Extras',
    addonsHeadingColor: '#16a34a',
    deliveryOptions: [
      { name:'Instant 1 Hour', price:15, default:true },
      { name:'Next Day', price:5, default:false },
      { name:'5 Days', price:0, default:false }
    ],
    photoOptions: ['1:Free','2:$5','3:$8'],
    customForm: [
      { _type:'textField', label:'Graduate Name', placeholder:'Name', required:true },
      { _type:'textField', label:'University', placeholder:'University Name', required:false },
      { _type:'selectField', label:'Degree', options:'BSc, MSc, PhD', required:true },
      { _type:'textAreaField', label:'Personal Message', placeholder:'Write your message', required:false }
    ]
  },
  {
    slug: 'demo-product-7',
    title: 'Baby Shower Announcement Video',
    price: 24,
    images: [
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Celebrate your baby shower with a personalised announcement.',
    tags: ['baby','shower','video'],
    formHeadingText: 'Announce Your Baby',
    formHeadingColor: '#db2777',
    addons: [ { name:'Baby Name Reveal', price:6 } ],
    addonsHeadingText: 'Extras',
    addonsHeadingColor: '#ec4899',
    deliveryOptions: [
      { name:'Instant 2 Hours', price:12, default:true },
      { name:'1 Day', price:6, default:false },
      { name:'2 Days', price:3, default:false },
      { name:'Standard', price:0, default:false }
    ],
    photoOptions: ['1:Free','2:$4'],
    customForm: [
      { _type:'textField', label:'Parents Names', placeholder:'Names', required:true },
      { _type:'radioField', label:'Baby Gender', options:'Boy, Girl', required:true },
      { _type:'textField', label:'Due Date', placeholder:'MM/DD/YYYY', required:false }
    ]
  },
  {
    slug: 'demo-product-8',
    title: 'Retirement Tribute Video',
    price: 40,
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Celebrate a successful career with a special video tribute.',
    tags: ['retirement','video'],
    formHeadingText: 'Honor Your Service',
    formHeadingColor: '#d97706',
    addons: [ { name:'Highlight Reel', price:10 }, { name:'Guest Messages', price:8 } ],
    addonsHeadingText: 'Add-On Options',
    addonsHeadingColor: '#d97706',
    deliveryOptions: [
      { name:'Instant 24 Hours', price:12, default:true },
      { name:'3 Days', price:5, default:false },
      { name:'5 Days', price:0, default:false }
    ],
    photoOptions: ['1:Free','2:$5','5:$10'],
    customForm: [
      { _type:'textField', label:'Retiree Name', placeholder:'Name', required:true },
      { _type:'textField', label:'Years of Service', placeholder:'Years', required:false },
      { _type:'textAreaField', label:'Favorite Memories', placeholder:'Share memories', required:false }
    ]
  },
  {
    slug: 'demo-product-9',
    title: 'Engagement Announcement Video',
    price: 32,
    images: [
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Announce your engagement with a personalised video.',
    tags: ['engagement','video'],
    formHeadingText: 'Share Your Love Story',
    formHeadingColor: '#eab308',
    addons: [ { name:'Ring Close-up', price:6 }, { name:'Love Story', price:8 } ],
    addonsHeadingText: 'Engagement Add-ons',
    addonsHeadingColor: '#eab308',
    deliveryOptions: [
      { name:'Instant 2 Hours', price:15, default:true },
      { name:'6 Hours', price:8, default:false },
      { name:'12 Hours', price:5, default:false },
      { name:'2 Days', price:0, default:false }
    ],
    photoOptions: ['1:Free','3:$5','5:$10'],
    customForm: [
      { _type:'textField', label:'Couple Names', placeholder:'Names', required:true },
      { _type:'textField', label:'Date of Event', placeholder:'MM/DD/YYYY', required:true },
      { _type:'textAreaField', label:'Message for Couple', placeholder:'Write your message', required:true }
    ]
  },
  {
    slug: 'demo-product-10',
    title: 'Corporate Promo Video',
    price: 50,
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      'https://res.cloudinary.com/demo/image/upload/kitten.jpg'
    ],
    videos: ['https://res.cloudinary.com/demo/video/upload/dog.mp4'],
    description: 'Promote your company with a custom promotional video.',
    tags: ['corporate','promo','video'],
    formHeadingText: 'Craft Your Promo',
    formHeadingColor: '#0ea5e9',
    addons: [ { name:'Logo Animation', price:8 }, { name:'Custom Script', price:12 }, { name:'Voice Over', price:7 } ],
    addonsHeadingText: 'Professional Add-ons',
    addonsHeadingColor: '#0ea5e9',
    deliveryOptions: [
      { name:'48 Hours Express', price:25, default:true },
      { name:'72 Hours', price:15, default:false },
      { name:'1 Week', price:0, default:false }
    ],
    photoOptions: ['1:Free','2:$5','4:$8'],
    customForm: [
      { _type:'textField', label:'Company Name', placeholder:'Enter company name', required:true },
      { _type:'textField', label:'Tagline', placeholder:'Enter tagline', required:false },
      { _type:'selectField', label:'Preferred Colors', options:'Blue, Green, Red, Orange', required:false },
      { _type:'textAreaField', label:'Additional Instructions', placeholder:'Describe your requirements', required:false }
    ]
  }
];
// write products.json
fs.writeFileSync('json/products.json', JSON.stringify(products, null, 2));
// ensure products dir exists
if (!fs.existsSync('products')) fs.mkdirSync('products');
products.forEach(prod => {
  const html = generateProductHTML(prod);
  fs.writeFileSync(`products/${prod.slug}.html`, html);
});
console.log('Generated', products.length, 'pages.');
