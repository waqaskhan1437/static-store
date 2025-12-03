/**
 * Professional Form Builder (Globo Style 2025)
 * Features: Groups (Headings), Options with Price, Visual Editor
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
                <button type="button" class="btn-tool" data-type="header"><i class="fas fa-heading"></i> Heading/Group</button>
                <button type="button" class="btn-tool" data-type="text"><i class="fas fa-font"></i> Text</button>
                <button type="button" class="btn-tool" data-type="email"><i class="fas fa-envelope"></i> Email</button>
                <button type="button" class="btn-tool" data-type="textarea"><i class="fas fa-align-left"></i> Long Text</button>
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
        const rows = opts.map(o => `
            <div class="opt-row" style="display:flex; gap:5px; margin-bottom:5px;">
                <input type="text" class="form-control" name="opt_label" placeholder="Option Name (e.g. Red)" value="${o.label}" style="flex:2;">
                <input type="number" class="form-control" name="opt_price" placeholder="Price" value="${o.price}" style="flex:1;">
                <button type="button" onclick="this.parentElement.remove()" style="color:#e74c3c; border:none; background:none; cursor:pointer;"><i class="fas fa-times"></i></button>
            </div>
        `).join('');
        
        optionsHtml = `
            <div class="options-wrapper" style="margin-top:10px; background:#f8f9fa; padding:10px; border-radius:4px;">
                <label style="font-size:0.8rem; font-weight:bold;">OPTIONS & PRICES</label>
                <div class="opts-container">${rows}</div>
                <button type="button" class="btn-add-opt" style="font-size:0.8rem; color:#3498db; background:none; border:none; cursor:pointer; margin-top:5px;">
                    <i class="fas fa-plus-circle"></i> Add Option
                </button>
            </div>
        `;
    }

    return `
        <div class="field-card type-${type}" data-type="${type}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span class="badge" style="background:#dfe6e9; color:#2d3436; padding:2px 8px; font-size:0.75rem; border-radius:4px;">${type.toUpperCase()}</span>
                <button type="button" onclick="this.closest('.field-card').remove()" style="color:#ff7675; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
            
            <div class="row" style="display:flex; gap:10px;">
                <div style="flex:1;">
                    <label style="font-size:0.85rem; font-weight:bold;">${isHeader ? 'Section Heading' : 'Label'}</label>
                    <input type="text" name="f_label" class="form-control" value="${field.label || ''}" placeholder="${isHeader ? 'e.g. Personal Details' : 'e.g. Your Name'}" style="${isHeader ? 'font-weight:bold; font-size:1.1rem;' : ''}">
                </div>
                ${!isHeader ? `
                <div style="width:100px; padding-top:25px;">
                    <label style="cursor:pointer; font-size:0.85rem;"><input type="checkbox" name="f_req" ${field.required ? 'checked' : ''}> Required</label>
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
            tempDiv.innerHTML = renderFieldCard({ _type: type, label: '', options_list: [] });
            const newCard = tempDiv.firstElementChild;
            container.appendChild(newCard);
            
            // Auto-add first option for list types
            if(['select','radio','checkbox_group'].includes(type)) {
                addOptionRow(newCard.querySelector('.opts-container'));
            }
        });
    });

    // 2. Event Delegation for "Add Option" inside cards
    container.addEventListener('click', (e) => {
        if (e.target.closest('.btn-add-opt')) {
            const wrapper = e.target.closest('.options-wrapper');
            addOptionRow(wrapper.querySelector('.opts-container'));
        }
    });
}

function addOptionRow(container) {
    const div = document.createElement('div');
    div.className = 'opt-row';
    div.style.cssText = 'display:flex; gap:5px; margin-bottom:5px; animation:fadeIn 0.2s;';
    div.innerHTML = `
        <input type="text" class="form-control" name="opt_label" placeholder="New Option" style="flex:2;">
        <input type="number" class="form-control" name="opt_price" placeholder="0" style="flex:1;">
        <button type="button" onclick="this.parentElement.remove()" style="color:#e74c3c; border:none; background:none; cursor:pointer;"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(div);
    div.querySelector('input').focus();
}
