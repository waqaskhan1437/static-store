/**
 * Tab 2: Media & Description
 * Description editor aur Images/Video links handle karta hai.
 */

export function renderMedia(data = {}) {
    // Agar images array hai to string bana lo, warna empty
    const imagesVal = data.images ? data.images.join('\n') : '';

    return `
        <div class="form-group">
            <label>Product Description</label>
            <textarea name="description" class="form-control" placeholder="Product details...">${data.description || ''}</textarea>
        </div>

        <div class="form-group">
            <label>SEO Description (Short)</label>
            <input type="text" name="seoDescription" class="form-control" 
                   value="${data.seoDescription || ''}" placeholder="For search engines...">
        </div>

        <div class="form-group">
            <label>Image URLs (One per line) *</label>
            <textarea name="images" class="form-control" style="font-family: monospace;" 
                      placeholder="https://example.com/img1.jpg\nhttps://example.com/img2.jpg" required>${imagesVal}</textarea>
            <p class="helper-text">Enter direct image links. First one will be main image.</p>
        </div>

        <div class="form-group">
            <label>Video URL (Optional)</label>
            <input type="url" name="video_url" class="form-control" 
                   value="${data.video_url || ''}" placeholder="YouTube or MP4 link">
        </div>
    `;
}

// Filhal is tab ke liye koi khaas event listener zaroori nahi hai
// lekin hum function bana dete hain consistency ke liye.
export function setupMediaEvents() {
    // Future: Image preview logic yahan aa sakti hai
}
