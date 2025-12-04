/**
 * Tab 2: Media & SEO
 * Handles Images, Videos, Description & SEO Metadata.
 */

export function renderMedia(data = {}) {
    const imagesVal = data.images ? data.images.join('\n') : '';

    return `
        <div class="form-group">
            <label style="font-weight:600; margin-bottom:5px; display:block;">Product Description</label>
            <textarea name="description" class="form-control" rows="5" placeholder="Enter full product details here...">${data.description || ''}</textarea>
        </div>

        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
        
        <h3 style="margin-bottom: 15px; color: #2c3e50;"><i class="fas fa-search"></i> SEO Settings</h3>

        <div class="form-group">
            <label style="font-weight:600; margin-bottom:5px; display:block;">SEO Meta Title</label>
            <input type="text" name="seoTitle" class="form-control" 
                   value="${data.seoTitle || ''}" placeholder="Title that appears on Google Search">
        </div>

        <div class="form-group">
            <label style="font-weight:600; margin-bottom:5px; display:block;">Meta Description</label>
            <textarea name="seoDescription" class="form-control" rows="2" 
                      placeholder="Short summary for search results (150-160 characters)...">${data.seoDescription || ''}</textarea>
        </div>

        <div class="form-group">
            <label style="font-weight:600; margin-bottom:5px; display:block;">Focus Keywords (Comma Separated)</label>
            <input type="text" name="seoKeywords" class="form-control" 
                   value="${data.seoKeywords || ''}" placeholder="e.g. custom gift, video message, birthday ideas">
        </div>

        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">

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

export function setupMediaEvents() {
    // Future: Logic for char count on meta description can go here
}
