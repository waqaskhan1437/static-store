/**
 * Advanced Form Builder (2025 Standard)
 * Zimmedari: Complex fields generate karna (Addons, Pricing, Logic).
 */

export function renderCustomFields(data = {}) {
    const customForm = data.customForm || [];

    return `
        <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <label style="font-size:1.1rem; color:#2c3e50;">Dynamic Form Builder</label>
                <button type="button" id="btn-add-field" class="btn btn-primary" style="font-size:0.8rem;">
                    <i class="fas fa-plus"></i> Add New Field
                </button>
            </div>
            
            <p class="helper-text" style="margin-bottom:15px; background:#eef; padding:10px; border-radius:4px;">
                <strong>Tip:</strong> For options with price, use format <code>Name:Price</code>. Example: <code>Red:0, Blue:500</code>.
            </p>

            <div id="builder-container" style="display:flex; flex-direction:column; gap:15px;">
                ${customForm.map((field, idx) => generateFieldRow(field, idx)).join('')}
            </div>
        </div>
    `;
}

function generateFieldRow(field = {}, index = Date.now()) {
    const type = field._type || 'text';
    
    return `
        <div class="builder-row" style="background:white; border:1px solid #ddd; padding:15px; border-radius:6px; border-left:4px solid var(--primary-color);">
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <select name="field_type[]" class="form-control field-type-selector" style="font-weight:bold;">
                    <optgroup label="Basic Inputs">
                        <option value="text" ${type === 'text' ? 'selected' : ''}>Text Input</option>
                        <option value="textarea" ${type === 'textarea' ? 'selected' : ''}>Text Area (Long)</option>
                        <option value="file" ${type === 'file' ? 'selected' : ''}>File Upload</option>
                    </optgroup>
                    <optgroup label="Advanced & Pricing">
                        <option value="dropdown" ${type === 'dropdown' ? 'selected' : ''}>Dropdown List</option>
                        <option value="radio" ${type === 'radio' ? 'selected' : ''}>Radio Buttons (Single)</option>
                        <option value="checkbox_group" ${type === 'checkbox_group' ? 'selected' : ''}>Add-ons Group (Multi + Price)</option>
                        <option value="photo_quantity" ${type === 'photo_quantity' ? 'selected' : ''}>Photo Quantity Selector</option>
                    </optgroup>
                </select>
                <button type="button" onclick="this.closest('.builder-row').remove()" style="color:red; border:none; background:none; cursor:pointer;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>

            <div class="row" style="display:flex; gap:10px;">
                <input type="text" name="field_label[]" class="form-control" placeholder="Label (e.g. Choose Color)" value="${field.label || ''}" required style="flex:1;">
                <input type="text" name="field_placeholder[]" class="form-control" placeholder="Hint text" value="${field.placeholder || ''}" style="flex:1;">
            </div>

            <!-- Options Input (Hidden for simple text fields) -->
            <div class="options-container" style="margin-top:10px; display:${['text','textarea','file'].includes(type) ? 'none' : 'block'};">
                <label style="font-size:0.8rem; color:#666;">Options (Format: <code>OptionName:Price</code> comma separated):</label>
                <input type="text" name="field_options[]" class="form-control" 
                       placeholder="e.g. Small:0, Medium:200, Large:500" value="${field.options || ''}">
            </div>

            <div style="margin-top:10px;">
                <label style="font-size:0.9rem; cursor:pointer;">
                    <input type="checkbox" name="field_required[]" value="true" ${field.required ? 'checked' : ''}> Required Field?
                </label>
            </div>
        </div>
    `;
}

export function setupCustomFieldsEvents() {
    const addBtn = document.getElementById('btn-add-field');
    const container = document.getElementById('builder-container');

    if (addBtn && container) {
        addBtn.addEventListener('click', () => {
            container.insertAdjacentHTML('beforeend', generateFieldRow({_type:'text'}, Date.now()));
            setupTypeListener(container.lastElementChild);
        });
    }
    // Attach listeners to existing
    document.querySelectorAll('.builder-row').forEach(row => setupTypeListener(row));
}

function setupTypeListener(row) {
    const select = row.querySelector('.field-type-selector');
    const optDiv = row.querySelector('.options-container');
    select.addEventListener('change', (e) => {
        const val = e.target.value;
        optDiv.style.display = ['text', 'textarea', 'file'].includes(val) ? 'none' : 'block';
        
        // Auto-placeholder for guidance
        const optInput = optDiv.querySelector('input');
        if(val === 'photo_quantity') optInput.placeholder = "1 Photo:0, 2 Photos:500, 5 Photos:1000";
        else if(val === 'checkbox_group') optInput.placeholder = "Gift Wrap:100, Fast Delivery:500";
    });
}
