/**
 * Tab 2: Media & Description
 * Handles Description editor and Image/Video links.
 * FIXED: Strictly English Text & Comments
 */

export function renderMedia(data = {}) {
    // Convert images array to string (one URL per line)
    const imagesVal = data.images ? data.images.join('\n') : '';

    return `
        <div class="form-group">
            <label style="font-weight:600; margin-bottom:5px; display:block;">Product Description</label>
            <textarea name="description" class="form-control" rows="5" placeholder="Enter full product details here...">${data.description || ''}</textarea>
        </div>

        <div class="form-group">
            <label style="font-weight:600; margin-bottom:5px; display:block;">SEO Description (Short)</label>
            <input type="text" name="seoDescription" class="form-control" 
                   value="${data.seoDescription || ''}" placeholder="Summary for search engines (Google)...">
        </div>

        <div class="form-group">
            <label style="font-weight:600; margin-bottom:5px; display:block;">Image URLs (One per line) *</label>
            <textarea name="images" class="form-control" style="font-family: monospace; white-space: pre; height:120px;" 
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" required>${imagesVal}</textarea>
            <p class="helper-text" style="color:#666; font-size:0.85rem; margin-top:5px;">
                Enter direct image links. The first image will be the main product image.
            </p>
        </div>

        <div class="form-group">
            <label style="font-weight:600; margin-bottom:5px; display:block;">Video URL (Optional)</label>
            <input type="url" name="video_url" class="form-control" 
                   value="${data.video_url || ''}" placeholder="https://example.com/video.mp4">
        </div>
    `;
}

// Event listener function (Placeholder for future logic)
export function setupMediaEvents() {
    // Future: Image preview logic can be implemented here
}
