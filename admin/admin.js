// Toggle between sections when clicking nav buttons
document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-section');
    document.querySelectorAll('.form-section').forEach(section => {
      section.style.display = section.id === target ? 'block' : 'none';
    });
  });
});

// Replace with your actual Cloudflare Worker URL
const WORKER_URL = 'https://your-worker-url/api/publish';

// --- Custom Form Builder Logic ---
const customFields = [];


// --- Custom form field rendering & editing state ---
let editingFieldIndex = null;
let fieldTypeSelectEl;
let fieldOptionsInputEl;
let fieldPricesInputEl;
let fieldColorInputEl;
let fieldLabelInputEl;
let fieldPlaceholderInputEl;
let fieldRequiredCheckboxEl;
let addFieldBtnEl;
let optionsBuilderEl;
let optionsTableBodyEl;
let addOptionRowBtnEl;
let populateFieldEditor = null;

function renderFields() {
  const list = document.getElementById('fields-list');
  if (!list) return;
  list.innerHTML = '';
  customFields.forEach((field, idx) => {
    const li = document.createElement('li');
    li.textContent = `${field.label} (${field._type})`;
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.onclick = (ev) => {
      ev.stopPropagation();
      customFields.splice(idx, 1);
      // if we were editing this field, reset editor state
      if (editingFieldIndex === idx) {
        editingFieldIndex = null;
        if (addFieldBtnEl) addFieldBtnEl.textContent = 'Add Field';
        if (fieldLabelInputEl) fieldLabelInputEl.value = '';
        if (fieldPlaceholderInputEl) fieldPlaceholderInputEl.value = '';
        if (fieldOptionsInputEl) fieldOptionsInputEl.value = '';
        if (fieldPricesInputEl) fieldPricesInputEl.value = '';
        if (fieldRequiredCheckboxEl) fieldRequiredCheckboxEl.checked = false;
        clearOptionsBuilder();
        if (optionsBuilderEl) {
          optionsBuilderEl.style.display = 'none';
        }
      }
      renderFields();
    };
    li.appendChild(btn);
    // clicking on the list item loads it into the editor for editing
    li.addEventListener('click', () => {
      if (populateFieldEditor) {
        populateFieldEditor(field, idx);
      }
    });
    list.appendChild(li);
  });
}



function clearOptionsBuilder() {
  if (optionsTableBodyEl) {
    optionsTableBodyEl.innerHTML = '';
  }
}

function addOptionRow(name = '', price = '', isDefault = false) {
  if (!optionsTableBodyEl) return;
  const tr = document.createElement('tr');
  const tdLabel = document.createElement('td');
  const tdPrice = document.createElement('td');
  const tdDefault = document.createElement('td');
  const tdAction = document.createElement('td');

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'option-name';
  nameInput.value = name;
  nameInput.addEventListener('input', syncBuilderToHiddenInputs);
  tdLabel.appendChild(nameInput);

  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.step = '0.01';
  priceInput.className = 'option-price';
  priceInput.value = price;
  priceInput.addEventListener('input', syncBuilderToHiddenInputs);
  tdPrice.appendChild(priceInput);

  const defaultInput = document.createElement('input');
  defaultInput.type = 'radio';
  defaultInput.name = 'option-default';
  defaultInput.className = 'option-default';
  defaultInput.checked = !!isDefault;
  defaultInput.addEventListener('change', syncBuilderToHiddenInputs);
  tdDefault.style.textAlign = 'center';
  tdDefault.appendChild(defaultInput);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '✕';
  removeBtn.className = 'remove-option';
  removeBtn.addEventListener('click', () => {
    tr.remove();
    syncBuilderToHiddenInputs();
  });
  tdAction.appendChild(removeBtn);

  tr.appendChild(tdLabel);
  tr.appendChild(tdPrice);
  tr.appendChild(tdDefault);
  tr.appendChild(tdAction);

  optionsTableBodyEl.appendChild(tr);
}

function syncBuilderToHiddenInputs() {
  if (!fieldOptionsInputEl || !fieldPricesInputEl || !fieldTypeSelectEl) return;
  const type = fieldTypeSelectEl.value;
  if (!type) {
    fieldOptionsInputEl.value = '';
    fieldPricesInputEl.value = '';
    return;
  }
  const rows = [];
  if (optionsTableBodyEl) {
    const trs = optionsTableBodyEl.querySelectorAll('tr');
    trs.forEach(tr => {
      const nameInput = tr.querySelector('.option-name');
      const priceInput = tr.querySelector('.option-price');
      const defaultInput = tr.querySelector('.option-default');
      const name = nameInput ? nameInput.value.trim() : '';
      const price = priceInput ? priceInput.value.trim() : '';
      const isDefault = defaultInput ? defaultInput.checked : false;
      if (name) {
        rows.push({ name, price, isDefault });
      }
    });
  }
  if (!rows.length) {
    fieldOptionsInputEl.value = '';
    fieldPricesInputEl.value = '';
    return;
  }
  // ensure default row is first for radio groups
  if (type === 'radioGroupField') {
    const defIndex = rows.findIndex(r => r.isDefault);
    if (defIndex > 0) {
      const defRow = rows.splice(defIndex, 1)[0];
      rows.unshift(defRow);
    }
  }
  const names = rows.map(r => r.name);
  const prices = rows.map(r => r.price || '');
  if (type === 'selectField' || type === 'radioField') {
    fieldOptionsInputEl.value = names.join(', ');
    fieldPricesInputEl.value = '';
  } else if (
    type === 'checkboxGroupField' ||
    type === 'radioGroupField' ||
    type === 'photoSelectField'
  ) {
    fieldOptionsInputEl.value = names.join(', ');
    fieldPricesInputEl.value = prices.join(', ');
  } else {
    fieldOptionsInputEl.value = '';
    fieldPricesInputEl.value = '';
  }
}

function syncHiddenInputsToBuilder(fieldType) {
  if (!optionsTableBodyEl || !fieldOptionsInputEl || !fieldPricesInputEl) return;
  clearOptionsBuilder();
  const options = fieldOptionsInputEl.value.trim();
  const prices = fieldPricesInputEl.value.trim();
  if (!fieldType || !options) return;

  const names = options.split(',').map(o => o.trim()).filter(Boolean);
  const priceList = prices ? prices.split(',').map(p => p.trim()) : [];

  if (fieldType === 'selectField' || fieldType === 'radioField') {
    names.forEach((nm, idx) => {
      addOptionRow(nm, '', idx === 0);
    });
  } else if (
    fieldType === 'checkboxGroupField' ||
    fieldType === 'photoSelectField' ||
    fieldType === 'radioGroupField'
  ) {
    names.forEach((nm, idx) => {
      const pr = priceList[idx] || '';
      addOptionRow(nm, pr, idx === 0);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // hook DOM elements into shared editor refs
  fieldTypeSelectEl = document.getElementById('field-type');
  fieldOptionsInputEl = document.getElementById('field-options');
  fieldPricesInputEl = document.getElementById('field-prices');
  fieldColorInputEl = document.getElementById('field-color');
  fieldLabelInputEl = document.getElementById('field-label');
  fieldPlaceholderInputEl = document.getElementById('field-placeholder');
  fieldRequiredCheckboxEl = document.getElementById('field-required');
  addFieldBtnEl = document.getElementById('add-field-btn');
  optionsBuilderEl = document.getElementById('options-builder');
  optionsTableBodyEl = document.getElementById('options-table-body');
  addOptionRowBtnEl = document.getElementById('add-option-row');

  if (addOptionRowBtnEl && optionsTableBodyEl) {
    addOptionRowBtnEl.addEventListener('click', () => {
      addOptionRow();
      syncBuilderToHiddenInputs();
    });
  }

  if (fieldTypeSelectEl) {
    fieldTypeSelectEl.addEventListener('change', () => {
      const val = fieldTypeSelectEl.value;
      // show options input using dynamic options builder
      if (
        val === 'selectField' ||
        val === 'radioField' ||
        val === 'checkboxGroupField' ||
        val === 'radioGroupField' ||
        val === 'photoSelectField'
      ) {
        if (optionsBuilderEl) {
          optionsBuilderEl.style.display = 'block';
          if (optionsTableBodyEl && !optionsTableBodyEl.querySelector('tr')) {
            addOptionRow();
          }
        }
      } else {
        if (optionsBuilderEl) {
          optionsBuilderEl.style.display = 'none';
        }
        if (optionsTableBodyEl) {
          clearOptionsBuilder();
        }
        if (fieldOptionsInputEl) fieldOptionsInputEl.value = '';
        if (fieldPricesInputEl) fieldPricesInputEl.value = '';
      }
      // keep text/price inputs hidden but in sync
      if (fieldOptionsInputEl) fieldOptionsInputEl.style.display = 'none';
      if (fieldPricesInputEl) fieldPricesInputEl.style.display = 'none';

      // show color input for heading field
      if (val === 'headingField') {
        if (fieldColorInputEl) fieldColorInputEl.style.display = 'block';
      } else if (fieldColorInputEl) {
        fieldColorInputEl.style.display = 'none';
      }

      // update hidden inputs based on current builder state
      syncBuilderToHiddenInputs();
    });
    // initialise visibility
    fieldTypeSelectEl.dispatchEvent(new Event('change'));
  }

  // function to load an existing field into the editor controls
  populateFieldEditor = function(field, index) {
    editingFieldIndex = index;
    if (!fieldTypeSelectEl) return;
    fieldTypeSelectEl.value = field._type || '';
    fieldTypeSelectEl.dispatchEvent(new Event('change'));
    if (fieldLabelInputEl) fieldLabelInputEl.value = field.label || '';
    if (fieldPlaceholderInputEl) fieldPlaceholderInputEl.value = field.placeholder || '';
    if (fieldRequiredCheckboxEl) fieldRequiredCheckboxEl.checked = !!field.required;

    let optionsStr = '';
    let pricesStr = '';

    if (field.options) {
      if (field._type === 'checkboxGroupField' || field._type === 'photoSelectField') {
        const opts = field.options.split(',').map(o => o.trim()).filter(Boolean);
        const names = [];
        const prices = [];
        opts.forEach(opt => {
          const parts = opt.split(':').map(s => s.trim());
          names.push(parts[0] || '');
          prices.push(parts[1] || '');
        });
        optionsStr = names.join(', ');
        if (prices.some(p => p)) {
          pricesStr = prices.join(', ');
        }
      } else if (field._type === 'radioGroupField') {
        const opts = field.options.split(',').map(o => o.trim()).filter(Boolean);
        const names = [];
        const prices = [];
        opts.forEach(opt => {
          const parts = opt.split(':').map(s => s.trim());
          names.push(parts[0] || '');
          prices.push(parts[1] || '');
        });
        optionsStr = names.join(', ');
        pricesStr = prices.join(', ');
      } else if (
        field._type === 'selectField' ||
        field._type === 'radioField'
      ) {
        optionsStr = field.options;
      }
    }

    if (fieldOptionsInputEl) fieldOptionsInputEl.value = optionsStr;
    if (fieldPricesInputEl) fieldPricesInputEl.value = pricesStr;

    if (field._type === 'selectField' ||
        field._type === 'radioField' ||
        field._type === 'checkboxGroupField' ||
        field._type === 'radioGroupField' ||
        field._type === 'photoSelectField') {
      syncHiddenInputsToBuilder(field._type);
      if (optionsBuilderEl) {
        optionsBuilderEl.style.display = 'block';
      }
    } else {
      clearOptionsBuilder();
      if (optionsBuilderEl) {
        optionsBuilderEl.style.display = 'none';
      }
    }

    if (field._type === 'headingField' && fieldColorInputEl) {
      fieldColorInputEl.style.display = 'block';
      fieldColorInputEl.value = field.color || '#6366f1';
    }

    if (addFieldBtnEl) addFieldBtnEl.textContent = 'Update Field';
  };

  if (addFieldBtnEl) {
    addFieldBtnEl.addEventListener('click', () => {
      if (!fieldTypeSelectEl || !fieldLabelInputEl) return;
      const type = fieldTypeSelectEl.value;
      const label = fieldLabelInputEl.value.trim();
      const placeholder = fieldPlaceholderInputEl ? fieldPlaceholderInputEl.value.trim() : '';
      const required = fieldRequiredCheckboxEl ? fieldRequiredCheckboxEl.checked : false;
      const options = fieldOptionsInputEl ? fieldOptionsInputEl.value.trim() : '';
      const prices = fieldPricesInputEl ? fieldPricesInputEl.value.trim() : '';
      const color = fieldColorInputEl ? fieldColorInputEl.value : '#6366f1';

      if (!type || !label) return;

      const field = { _type: type, label, placeholder, required };

      // base options assignment
      if (
        type === 'selectField' ||
        type === 'radioField'
      ) {
        if (options) field.options = options;
      }

      // Build combined options with prices for checkbox/photo groups
      if (type === 'checkboxGroupField' || type === 'photoSelectField') {
        if (options) {
          const names = options.split(',').map(o => o.trim()).filter(Boolean);
          const priceList = prices ? prices.split(',').map(p => p.trim()) : [];
          const combined = names.map((nm, i) => {
            const pr = priceList[i] ? priceList[i] : '';
            return pr ? `${nm}:${pr}` : nm;
          }).join(', ');
          field.options = combined;
        }
      }

      // Build combined options with prices and default for radio groups
      if (type === 'radioGroupField') {
        if (options) {
          const names = options.split(',').map(o => o.trim()).filter(Boolean);
          const priceList = prices ? prices.split(',').map(p => p.trim()) : [];
          const combined = names.map((nm, i) => {
            const pr = priceList[i] ? priceList[i] : '';
            const def = i === 0 ? 'true' : 'false';
            return pr ? `${nm}:${pr}:${def}` : `${nm}:0:${def}`;
          }).join(', ');
          field.options = combined;
        }
      }

      // assign color for heading field
      if (type === 'headingField') {
        field.color = color;
      }

      // if editing, update existing; else add new
      if (editingFieldIndex !== null) {
        customFields[editingFieldIndex] = field;
      } else {
        customFields.push(field);
      }

      // reset editing state and form inputs
      editingFieldIndex = null;
      if (addFieldBtnEl) addFieldBtnEl.textContent = 'Add Field';
      if (fieldLabelInputEl) fieldLabelInputEl.value = '';
      if (fieldPlaceholderInputEl) fieldPlaceholderInputEl.value = '';
      if (fieldOptionsInputEl) fieldOptionsInputEl.value = '';
      if (fieldPricesInputEl) fieldPricesInputEl.value = '';
      if (fieldRequiredCheckboxEl) fieldRequiredCheckboxEl.checked = false;
      if (fieldColorInputEl) fieldColorInputEl.value = '#6366f1';
      clearOptionsBuilder();
      if (optionsBuilderEl) {
        optionsBuilderEl.style.display = 'none';
      }

      renderFields();
    });
  }
});
// ---------- Product Listing & Editing ----------
let productsData = [];
let currentProductPage = 0;
const productsPerPage = 20;
let editingProductIndex = null;

// Orders listing
let ordersData = [];
let currentOrderPage = 0;
const ordersPerPage = 20;
let editingOrderIndex = null;

async function loadOrders() {
  try {
    const embedded = document.getElementById('orders-json');
    if (embedded && embedded.textContent && embedded.textContent.trim().length > 0) {
      ordersData = JSON.parse(embedded.textContent.trim());
      currentOrderPage = 0;
      renderOrderList();
      return;
    }
    const res = await fetch('../json/orders.json');
    if (!res.ok) return;
    ordersData = await res.json();
    currentOrderPage = 0;
    renderOrderList();
  } catch (err) {
    console.error('Failed to load orders', err);
  }
}

function renderOrderList() {
  const tbody = document.querySelector('#order-list tbody');
  const prevBtn = document.getElementById('prev-order-page');
  const nextBtn = document.getElementById('next-order-page');
  const info = document.getElementById('order-page-info');
  if (!tbody) return;
  tbody.innerHTML = '';
  const start = currentOrderPage * ordersPerPage;
  const end = start + ordersPerPage;
  const pageItems = ordersData.slice(start, end);
  pageItems.forEach((order, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${order.order_id || ''}</td>
      <td>${order.email || ''}</td>
      <td>${order.product || ''}</td>
      <td>${order.status || ''}</td>
      <td><button type="button" class="edit-order-btn" data-index="${start + idx}">Edit</button></td>
    `;
    tbody.appendChild(tr);
  });
  prevBtn.disabled = currentOrderPage === 0;
  nextBtn.disabled = end >= ordersData.length;
  info.textContent = ordersData.length ? `Page ${currentOrderPage + 1} of ${Math.ceil(ordersData.length / ordersPerPage)}` : '';
}

function populateOrderForm(order) {
  const form = document.getElementById('order-form');
  if (!form) return;
  form.order_id.value = order.order_id || '';
  form.buyer_email.value = order.email || '';
  form.product_slug.value = order.product || '';
  form.delivery_link.value = order.delivery || '';
  form.status.value = order.status || 'pending';
}

// handle order edit button
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('edit-order-btn')) {
    const idx = parseInt(e.target.getAttribute('data-index'));
    if (!isNaN(idx) && ordersData[idx]) {
      editingOrderIndex = idx;
      populateOrderForm(ordersData[idx]);
      document.querySelectorAll('.form-section').forEach(sec => sec.style.display = 'none');
      document.getElementById('order-section').style.display = 'block';
    }
  }
});

// order pagination
document.getElementById('prev-order-page').addEventListener('click', () => {
  if (currentOrderPage > 0) {
    currentOrderPage--;
    renderOrderList();
  }
});
document.getElementById('next-order-page').addEventListener('click', () => {
  const maxPage = Math.ceil(ordersData.length / ordersPerPage) - 1;
  if (currentOrderPage < maxPage) {
    currentOrderPage++;
    renderOrderList();
  }
});

async function loadProducts() {
  try {
    // First try to parse embedded JSON if present (for file:// protocol)
    const embedded = document.getElementById('products-json');
    if (embedded && embedded.textContent && embedded.textContent.trim().length > 0) {
      productsData = JSON.parse(embedded.textContent.trim());
      currentProductPage = 0;
      renderProductList();
      return;
    }
    // Fallback: fetch from json file via relative path (works when served via http)
    const res = await fetch('../json/products.json');
    if (!res.ok) return;
    productsData = await res.json();
    currentProductPage = 0;
    renderProductList();
  } catch (err) {
    console.error('Failed to load products', err);
  }
}

function renderProductList() {
  const tbody = document.querySelector('#product-list tbody');
  const prevBtn = document.getElementById('prev-product-page');
  const nextBtn = document.getElementById('next-product-page');
  const info = document.getElementById('product-page-info');
  if (!tbody) return;
  tbody.innerHTML = '';
  const start = currentProductPage * productsPerPage;
  const end = start + productsPerPage;
  const pageItems = productsData.slice(start, end);
  pageItems.forEach((prod, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.title || ''}</td>
      <td>${prod.slug || ''}</td>
      <td>$${parseFloat(prod.price || 0).toFixed(2)}</td>
      <td><button type="button" class="edit-product-btn" data-index="${start + idx}">Edit</button></td>
    `;
    tbody.appendChild(tr);
  });
  // update pagination buttons
  prevBtn.disabled = currentProductPage === 0;
  nextBtn.disabled = end >= productsData.length;
  info.textContent = productsData.length ? `Page ${currentProductPage + 1} of ${Math.ceil(productsData.length / productsPerPage)}` : '';
}

function populateProductForm(prod) {
  const form = document.getElementById('product-form');
  if (!form) return;
  form.title.value = prod.title || '';
  form.slug.value = prod.slug || '';
  form.description.value = prod.description || '';
  form.images.value = prod.images ? prod.images.join(', ') : '';
  form.videos.value = prod.videos ? prod.videos.join(', ') : '';
  form.price.value = prod.price || '';
  form.tags.value = prod.tags ? prod.tags.join(', ') : '';
  form['seo-title'].value = prod.seoTitle || '';
  form['seo-description'].value = prod.seoDescription || '';
  // Clear current builder fields
  customFields.length = 0;
  // Convert product properties back into custom fields for editing
  // Heading field (form heading)
  if (prod.formHeadingText) {
    customFields.push({ _type: 'headingField', label: prod.formHeadingText, color: prod.formHeadingColor || '#6366f1' });
  }
  // Checkbox group for addons
  if (prod.addons && prod.addons.length) {
    const opts = prod.addons.map(a => `${a.name}:${a.price}`).join(', ');
    customFields.push({ _type: 'checkboxGroupField', label: prod.addonsHeadingText || 'Add-ons', options: opts });
  }
  // Radio group for delivery options
  if (prod.deliveryOptions && prod.deliveryOptions.length) {
    const opts = prod.deliveryOptions.map(opt => `${opt.name}:${opt.price}:${opt.default ? 'true' : 'false'}`).join(', ');
    customFields.push({ _type: 'radioGroupField', label: 'Delivery Speed', options: opts });
  }
  // Photo dropdown
  if (prod.photoOptions && prod.photoOptions.length) {
    const opts = prod.photoOptions.join(', ');
    customFields.push({ _type: 'photoSelectField', label: 'Choose Photo', options: opts });
  }
  // Other custom form fields
  if (prod.customForm && prod.customForm.length) {
    prod.customForm.forEach(f => {
      const cf = { _type: f._type, label: f.label, placeholder: f.placeholder, required: f.required };
      if (f.options) cf.options = f.options;
      if (f.color) cf.color = f.color;
      customFields.push(cf);
    });
  }
  renderFields();
}

// handle edit buttons click
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('edit-product-btn')) {
    const idx = parseInt(e.target.getAttribute('data-index'));
    if (!isNaN(idx) && productsData[idx]) {
      editingProductIndex = idx;
      populateProductForm(productsData[idx]);
      // Switch to product section if not visible
      document.querySelectorAll('.form-section').forEach(sec => sec.style.display = 'none');
      document.getElementById('product-section').style.display = 'block';
    }
  }
});

// pagination controls
document.getElementById('prev-product-page').addEventListener('click', () => {
  if (currentProductPage > 0) {
    currentProductPage--;
    renderProductList();
  }
});
document.getElementById('next-product-page').addEventListener('click', () => {
  const maxPage = Math.ceil(productsData.length / productsPerPage) - 1;
  if (currentProductPage < maxPage) {
    currentProductPage++;
    renderProductList();
  }
});

// load products on DOM ready
// When the document is ready, load products and orders
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadOrders();
});

// Handle product form submission
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
    // Build base data object and derive additional properties from custom form fields
    const data = {
      title: form.title.value.trim(),
      slug: form.slug.value.trim(),
      description: form.description.value.trim(),
      images: form.images.value.trim() ? form.images.value.trim().split(',').map(s => s.trim()) : [],
      videos: form.videos.value.trim() ? form.videos.value.trim().split(',').map(s => s.trim()) : [],
      price: parseFloat(form.price.value),
      tags: form.tags.value.trim() ? form.tags.value.trim().split(',').map(s => s.trim()) : [],
      seoTitle: form['seo-title'].value.trim(),
      seoDescription: form['seo-description'].value.trim(),
      addons: [],
      deliveryOptions: [],
      formHeadingText: '',
      formHeadingColor: '',
      addonsHeadingText: '',
      addonsHeadingColor: '',
      customForm: [],
      photoOptions: []
    };
    // Process custom fields and assign to data accordingly
    const remainingCustom = [];
    customFields.forEach(f => {
      switch (f._type) {
        case 'headingField':
          data.formHeadingText = f.label;
          data.formHeadingColor = f.color || '#6366f1';
          break;
        case 'checkboxGroupField': {
          if (f.options) {
            const opts = f.options.split(',').map(o => o.trim()).filter(Boolean);
            opts.forEach(opt => {
              const parts = opt.split(':').map(s => s.trim());
              const name = parts[0] || '';
              const price = parseFloat(parts[1] || 0);
              data.addons.push({ name, price });
            });
          }
          data.addonsHeadingText = f.label;
          data.addonsHeadingColor = '#047857';
          break;
        }
        case 'radioGroupField': {
          if (f.options) {
            const opts = f.options.split(',').map(o => o.trim()).filter(Boolean);
            opts.forEach(opt => {
              const parts = opt.split(':').map(s => s.trim());
              const name = parts[0] || '';
              const price = parseFloat(parts[1] || 0);
              let def = false;
              if (parts.length > 2) {
                const d = parts[2].toLowerCase();
                def = d === 'true' || d === 'default' || d === 'yes' || d === '1';
              }
              data.deliveryOptions.push({ name, price, default: def });
            });
          }
          break;
        }
        case 'photoSelectField': {
          // Photo dropdown: options are numbers or values indicating photo count
          if (f.options) {
            const opts = f.options.split(',').map(o => o.trim()).filter(Boolean);
            data.photoOptions = opts;
          }
          break;
        }
        default: {
          const cf = { _type: f._type, label: f.label, placeholder: f.placeholder, required: f.required };
          if (f.options) cf.options = f.options;
          if (f.color) cf.color = f.color;
          remainingCustom.push(cf);
          break;
        }
      }
    });
    data.customForm = remainingCustom;
  const html = generateProductHTML(data);
  await sendData('product', data.slug, data, html);
  // Determine if we were editing before resetting
  const wasEditing = editingProductIndex !== null;
  if (wasEditing) {
    productsData[editingProductIndex] = data;
  } else {
    productsData.push(data);
  }
  editingProductIndex = null;
  renderProductList();
  alert('Product saved successfully.');
  form.reset();
  // Clear custom fields for new entry
  customFields.length = 0;
  renderFields();
});

// Handle landing form submission
document.getElementById('landing-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    title: form.title.value.trim(),
    slug: form.slug.value.trim(),
    hero: form.hero.value.trim(),
    body: form.body.value.trim(),
    seoTitle: form['seo-title'].value.trim(),
    seoDescription: form['seo-description'].value.trim()
  };
  const html = generateLandingHTML(data);
  await sendData('landing', data.slug, data, html);
  alert('Landing page saved successfully.');
  form.reset();
});

// Handle order form submission
document.getElementById('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    order_id: form.order_id.value.trim(),
    email: form.buyer_email.value.trim(),
    product: form.product_slug.value.trim(),
    delivery: form.delivery_link.value.trim(),
    status: form.status.value.trim()
  };
  await sendData('order', data.order_id, data, '');
  // update local list if editing
  if (editingOrderIndex !== null) {
    ordersData[editingOrderIndex] = data;
    editingOrderIndex = null;
    renderOrderList();
  }
  alert('Order saved successfully.');
  form.reset();
});

async function sendData(type, slug, data, html) {
  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, slug, data, html })
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(text);
      alert('Error: ' + res.status);
    }
  } catch (error) {
    console.error(error);
    alert('Error saving data');
  }
}

function generateProductHTML(product) {
  // Build custom form fields HTML
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

  // Generate thumbnails HTML from images
  const thumbnailsHtml = product.images && product.images.length > 0 ? product.images.map((img, idx) => {
    return `<img src="${img}" onclick="switchMedia('image','${img}')">`;
  }).join('') : '';

  // Determine main media: prefer first video, else first image
  const hasVideo = product.videos && product.videos.length > 0;
  const mainMediaHtml = hasVideo
    ? `<video controls src="${product.videos[0]}" poster="${product.images[0] || ''}"></video>`
    : `<img src="${product.images[0] || ''}" alt="${product.title}" />`;

  // Prepare delivery cost and name arrays as strings for embedding into script
  const hasDeliveryOptions = product.deliveryOptions && product.deliveryOptions.length > 0;
  const deliveryCostsArray = hasDeliveryOptions
    ? '[' + product.deliveryOptions.map(opt => (parseFloat(opt.price) || 0).toFixed(2)).join(',') + ']'
    : '[15,5,0]';
  const deliveryNamesArray = hasDeliveryOptions
    ? '[' + product.deliveryOptions.map(opt => '`' + opt.name.replace(/`/g, '\\`') + '`').join(',') + ']'
    : "['Instant Delivery in 60 Minutes','1 Day delivery','Standard Delivery Free']";

  // Determine default delivery for card display
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
/* Layout and colors inspired by WishVideo */
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
.form-section input[type="text"], .form-section input[type="email"], .form-section input[type="number"], .form-section textarea, .form-section select {
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
.addons-list .addon-row { display:flex; gap:8px; margin-bottom:0.5rem; }
.addons-list input { flex:1; padding:0.5rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem; }
.addons-list button { padding:0.5rem 0.75rem; background:#047857; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:0.9rem; }
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
                // if option includes price (e.g., "2:$5"), separate value and label
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
// Base price and arrays for dynamic calculation
let basePrice = ${product.price.toFixed(2)};
// Delivery cost and names arrays computed at template generation time
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
  // Add delivery cost
  const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
  if(selectedDelivery){
    const idx = parseInt(selectedDelivery.value);
    total += parseFloat(deliveryCosts[idx]) || 0;
  }
  // Add addon costs
  document.querySelectorAll('input[data-addon-price]')?.forEach(chk => {
    if(chk.checked){
      total += parseFloat(chk.getAttribute('data-addon-price')) || 0;
    }
  });
  document.getElementById('final-price').textContent = '$' + total.toFixed(2);
}
// Attach change events for delivery and addons
document.addEventListener('change', function(e){
  if(e.target && (e.target.name === 'delivery' || e.target.hasAttribute('data-addon-price'))){
    if(e.target.name === 'delivery'){
      // update delivery card title/time on change
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

  // Handle choose-photo-count change to create file upload inputs
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
// Initialize price on load
updatePrice();
</script>
</body>
</html>`;
}

function generateLandingHTML(page) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${page.title}</title>
  <meta name="description" content="${page.seoDescription || ''}">
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <header>
    <h1>${page.title}</h1>
  </header>
  <main>
    <section class="hero" style="background-image:url('${page.hero}');background-size:cover;padding:4rem 2rem;color:#fff;text-align:center;">
      <h2>${page.title}</h2>
    </section>
    <section class="content" style="padding:1rem;">
      ${page.body}
    </section>
  </main>
  <footer>
    <p>&copy; 2025 Static Store</p>
  </footer>
</body>
</html>`;
}