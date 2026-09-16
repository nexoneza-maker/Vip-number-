VIP Number Store — Consent Viewer (fixed WebRTC version)

IMPORTANT:
- Do NOT open public/store/index.html directly from a phone file manager. If Chrome shows a content://... address, browser camera/microphone/screen permissions may not work and the WebSocket server is not running.
- Run the Node server and open the site from its server address.
- For internet access, deploy the project behind HTTPS/WSS. getDisplayMedia/getUserMedia require a secure context on normal public sites.

Local test:
1. Install Node.js 18+.
2. Extract the ZIP.
3. Open a terminal in the extracted folder.
4. Run: npm install
5. Run: npm start
6. Open http://localhost:8787/store/ on the sharing device.
7. Open http://localhost:8787/viewer/ on the viewer device.
8. Keep the viewer page open.
9. On the store page, tap Purchase / Connect -> Screen Share -> choose a screen/window/tab and press Share/Allow when Chrome asks.

The fixed version includes:
- WebSocket role registration so the viewer is discovered even if it was opened first.
- WebRTC offer/answer handling on both sides.
- ICE candidate handling/queueing.
- Clear error messages when the page is opened as content:// or without a secure context.

The browser's native permission UI is intentionally preserved. The system cannot and should not bypass the user's screen-sharing permission.
