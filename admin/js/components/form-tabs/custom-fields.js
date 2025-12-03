/**
 * Advanced Form Builder (Globo Style - 2025)
 * Zimmedari: 'Smart Presets' ke zariye form banana asaan karna.
 */

export function renderCustomFields(data = {}) {
    const customForm = data.customForm || [];

    return `
        <div class="form-group">
            <label style="font-size:1.1rem; color:#2c3e50; display:block; margin-bottom:10px;">
                <i class="fas fa-magic"></i> Smart Form Builder
            </label>
            
            <!-- Quick Action Toolbar -->
            <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; background:#f8f9fa; padding:15px; border-radius:8px; border:1px solid #e9ecef;">
                <button type="button" class="btn-preset btn-outline" data-type="text" data-label="Full Name">
                    <i class="fas fa-font"></i> Text
                </button>
                <button type="button" class="btn-preset btn-outline" data-type="dropdown" data-preset="size">
                    <i class="fas fa-tshirt"></i> Size
                </button>
                <button type="button" class="btn-preset btn-outline" data-type="radio" data-preset="color">
                    <i class="fas fa-palette"></i> Color
                </button>
                <button type="button" class="btn-preset btn-outline" data-type="file" data-label="Upload Photo">
                    <i class="fas fa-cloud-upload-alt"></i> Upload
                </button>
                <button type="button" class="btn-preset btn-outline" data-type="checkbox_group" data-preset="gift">
                    <i class="fas fa-gift"></i> Add-ons
                </button>
            </div>

            <div id="builder-container" style="display:flex; flex-direction:column; gap:15px;">
                ${customForm.length === 0 ? '<p class="empty-msg" style="text-align:center; color:#999;">Click a button above to add fields.</p>' : ''}
                ${customForm.map((field, idx) => generateFieldRow(field, idx)).join('')}
            </div>
        </div>
        
        <style>
            .btn-outline { background:white; border:1px solid #ddd; padding:8px 15px; cursor:pointer; border-radius:20px; font-size:0.9rem; transition:0.2s; }
            .btn-outline:hover { background:var(--primary-color); color:white; border-color:var(--primary-color); transform:translateY(-2px); box-shadow:0 3px 5px rgba(0,0,0,0.1); }
            .builder-row { animation: slideDown 0.3s ease-out; }
            @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        </style>
    `;
}

function generateFieldRow(field = {}, index = Date.now()) {
    const type = field._type || 'text';
    
    // Auto-detect if options should be shown
    const showOptions = ['dropdown', 'radio', 'checkbox_group', 'photo_quantity'].includes(type);

    return `
        <div class="builder-row" style="background:white; border:1px solid #dfe6e9; padding:20px; border-radius:8px; position:relative; box-shadow:0 2px 5px rgba(0,0,0,0.02);">
            <!-- Top Right Delete -->
            <button type="button" onclick="this.closest('.builder-row').remove()" 
                    style="position:absolute; top:15px; right:15px; color:#ff7675; border:none; background:none; cursor:pointer; font-size:1.1rem;">
                <i class="fas fa-times-circle"></i>
            </button>

            <div style="display:flex; gap:15px; align-items:flex-start;">
                <!-- Icon based on type -->
                <div style="background:#f1f2f6; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#636e72;">
                    <i class="fas ${getFieldIcon(type)}"></i>
                </div>

                <div style="flex:1;">
                    <div class="row" style="display:flex; gap:10px; margin-bottom:10px;">
                        <div style="flex:2;">
                            <label style="font-size:0.8rem; font-weight:bold; color:#b2bec3;">LABEL</label>
                            <input type="text" name="field_label[]" class="form-control" value="${field.label || ''}" style="font-weight:600;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.8rem; font-weight:bold; color:#b2bec3;">TYPE</label>
                            <input type="hidden" name="field_type[]" value="${type}">
                            <div style="padding:10px; background:#f8f9fa; border-radius:4px; font-size:0.9rem; color:#2d3436;">
                                ${formatTypeLabel(type)}
                            </div>
                        </div>
                    </div>

                    <!-- Options Area (Condition based) -->
                    <div class="options-container" style="display:${showOptions ? 'block' : 'none'}; background:#f0f3f7; padding:10px; border-radius:6px; margin-bottom:10px;">
                        <label style="font-size:0.8rem; font-weight:bold; color:#636e72;">OPTIONS (Format: Name:Price)</label>
                        <input type="text" name="field_options[]" class="form-control" 
                               value="${field.options || ''}" placeholder="Option 1:0, Option 2:500">
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <input type="text" name="field_placeholder[]" class="form-control" 
                               value="${field.placeholder || ''}" placeholder="Hint text for customer..." style="width:60%; font-size:0.9rem;">
                        
                        <label style="cursor:pointer; font-size:0.9rem; display:flex; align-items:center; gap:5px;">
                            <input type="checkbox" name="field_required[]" value="true" ${field.required ? 'checked' : ''}> Required
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helpers for Icons & Labels
function getFieldIcon(type) {
    const icons = { text: 'fa-font', dropdown: 'fa-list', radio: 'fa-dot-circle', checkbox_group: 'fa-check-square', file: 'fa-cloud-upload-alt' };
    return icons[type] || 'fa-cog';
}

function formatTypeLabel(type) {
    return type.replace(/_/g, ' ').toUpperCase();
}

/**
 * Smart Event Listeners
 */
export function setupCustomFieldsEvents() {
    const container = document.getElementById('builder-container');
    const presets = document.querySelectorAll('.btn-preset');

    if (presets.length > 0 && container) {
        presets.forEach(btn => {
            btn.addEventListener('click', () => {
                // Clear empty message
                const emptyMsg = container.querySelector('.empty-msg');
                if(emptyMsg) emptyMsg.remove();

                // Logic for Presets
                const type = btn.dataset.type;
                const preset = btn.dataset.preset;
                let data = { _type: type, label: btn.dataset.label || 'New Field', required: false };

                // Auto-Fill Magic
                if (preset === 'size') {
                    data.label = 'Select Size';
                    data.options = 'Small:0, Medium:0, Large:0, XL:50';
                } else if (preset === 'color') {
                    data.label = 'Select Color';
                    data.options = 'Red:0, Blue:0, Black:0';
                } else if (preset === 'gift') {
                    data.label = 'Add-ons';
                    data.options = 'Gift Wrap:150, Express Delivery:300';
                }

                container.insertAdjacentHTML('beforeend', generateFieldRow(data, Date.now()));
            });
        });
    }
}
