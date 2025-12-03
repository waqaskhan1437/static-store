/**
 * Tab: Custom Form Builder & Photo Options
 * Zimmedari: User inputs (Text, Select, File) aur Photo Quantity define karna.
 */

export function renderCustomFields(data = {}) {
    const customForm = data.customForm || [];
    const photoOptions = data.photoOptions || ['1:Free', '2:$5'];

    return `
        <!-- PHOTO OPTIONS SECTION -->
        <div class="form-group" style="background:#f0f8ff; padding:15px; border-radius:8px; border:1px solid #dbeafe;">
            <label style="color:#2c3e50; font-weight:700;">Photo Quantity Options</label>
            <p class="helper-text">Format: <code>Quantity:PriceLabel</code> (Comma separated). Example: <code>1:Free, 2:$5, 5:$10</code></p>
            <input type="text" name="photoOptions" class="form-control" 
                   value="${photoOptions.join(', ')}" 
                   placeholder="1:Free, 2:$5, 4:$10">
        </div>

        <hr style="margin: 25px 0; border:0; border-top:1px solid #eee;">

        <!-- FORM BUILDER SECTION -->
        <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <label style="margin:0;">Customer Input Form</label>
                <button type="button" id="btn-add-field" class="btn btn-primary" style="font-size:0.8rem;">
                    <i class="fas fa-plus"></i> Add Field
                </button>
            </div>
            
            <div id="builder-container" style="display:flex; flex-direction:column; gap:15px;">
                <!-- Existing Fields yahan aayenge -->
                ${customForm.map((field, idx) => generateFieldRow(field, idx)).join('')}
            </div>
        </div>
    `;
}

/**
 * Single Field Row HTML Generator
 */
function generateFieldRow(field = {}, index = Date.now()) {
    const type = field._type || 'textField';
    
    return `
        <div class="builder-row" data-id="${index}" style="background:white; border:1px solid #ddd; padding:15px; border-radius:6px; position:relative;">
            
            <!-- Header: Type & Remove -->
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <select name="field_type[]" class="form-control field-type-selector" style="width:auto; padding:5px; font-weight:bold;">
                    <option value="textField" ${type === 'textField' ? 'selected' : ''}>Text Input</option>
                    <option value="textAreaField" ${type === 'textAreaField' ? 'selected' : ''}>Text Area (Long)</option>
                    <option value="selectField" ${type === 'selectField' ? 'selected' : ''}>Dropdown List</option>
                    <option value="radioField" ${type === 'radioField' ? 'selected' : ''}>Radio Buttons</option>
                    <option value="checkboxField" ${type === 'checkboxField' ? 'selected' : ''}>Checkbox (Single)</option>
                    <option value="fileUploadField" ${type === 'fileUploadField' ? 'selected' : ''}>File Upload</option>
                </select>
                <button type="button" class="btn-remove" onclick="this.closest('.builder-row').remove()" style="color:red;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Inputs: Label, Placeholder, etc -->
            <div class="row" style="display:flex; gap:10px; flex-wrap:wrap;">
                <input type="text" name="field_label[]" class="form-control" placeholder="Label (e.g. Your Name)" value="${field.label || ''}" style="flex:1;">
                <input type="text" name="field_placeholder[]" class="form-control" placeholder="Placeholder / Hint" value="${field.placeholder || ''}" style="flex:1;">
            </div>

            <!-- Options Input (Hidden for Text/File) -->
            <div class="options-container" style="margin-top:10px; display:${['selectField', 'radioField'].includes(type) ? 'block' : 'none'};">
                <label style="font-size:0.8rem; color:#666;">Options (Comma separated):</label>
                <input type="text" name="field_options[]" class="form-control" placeholder="Red, Blue, Green" value="${field.options || ''}">
            </div>

            <!-- Settings -->
            <div style="margin-top:10px; display:flex; align-items:center; gap:10px;">
                <label style="font-size:0.9rem; cursor:pointer;">
                    <input type="checkbox" name="field_required[]" value="true" ${field.required ? 'checked' : ''}> Required?
                </label>
            </div>
        </div>
    `;
}

/**
 * Events Setup
 */
export function setupCustomFieldsEvents() {
    const addBtn = document.getElementById('btn-add-field');
    const container = document.getElementById('builder-container');

    if (addBtn && container) {
        addBtn.addEventListener('click', () => {
            const newRow = generateFieldRow({ _type: 'textField' }, Date.now());
            container.insertAdjacentHTML('beforeend', newRow);
            setupTypeChangeListeners(container.lastElementChild);
        });
    }

    // Attach listeners to existing rows
    if (container) {
        Array.from(container.children).forEach(row => setupTypeChangeListeners(row));
    }
}

/**
 * Helper: Type change par "Options" input dikhana/chupana
 */
function setupTypeChangeListeners(rowElement) {
    const select = rowElement.querySelector('.field-type-selector');
    const optionsDiv = rowElement.querySelector('.options-container');

    if (select && optionsDiv) {
        select.addEventListener('change', (e) => {
            const val = e.target.value;
            if (['selectField', 'radioField'].includes(val)) {
                optionsDiv.style.display = 'block';
            } else {
                optionsDiv.style.display = 'none';
            }
        });
    }
}

/**
 * Form Data ko Process karne ke liye Helper (Save ke waqt kaam ayega)
 * Note: Kyunke form fields arrays mein hain, unhein objects mein convert karna hoga.
 */
export function processCustomFieldsData(formData) {
    // Note: This logic belongs in the main `product-form.js` but documented here for understanding.
    // We will handle the array mapping in `product-form.js`
}
