/**
 * Professional Form Builder (Globo Style 2025)
 * Features: Groups, Options with Price, File Upload & Text Logic per Option
 */

export function renderCustomFields(data = {}) {
    const customForm = data.customForm || [];

    return `
        <div class="form-group">
            <label style="font-size:1.1rem; color:#2c3e50; margin-bottom:15px; display:block;">
                <i class="fas fa-layer-group"></i> Advanced Field Editor
            </label>

            <!-- Toolbar -->
            <div class="toolbar" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; padding:10px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:8px;">
                <button type="button" class="btn-tool" data-type="header"><i class="fas fa-heading"></i> Heading</button>
                <button type="button" class="btn-tool" data-type="text"><i class="fas fa-font"></i> Text</button>
                <button type="button" class="btn-tool" data-type="email"><i class="fas fa-envelope"></i> Email</button>
                <button type="button" class="btn-tool" data-type="select"><i class="fas fa-list-ul"></i> Dropdown</button>
                <button type="button" class="btn-tool" data-type="radio"><i class="fas fa-dot-circle"></i> Radio</button>
                <button type="button" class="btn-tool" data-type="checkbox_group"><i class="fas fa-check-square"></i> Checkboxes</button>
                <button type="button" class="btn-tool" data-type="file"><i class="fas fa-upload"></i> File Upload</button>
            </div>

            <div id="builder-area" style="display:flex; flex-direction:column; gap:10px;">
                ${customForm.map((f, i) => renderFieldCard(f, i)).join('')}
            </div>
            ${customForm.length === 0 ? '<p id="empty-msg" style="text-align:center; color:#999; margin-top:20px;">Select a tool above to start building.</p>' : ''}
        </div>
        <style>
            .btn-tool { background:white; border:1px solid #ced4da; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.85rem; transition:0.2s; }
            .btn-tool:hover { background:#e2e6ea; border-color:#adb5bd; transform:translateY(-1px); }
            
            .field-card { background:white; border:1px solid #dfe6e9; padding:15px; border-radius:6px; position:relative; animation:fadeIn 0.2s; border-left:4px solid transparent; }
            .field-card.type-header { background:#f1f2f6; border-left-color:#2d3436; }
            .field-card:hover { box-shadow:0 2px 8px rgba(0,0,0,0.05); }
            
            /* Logic Config Styling */
            .logic-config { display:flex; align-items:center; gap:5px; background:#f1f2f6; padding:0 8px; border-radius:4px; border:1px solid #dcdde1; height:34px; transition:0.2s; font-size:0.75rem; }
            .logic-config:hover { border-color:#b2bec3; }
            .logic-config.active { background:#e3f2fd; border-color:#2196f3; }
            .logic-config.active-text { background:#e8f5e9; border-color:#4caf50; }
            
            .logic-config label { font-weight:bold; color:#636e72; cursor:pointer; display:flex; align-items:center; gap:4px; margin:0; white-space:nowrap; }
            .logic-input { font-size:0.75rem; padding:2px 5px; height:24px; border:1px solid #bdc3c7; border-radius:3px; }
            
            @keyframes fadeIn { from{opacity:0; transform:translateY(5px);} to{opacity:1; transform:translateY(0);} }
        </style>
    `;
}

function renderFieldCard(field = {}, index = Date.now()) {
    const type = field._type || 'text';
    const isOptionType = ['select', 'radio', 'checkbox_group'].includes(type);
    const isHeader = type === 'header';

    // Options HTML generator
    let optionsHtml = '';
    if (isOptionType) {
        const opts = field.options_list || [];
        const rows = opts.map(o => {
            const hasFile = o.file_qty && o.file_qty > 0;
            const hasText = !!o.text_label; // Check if text label exists
            
            // Logic: Show Toggles ONLY for Dropdown (select)
            // 1. File Upload Logic
            const fileLogicUI = type === 'select' ? `
                <div class="logic-config ${hasFile ? 'active' : ''}" title="Require File Upload?">
                    <label>
                        <input type="checkbox" class="file-req-toggle" ${hasFile ? 'checked' : ''}> 
                        <i class="fas fa-cloud-upload-alt"></i> File
                    </label>
                    <input type="number" class="logic-input file-qty-input" name="opt_file_qty" 
                           value="${o.file_qty || 1}" min="1" max="10" placeholder="Qty" 
                           style="width:40px; display:${hasFile ? 'block' : 'none'};">
                </div>
            ` : '';

            // 2. Text Input Logic (New)
            const textLogicUI = type === 'select' ? `
                <div class="logic-config ${hasText ? 'active-text' : ''}" title="Require Text Input?">
                    <label>
                        <input type="checkbox" class="text-req-toggle" ${hasText ? 'checked' : ''}> 
                        <i class="fas fa-font"></i> Text
                    </label>
                    <input type="text" class="logic-input text-label-input" name="opt_text_label" 
                           value="${o.text_label || ''}" placeholder="Label (e.g. Name)" 
                           style="width:100px; display:${hasText ? 'block' : 'none'};">
                </div>
            ` : '';

            return `
            <div class="opt-row" style="display:flex; gap:5px; margin-bottom:5px; align-items:center;">
                <input type="text" class="form-control" name="opt_label" placeholder="Option Name" value="${o.label}" style="flex:1.5;">
                <input type="number" class="form-control" name="opt_price" placeholder="Price" value="${o.price}" style="flex:0.8;">
                
                ${fileLogicUI}
                ${textLogicUI}
                
                <button type="button" onclick="this.closest('.opt-row').remove()" style="color:#e74c3c; border:none; background:none; cursor:pointer; padding:0 8px;"><i class="fas fa-times"></i></button>
            </div>
        `}).join('');
        
        optionsHtml = `
            <div class="options-wrapper" style="margin-top:10px; background:#f8f9fa; padding:10px; border-radius:4px;">
                <label style="font-size:0.8rem; font-weight:bold; color:#2d3436;">OPTIONS LIST</label>
                <div class="opts-container">${rows}</div>
                <button type="button" class="btn-add-opt" style="font-size:0.8rem; color:#3498db; background:none; border:none; cursor:pointer; margin-top:5px; font-weight:600;">
                    <i class="fas fa-plus-circle"></i> Add New Option
                </button>
            </div>
        `;
    }

    return `
        <div class="field-card type-${type}" data-type="${type}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span class="badge" style="background:#dfe6e9; color:#2d3436; padding:2px 8px; font-size:0.75rem; border-radius:4px; font-weight:bold;">${type.toUpperCase()}</span>
                <button type="button" onclick="this.closest('.field-card').remove()" style="color:#ff7675; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
            
            <div class="row" style="display:flex; gap:10px;">
                <div style="flex:1;">
                    <label style="font-size:0.85rem; font-weight:bold;">${isHeader ? 'Section Heading' : 'Label / Question'}</label>
                    <input type="text" name="f_label" class="form-control" value="${field.label || ''}" placeholder="${isHeader ? 'e.g. Personal Details' : 'e.g. Select Size'}" style="${isHeader ? 'font-weight:bold; font-size:1.1rem;' : ''}">
                </div>
                ${!isHeader ? `
                <div style="width:100px; padding-top:25px;">
                    <label style="cursor:pointer; font-size:0.85rem; user-select:none;"><input type="checkbox" name="f_req" ${field.required ? 'checked' : ''}> Required</label>
                </div>` : ''}
            </div>
            
            ${optionsHtml}
        </div>
    `;
}

export function setupCustomFieldsEvents() {
    const container = document.getElementById('builder-area');
    if (!container) return;

    // 1. Add Field Buttons
    document.querySelectorAll('.btn-tool').forEach(btn => {
        btn.addEventListener('click', () => {
            const empty = document.getElementById('empty-msg');
            if(empty) empty.remove();
            
            const type = btn.dataset.type;
            const tempDiv = document.createElement('div');
            // Empty field structure
            tempDiv.innerHTML = renderFieldCard({ _type: type, label: '', options_list: [] });
            const newCard = tempDiv.firstElementChild;
            container.appendChild(newCard);
            
            // Auto-add first option row for Dropdown/Radio/Checkbox
            if(['select','radio','checkbox_group'].includes(type)) {
                addOptionRow(newCard.querySelector('.opts-container'));
            }
        });
    });

    // 2. Add Option Button Listener
    container.addEventListener('click', (e) => {
        if (e.target.closest('.btn-add-opt')) {
            const wrapper = e.target.closest('.options-wrapper');
            addOptionRow(wrapper.querySelector('.opts-container'));
        }
    });

    // 3. Logic Toggle Listener (File & Text)
    container.addEventListener('change', (e) => {
        // A. File Toggle
        if (e.target.classList.contains('file-req-toggle')) {
            const wrapper = e.target.closest('.logic-config');
            const input = wrapper.querySelector('.file-qty-input');
            toggleLogicInput(e.target.checked, wrapper, input, '1');
        }
        
        // B. Text Toggle
        if (e.target.classList.contains('text-req-toggle')) {
            const wrapper = e.target.closest('.logic-config');
            const input = wrapper.querySelector('.text-label-input');
            // Add 'active-text' class for green color
            if(e.target.checked) wrapper.classList.add('active-text'); 
            else wrapper.classList.remove('active-text');
            
            toggleLogicInput(e.target.checked, wrapper, input, '');
        }
    });
}

function toggleLogicInput(isChecked, wrapper, input, defaultValue) {
    if (isChecked) {
        wrapper.classList.add('active');
        input.style.display = 'block';
        if(defaultValue) input.value = input.value || defaultValue;
        input.focus();
    } else {
        wrapper.classList.remove('active');
        input.style.display = 'none';
        input.value = defaultValue === '1' ? 0 : ''; // Reset value to avoid saving
    }
}

function addOptionRow(container) {
    const fieldCard = container.closest('.field-card');
    const type = fieldCard ? fieldCard.dataset.type : 'select';

    // Show Logics ONLY for Select
    const logicHTML = type === 'select' ? `
        <div class="logic-config" title="Require File?">
            <label><input type="checkbox" class="file-req-toggle"><i class="fas fa-cloud-upload-alt"></i> File</label>
            <input type="number" class="logic-input file-qty-input" name="opt_file_qty" value="1" min="1" max="10" placeholder="Qty" style="width:40px; display:none;">
        </div>
        <div class="logic-config" title="Require Text?">
            <label><input type="checkbox" class="text-req-toggle"><i class="fas fa-font"></i> Text</label>
            <input type="text" class="logic-input text-label-input" name="opt_text_label" placeholder="Label" style="width:100px; display:none;">
        </div>
    ` : '';

    const div = document.createElement('div');
    div.className = 'opt-row';
    div.style.cssText = 'display:flex; gap:5px; margin-bottom:5px; align-items:center; animation:fadeIn 0.2s;';
    div.innerHTML = `
        <input type="text" class="form-control" name="opt_label" placeholder="Option Name" style="flex:1.5;">
        <input type="number" class="form-control" name="opt_price" placeholder="Price" style="flex:0.8;">
        ${logicHTML}
        <button type="button" onclick="this.closest('.opt-row').remove()" style="color:#e74c3c; border:none; background:none; cursor:pointer; padding:0 8px;"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(div);
    div.querySelector('input').focus();
}
