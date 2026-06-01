# 📷 Camera Translation Troubleshooting Guide

## Quick Fixes

### 1. **Check Browser Permissions**
- Click the camera icon in your browser's address bar
- Select "Allow" for camera access
- Refresh the page after granting permission

### 2. **Use HTTPS or Localhost**
- Modern browsers require HTTPS for camera access
- Try accessing via: `https://your-domain.com`
- Or use localhost: `http://localhost` or `http://127.0.0.1`

### 3. **Test Your Camera**
- Open `camera-test.html` in your browser
- Run all diagnostic tests
- Follow the recommendations provided

## Common Issues & Solutions

### ❌ "Camera not opening"
**Causes:**
- Browser permissions denied
- Camera being used by another app
- Not using HTTPS

**Solutions:**
1. Grant camera permissions in browser settings
2. Close other apps using the camera (Zoom, Skype, etc.)
3. Use HTTPS or localhost
4. Try incognito/private browsing mode

### ❌ "Permission denied"
**Solutions:**
1. Click the camera icon in address bar → Allow
2. Go to browser settings → Privacy → Camera → Allow for this site
3. Restart browser and try again

### ❌ "No camera found"
**Solutions:**
1. Check if camera is connected (external webcam)
2. Update camera drivers
3. Try a different browser
4. Check device manager (Windows) or system preferences (Mac)

### ❌ "Camera not supported"
**Solutions:**
1. Update your browser to the latest version
2. Try Chrome, Firefox, Safari, or Edge
3. Check if WebRTC is enabled in browser settings

## Browser-Specific Instructions

### 🌐 **Chrome**
1. Click the lock/camera icon in address bar
2. Select "Allow" for camera
3. Settings → Privacy and security → Site Settings → Camera → Allow

### 🦊 **Firefox**
1. Click the shield icon in address bar
2. Turn off "Enhanced Tracking Protection" for this site
3. Allow camera access when prompted

### 🧭 **Safari**
1. Safari → Preferences → Websites → Camera
2. Select "Allow" for your site
3. Refresh the page

### 📱 **Mobile Browsers**
1. Check app permissions in device settings
2. Allow camera access for your browser app
3. Try both portrait and landscape modes

## Testing Steps

1. **Open Diagnostic Tool:**
   ```
   Open camera-test.html in your browser
   ```

2. **Run All Tests:**
   - Browser compatibility ✅
   - Camera permissions ✅
   - HTTPS check ✅
   - Available cameras ✅
   - OCR libraries ✅

3. **Check Results:**
   - All green = Camera should work
   - Any red = Follow the specific fix for that issue

## Advanced Troubleshooting

### 🔧 **Clear Browser Data**
1. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Select "Cookies and site data" and "Cached images and files"
3. Clear data and restart browser

### 🔧 **Reset Camera Permissions**
1. Go to browser settings
2. Find "Site Settings" or "Permissions"
3. Reset camera permissions for the site
4. Refresh and allow access again

### 🔧 **Check Antivirus/Firewall**
- Some security software blocks camera access
- Add your browser to the exception list
- Temporarily disable to test

### 🔧 **Hardware Issues**
- Try a different USB port (external camera)
- Test camera in other applications
- Update device drivers
- Check camera privacy settings in Windows 10/11

## Error Messages & Meanings

| Error | Meaning | Solution |
|-------|---------|----------|
| `NotAllowedError` | Permission denied | Grant camera access |
| `NotFoundError` | No camera detected | Check hardware connection |
| `NotSupportedError` | Browser doesn't support camera | Update browser |
| `NotReadableError` | Camera in use by another app | Close other camera apps |
| `OverconstrainedError` | Camera settings not supported | Try different resolution |

## Still Not Working?

### 📞 **Contact Information**
- Create an issue with your test results
- Include browser version and operating system
- Attach screenshot of diagnostic test results

### 🔄 **Alternative Solutions**
1. **Use Upload Feature:** Click "Upload Image" instead of camera
2. **Try Different Device:** Test on phone/tablet/different computer
3. **Use Different Browser:** Chrome usually has best camera support

### 📋 **Information to Provide**
When reporting issues, include:
- Operating system (Windows 10, macOS, etc.)
- Browser name and version
- Camera type (built-in, external USB, etc.)
- Error messages from diagnostic tool
- Screenshot of the issue

## Prevention Tips

1. **Keep Browser Updated:** Always use the latest version
2. **Regular Permissions Check:** Periodically verify camera permissions
3. **Use Supported Browsers:** Chrome, Firefox, Safari, Edge work best
4. **HTTPS Always:** Host your site with SSL certificate
5. **Test Regularly:** Use the diagnostic tool to catch issues early

---

💡 **Pro Tip:** Bookmark the `camera-test.html` page for quick troubleshooting!